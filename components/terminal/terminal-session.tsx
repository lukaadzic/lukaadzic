"use client";

import {
	type CSSProperties,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	EVERYTHING_COMMAND,
	KNOWN_COMMANDS,
	resolveCommand,
	SUGGESTED_COMMANDS,
} from "@/components/terminal/commands";
import { PromptLine } from "@/components/terminal/prompt-line";

// Stable fake session banner — never derived from Date.now() at render, so
// server and client always agree and there's no hydration mismatch.
const LAST_LOGIN = "Last login: Thu Nov 14 09:32:07 on ttys003";

const CHIP_CHAR_DELAY_MS = 20;
const WELCOME_CHAR_DELAY_MS = 55;
const GROUP_LEAVE_MS = 120;

type Entry = {
	id: number;
	command: string;
	output: ReactNode;
};

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** ±40% random jitter around a base delay, so auto-typing feels human. */
function jitter(baseMs: number): number {
	const factor = 1 + (Math.random() * 2 - 1) * 0.4;
	return Math.max(1, Math.round(baseMs * factor));
}

const LEAVING_STYLE: CSSProperties = {
	opacity: 0,
	transform: "translateY(-4px)",
	transition: "opacity 120ms ease, transform 120ms ease",
};

const ENTERING_STYLE: CSSProperties = {
	opacity: 0,
	transform: "translateY(8px)",
};

const ENTERED_STYLE: CSSProperties = {
	opacity: 1,
	transform: "translateY(0)",
	transition:
		"opacity 280ms cubic-bezier(0.16, 1, 0.3, 1), transform 280ms cubic-bezier(0.16, 1, 0.3, 1)",
};

export function TerminalSession() {
	// The `welcome` block is set once at mount and never replaced — it stays
	// pinned above whatever command group is currently displayed.
	const [pinned, setPinned] = useState<Entry | null>(null);
	// Exactly one command group (prompt + output) is displayed at a time.
	// Running a new command swaps it out; `clear` empties it back to null.
	const [current, setCurrent] = useState<Entry | null>(null);
	const [leaving, setLeaving] = useState(false);
	const [entered, setEntered] = useState(false);

	const [inputValue, setInputValue] = useState("");
	const [animating, setAnimating] = useState(false);
	const [cursorBlink, setCursorBlink] = useState(true);
	// Flips once the opening welcome beat finishes, triggering the chips'
	// staggered fade-in. False on both server and initial client render, so
	// there's no hydration mismatch.
	const [chipsRevealed, setChipsRevealed] = useState(false);

	const genRef = useRef(0);
	const idRef = useRef(0);
	const reducedRef = useRef(false);
	const startedRef = useRef(false);
	const currentRef = useRef<Entry | null>(null);
	const commandHistoryRef = useRef<string[]>([]);
	const historyPointerRef = useRef<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const activePromptRef = useRef<HTMLDivElement>(null);

	const setCurrentEntry = useCallback((entry: Entry | null) => {
		currentRef.current = entry;
		setCurrent(entry);
	}, []);

	// Keyboard focus pops the on-screen keyboard on touch devices, so only
	// grab focus programmatically when a fine pointer (mouse/trackpad) exists.
	const focusInput = useCallback((force = false) => {
		if (force || window.matchMedia("(pointer: fine)").matches) {
			inputRef.current?.focus();
		}
	}, []);

	/** Types `text` char-by-char at the active prompt. Bumping gen fast-forwards. */
	const typeAtPrompt = useCallback(
		async (text: string, gen: number, delay: number) => {
			if (reducedRef.current) return;
			for (let i = 1; i <= text.length; i++) {
				if (genRef.current !== gen) return;
				setInputValue(text.slice(0, i));
				await sleep(jitter(delay));
			}
		},
		[],
	);

	/**
	 * Central command entry point. `typeIt` animates the command at the
	 * prompt first (chip clicks); manual Enter passes false since the text
	 * is already sitting at the prompt. Whatever is currently displayed
	 * fades out first, then the new command types in and its output fades
	 * up — exactly one group is ever on screen below the pinned welcome.
	 */
	const submit = useCallback(
		async (raw: string, typeIt: boolean) => {
			const trimmed = raw.trim();
			setAnimating(true);
			const gen = ++genRef.current;

			if (currentRef.current) {
				setLeaving(true);
				if (!reducedRef.current && genRef.current === gen) {
					await sleep(GROUP_LEAVE_MS);
				}
				setLeaving(false);
				setCurrentEntry(null);
			}

			if (typeIt) {
				await typeAtPrompt(raw, gen, CHIP_CHAR_DELAY_MS);
			}
			setInputValue("");

			if (trimmed !== "") {
				commandHistoryRef.current.push(raw);
			}
			historyPointerRef.current = null;

			const result = resolveCommand(raw, commandHistoryRef.current);
			if (result !== "clear") {
				result.sideEffect?.();
				idRef.current += 1;
				setCurrentEntry({
					id: idRef.current,
					command: raw,
					output: result.output,
				});
			}

			setAnimating(false);
			focusInput();
		},
		[focusInput, setCurrentEntry, typeAtPrompt],
	);

	// Opening beat: auto-type one short `welcome` command (~1s), then hand
	// the prompt over. With prefers-reduced-motion the output appears
	// instantly and the cursor holds steady. The result is pinned permanently.
	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;

		reducedRef.current = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reducedRef.current) {
			setCursorBlink(false);
		}

		(async () => {
			setAnimating(true);
			const gen = ++genRef.current;
			if (!reducedRef.current) {
				await sleep(250);
			}
			await typeAtPrompt("welcome", gen, WELCOME_CHAR_DELAY_MS);
			setInputValue("");
			const result = resolveCommand("welcome");
			if (result !== "clear") {
				idRef.current += 1;
				setPinned({
					id: idRef.current,
					command: "welcome",
					output: result.output,
				});
			}
			setAnimating(false);
			setChipsRevealed(true);
			focusInput();
		})();
	}, [focusInput, typeAtPrompt]);

	// Play the fade-up transition on whatever just became the displayed
	// group — mount it hidden, then flip to visible on the next frame so the
	// opacity/transform transition actually runs.
	useEffect(() => {
		if (current?.id == null) return;
		if (reducedRef.current) {
			setEntered(true);
			return;
		}
		setEntered(false);
		const raf = requestAnimationFrame(() => setEntered(true));
		return () => cancelAnimationFrame(raf);
	}, [current?.id]);

	// After the displayed group changes, keep the live prompt in view rather
	// than letting the page jump — "nearest" only scrolls if it isn't already
	// visible, and reduced motion drops the smooth scroll animation.
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-runs whenever the displayed group changes, even though the effect body only reads refs.
	useEffect(() => {
		activePromptRef.current?.scrollIntoView({
			behavior: reducedRef.current ? "auto" : "smooth",
			block: "nearest",
		});
	}, [current]);

	const fastForward = useCallback(() => {
		genRef.current++;
	}, []);

	function handleContainerClick() {
		if (animating) {
			fastForward();
			return;
		}
		focusInput(true);
	}

	function navigateHistory(direction: 1 | -1) {
		const commands = commandHistoryRef.current;
		if (commands.length === 0) return;

		const pointer = historyPointerRef.current;
		let next: number;

		if (pointer === null) {
			if (direction === 1) return;
			next = commands.length - 1;
		} else {
			next = pointer + direction;
		}

		if (next < 0) next = 0;

		if (next >= commands.length) {
			historyPointerRef.current = null;
			setInputValue("");
			return;
		}

		historyPointerRef.current = next;
		setInputValue(commands[next]);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (animating) {
			if (event.key === "Enter") {
				event.preventDefault();
				fastForward();
			}
			return;
		}

		if (event.key === "Enter") {
			event.preventDefault();
			submit(inputValue, false);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			navigateHistory(-1);
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			navigateHistory(1);
		} else if (event.key === "Tab") {
			const partial = inputValue.trim().toLowerCase();
			if (partial === "") return;
			const match = KNOWN_COMMANDS.find((command) =>
				command.toLowerCase().startsWith(partial),
			);
			if (match) {
				event.preventDefault();
				setInputValue(match);
			}
		}
	}

	function isActive(command: string): boolean {
		return (
			current?.command.trim().toLowerCase() === command.trim().toLowerCase()
		);
	}

	function chipClass(command: string, accent: boolean): string {
		const base = accent
			? "terminal-chip terminal-chip-accent"
			: "terminal-chip";
		return isActive(command) ? `${base} terminal-chip-active` : base;
	}

	function groupStyle(): CSSProperties {
		if (reducedRef.current) return {};
		if (leaving) return LEAVING_STYLE;
		return entered ? ENTERED_STYLE : ENTERING_STYLE;
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: click only focuses the input below; keyboard users can already Tab to it directly.
		<div
			role="log"
			aria-label="Terminal session"
			className="terminal-session relative font-mono text-[13px] leading-relaxed sm:text-[14px]"
			onClick={handleContainerClick}
		>
			<p className="text-faint">{LAST_LOGIN}</p>

			{pinned && (
				<div className="terminal-output-in mt-5">
					<PromptLine input={pinned.command} active={false} />
					{pinned.output && <div className="mt-1.5">{pinned.output}</div>}
				</div>
			)}

			<div className="terminal-group-container">
				{current && (
					<div key={current.id} style={groupStyle()} className="mt-5">
						<PromptLine input={current.command} active={false} />
						{current.output && <div className="mt-1.5">{current.output}</div>}
					</div>
				)}
			</div>

			<div ref={activePromptRef} className="mt-5">
				<PromptLine input={inputValue} cursor cursorBlink={cursorBlink} />
			</div>

			<div
				className={`terminal-chip-row mt-5 flex flex-wrap gap-2 ${
					chipsRevealed ? "terminal-chips-in" : ""
				}`}
			>
				{SUGGESTED_COMMANDS.map((command) => (
					<button
						key={command}
						type="button"
						disabled={animating}
						aria-pressed={isActive(command)}
						onClick={(event) => {
							event.stopPropagation();
							submit(command, true);
						}}
						className={chipClass(command, false)}
					>
						{command}
					</button>
				))}
				<button
					type="button"
					disabled={animating}
					aria-pressed={isActive(EVERYTHING_COMMAND)}
					onClick={(event) => {
						event.stopPropagation();
						submit(EVERYTHING_COMMAND, true);
					}}
					className={chipClass(EVERYTHING_COMMAND, true)}
				>
					{EVERYTHING_COMMAND}
				</button>
			</div>

			{/* Visually hidden, but focusable — captures real keystrokes so the
			 	prompt above can render the echoed text. */}
			<input
				ref={inputRef}
				value={inputValue}
				readOnly={animating}
				onChange={(event) => setInputValue(event.target.value)}
				onKeyDown={handleKeyDown}
				className="sr-only"
				aria-label="Terminal command input"
				autoComplete="off"
				autoCapitalize="off"
				autoCorrect="off"
				spellCheck={false}
			/>
		</div>
	);
}
