"use client";

import {
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	EVERYTHING_COMMAND,
	EVERYTHING_STEPS,
	resolveCommand,
	SUGGESTED_COMMANDS,
} from "@/components/terminal/commands";
import { PromptLine } from "@/components/terminal/prompt-line";

// Stable fake session banner — never derived from Date.now() at render, so
// server and client always agree and there's no hydration mismatch.
const LAST_LOGIN = "Last login: Thu Nov 14 09:32:07 on ttys003";

const CHIP_CHAR_DELAY_MS = 20;
const WELCOME_CHAR_DELAY_MS = 55;
const SEQUENCE_PAUSE_MS = 320;

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

export function TerminalSession() {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [animating, setAnimating] = useState(false);
	const [cursorBlink, setCursorBlink] = useState(true);
	const [ranCommands, setRanCommands] = useState<ReadonlySet<string>>(
		() => new Set(),
	);

	const genRef = useRef(0);
	const idRef = useRef(0);
	const reducedRef = useRef(false);
	const startedRef = useRef(false);
	const commandHistoryRef = useRef<string[]>([]);
	const historyPointerRef = useRef<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const activePromptRef = useRef<HTMLDivElement>(null);

	// Re-running a command that's already in the session replaces its previous
	// block rather than stacking a duplicate — keyed by the exact command text
	// (chip and typed invocations of the same command collide; aliases like
	// `about` vs `cat about.txt` don't, since they're different command text).
	const appendEntry = useCallback((command: string, output: ReactNode) => {
		idRef.current += 1;
		const newEntry: Entry = { id: idRef.current, command, output };
		const key = command.trim().toLowerCase();
		setEntries((prev) => {
			const deduped =
				key === ""
					? prev
					: prev.filter((entry) => entry.command.trim().toLowerCase() !== key);
			return [...deduped, newEntry];
		});
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

	const runSingle = useCallback(
		(raw: string) => {
			const result = resolveCommand(raw);
			if (result === "clear") {
				setEntries([]);
				return;
			}
			result.sideEffect?.();
			appendEntry(raw, result.output);
		},
		[appendEntry],
	);

	const runEverything = useCallback(
		async (gen: number) => {
			for (const step of EVERYTHING_STEPS) {
				await typeAtPrompt(step.command, gen, CHIP_CHAR_DELAY_MS);
				setInputValue("");
				appendEntry(step.command, step.run().output);
				if (genRef.current === gen && !reducedRef.current) {
					await sleep(SEQUENCE_PAUSE_MS);
				}
			}
		},
		[appendEntry, typeAtPrompt],
	);

	/**
	 * Central command entry point. `typeIt` animates the command at the
	 * prompt first (chip clicks); manual Enter passes false since the text
	 * is already sitting at the prompt.
	 */
	const submit = useCallback(
		async (raw: string, typeIt: boolean) => {
			const trimmed = raw.trim();
			setAnimating(true);
			const gen = ++genRef.current;

			if (typeIt) {
				await typeAtPrompt(raw, gen, CHIP_CHAR_DELAY_MS);
			}
			setInputValue("");

			if (trimmed !== "") {
				commandHistoryRef.current.push(raw);
				setRanCommands((prev) => {
					const next = new Set(prev);
					next.add(trimmed.toLowerCase());
					return next;
				});
			}
			historyPointerRef.current = null;

			if (trimmed === EVERYTHING_COMMAND) {
				appendEntry(raw, null);
				await runEverything(gen);
			} else {
				runSingle(raw);
			}

			setAnimating(false);
			focusInput();
		},
		[appendEntry, focusInput, runEverything, runSingle, typeAtPrompt],
	);

	// Opening beat: auto-type one short `welcome` command (~1s), then hand
	// the prompt over. With prefers-reduced-motion the output appears
	// instantly and the cursor holds steady.
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
			runSingle("welcome");
			setAnimating(false);
			focusInput();
		})();
	}, [focusInput, runSingle, typeAtPrompt]);

	// After a new command group renders, keep the live prompt in view rather
	// than letting the page jump — "nearest" only scrolls if it isn't already
	// visible, and reduced motion drops the smooth scroll animation.
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-runs whenever entries changes, even though the effect body only reads refs.
	useEffect(() => {
		activePromptRef.current?.scrollIntoView({
			behavior: reducedRef.current ? "auto" : "smooth",
			block: "nearest",
		});
	}, [entries]);

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

		const current = historyPointerRef.current;
		let next: number;

		if (current === null) {
			if (direction === 1) return;
			next = commands.length - 1;
		} else {
			next = current + direction;
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
		}
	}

	function chipClass(command: string, accent: boolean): string {
		const base = accent
			? "terminal-chip terminal-chip-accent"
			: "terminal-chip";
		return ranCommands.has(command) ? `${base} terminal-chip-dim` : base;
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: click only focuses the input below; keyboard users can already Tab to it directly.
		<div
			role="log"
			aria-label="Terminal session"
			className="relative font-mono text-[13px] leading-relaxed sm:text-[14px]"
			onClick={handleContainerClick}
		>
			<p className="text-faint">{LAST_LOGIN}</p>

			{entries.map((entry) => (
				<div key={entry.id} className="terminal-output-in mt-5">
					<PromptLine input={entry.command} active={false} />
					{entry.output && <div className="mt-1.5">{entry.output}</div>}
				</div>
			))}

			<div ref={activePromptRef} className="mt-5">
				<PromptLine input={inputValue} cursor cursorBlink={cursorBlink} />
			</div>

			<div className="mt-5 flex flex-wrap gap-2">
				{SUGGESTED_COMMANDS.map((command) => (
					<button
						key={command}
						type="button"
						disabled={animating}
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
