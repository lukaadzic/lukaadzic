"use client";

import {
	type CSSProperties,
	type KeyboardEvent,
	type ReactNode,
	type TransitionEvent,
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
import { LastLogin } from "@/components/terminal/last-login";
import { PromptLine } from "@/components/terminal/prompt-line";

const CHIP_CHAR_DELAY_MS = 20;
const WELCOME_CHAR_DELAY_MS = 55;
const GROUP_LEAVE_MS = 120;
/** Duration of the JS-driven FLIP height transition on the group container —
 * measured old height -> measured new height, so the window resizes as one
 * fluid motion instead of snapping (interpolate-size only lands in very new
 * Chrome, so this can't be CSS-only). */
const GROUP_HEIGHT_MS = 240;
const GROUP_HEIGHT_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

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

// Pure opacity, deliberately no transform: this block's space is reserved
// from the very first paint (see `welcomeEntry` below), so revealing it only
// ever needs to fade in — a translateY here would still move the painted
// box and show up as a layout shift even though the layout itself never
// changes.
const WELCOME_HIDDEN_STYLE: CSSProperties = {
	opacity: 0,
};

const WELCOME_REVEALED_STYLE: CSSProperties = {
	opacity: 1,
	transition: "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)",
};

export function TerminalSession() {
	// The pinned `welcome` output is pure/deterministic (no randomness, no
	// side effect — see the `welcome` renderer in commands.tsx), so it's
	// resolved once up front and mounted from the very first paint. That
	// reserves its final on-screen height immediately: the block only fades
	// its own opacity in once the typed "welcome" beat finishes, instead of
	// being inserted into the DOM later and shoving the prompt/chips below it
	// down the page.
	const [welcomeEntry] = useState<Entry>(() => {
		const result = resolveCommand("welcome");
		return {
			id: 0,
			command: "welcome",
			output: result === "clear" ? null : result.output,
		};
	});
	const [welcomeRevealed, setWelcomeRevealed] = useState(false);

	// Exactly one command group (prompt + output) is displayed at a time.
	// Running a new command swaps it out; `clear` empties it back to null.
	const [current, setCurrent] = useState<Entry | null>(null);
	const [leaving, setLeaving] = useState(false);
	const [entered, setEntered] = useState(false);

	const [inputValue, setInputValue] = useState("");
	const [animating, setAnimating] = useState(false);
	const [cursorBlink, setCursorBlink] = useState(true);
	const genRef = useRef(0);
	const idRef = useRef(0);
	const reducedRef = useRef(false);
	const startedRef = useRef(false);
	const currentRef = useRef<Entry | null>(null);
	const commandHistoryRef = useRef<string[]>([]);
	const historyPointerRef = useRef<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const activePromptRef = useRef<HTMLDivElement>(null);
	const groupContainerRef = useRef<HTMLDivElement>(null);

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
			const container = groupContainerRef.current;

			if (currentRef.current) {
				// FLIP setup: lock the container at its current on-screen height
				// before the outgoing content starts fading/unmounting, so the
				// window doesn't collapse to nothing during the leave+type gap —
				// the height only ever animates old -> new, never through zero.
				if (!reducedRef.current && container) {
					const startHeight = container.getBoundingClientRect().height;
					container.style.transition = "";
					container.style.height = `${startHeight}px`;
					container.style.overflow = "hidden";
				}

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
			} else if (!reducedRef.current && container?.style.height) {
				// `clear` really does empty the container for good — this is the
				// one case where the height is known, right now, to be heading to
				// zero rather than toward a new entry's height, so the collapse is
				// kicked off here rather than inferred from the generic effect
				// below (which would otherwise mistake the ordinary in-between
				// "old content gone, new content not mounted yet" gap of every
				// other command switch for the same thing, and collapse-then
				// -regrow instead of animating old height -> new height directly).
				requestAnimationFrame(() => {
					if (genRef.current !== gen) return;
					container.style.overflow = "hidden";
					container.style.transition = `height ${GROUP_HEIGHT_MS}ms ${GROUP_HEIGHT_EASING}`;
					container.style.height = "0px";
				});
			}

			setAnimating(false);
			focusInput();
		},
		[focusInput, setCurrentEntry, typeAtPrompt],
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
			setWelcomeRevealed(true);
			focusInput();
			return;
		}

		(async () => {
			setAnimating(true);
			const gen = ++genRef.current;
			await sleep(250);
			await typeAtPrompt("welcome", gen, WELCOME_CHAR_DELAY_MS);
			setInputValue("");
			setWelcomeRevealed(true);
			setAnimating(false);
			focusInput();
		})();
	}, [focusInput, typeAtPrompt]);

	// FLIP the group container's height whenever the displayed group changes,
	// crossfade the new content in, and only then scroll the live prompt into
	// view — so the scroll doesn't fight the still-animating height. A plain
	// CSS `transition: height` can't animate to/from `auto`, so this measures
	// pixel heights on either side of the swap and drives the transition by
	// hand; `interpolate-size` would do the same thing but only in very new
	// Chrome.
	useEffect(() => {
		const container = groupContainerRef.current;

		const scrollToPrompt = () => {
			activePromptRef.current?.scrollIntoView({
				behavior: reducedRef.current ? "auto" : "smooth",
				block: "nearest",
			});
		};

		if (!container || reducedRef.current) {
			if (container) {
				container.style.height = "";
				container.style.overflow = "";
				container.style.transition = "";
			}
			setEntered(current?.id != null);
			scrollToPrompt();
			return;
		}

		const hasLock = container.style.height !== "";

		if (current?.id == null) {
			// Emptied out — either the ordinary in-between gap of a command
			// switch (old content just unmounted, its replacement hasn't
			// mounted yet — `submit` is still holding the locked height, and
			// the next run of this effect will grow it straight to the new
			// content's height) or a genuine `clear`, whose collapse-to-zero
			// `submit` already kicked off directly (see above) since it's the
			// only place that knows for certain nothing else is coming. Either
			// way there's nothing for this branch itself to animate.
			const timeout = setTimeout(scrollToPrompt, hasLock ? GROUP_HEIGHT_MS : 0);
			return () => clearTimeout(timeout);
		}

		// New content just mounted (starts at ENTERING_STYLE — invisible but
		// already occupying its natural layout height).
		setEntered(false);
		const raf = requestAnimationFrame(() => {
			if (hasLock) {
				const newHeight = container.scrollHeight;
				container.style.overflow = "hidden";
				container.style.transition = `height ${GROUP_HEIGHT_MS}ms ${GROUP_HEIGHT_EASING}`;
				container.style.height = `${newHeight}px`;
			} else {
				container.style.height = "";
			}
			setEntered(true);
		});
		const timeout = setTimeout(scrollToPrompt, hasLock ? GROUP_HEIGHT_MS : 0);
		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(timeout);
		};
	}, [current]);

	function handleGroupTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
		if (event.target !== event.currentTarget) return;
		if (event.propertyName !== "height") return;
		const container = groupContainerRef.current;
		if (!container) return;
		// Release back to natural sizing so later content (a resize, a tick of
		// `age`, etc.) isn't stuck at a stale locked height.
		container.style.height = "";
		container.style.overflow = "";
		container.style.transition = "";
	}

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

	function welcomeStyle(): CSSProperties {
		if (reducedRef.current) return {};
		return welcomeRevealed ? WELCOME_REVEALED_STYLE : WELCOME_HIDDEN_STYLE;
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: click only focuses the input below; keyboard users can already Tab to it directly.
		<div
			role="log"
			aria-label="Terminal session"
			className="terminal-session relative font-mono text-[13px] leading-relaxed sm:text-[14px]"
			onClick={handleContainerClick}
		>
			<LastLogin />

			<div
				className="mt-5"
				style={welcomeStyle()}
				aria-hidden={welcomeRevealed ? undefined : true}
			>
				<PromptLine input={welcomeEntry.command} active={false} />
				{welcomeEntry.output && (
					<div className="mt-1.5">{welcomeEntry.output}</div>
				)}
			</div>

			<div
				ref={groupContainerRef}
				className="terminal-group-container"
				onTransitionEnd={handleGroupTransitionEnd}
			>
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

			<div className="terminal-chip-row mt-5 flex flex-wrap gap-2">
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
