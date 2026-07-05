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
	KNOWN_COMMANDS,
	resolveCommand,
	SUGGESTED_COMMANDS,
} from "@/components/terminal/commands";
import { LastLogin } from "@/components/terminal/last-login";
import { PromptLine } from "@/components/terminal/prompt-line";

const CHIP_CHAR_DELAY_MS = 20;
const WELCOME_CHAR_DELAY_MS = 55;
const GROUP_LEAVE_MS = 120;
/** Must match `[data-welcome-revealed] .welcome-line-4` (delay) and
 * `[data-welcome-revealed] .welcome-line` (duration) in globals.css — the
 * last welcome line to print, and how long its own fade takes. Used to time
 * the active-prompt reveal off the real moment printing settles rather than
 * guessing. */
const WELCOME_LAST_LINE_DELAY_MS = 280;
const WELCOME_LAST_LINE_DURATION_MS = 240;
/** Small buffer after the welcome output finishes settling, before the
 * active prompt below it fades in — keeps a beat of daylight between "output
 * done printing" and "shell hands you a fresh prompt" instead of them
 * landing in the same instant. */
const PROMPT_READY_TAIL_MS = 100;
/** How long the typed `lukaadzic ~ % welcome` line sits still, cursor gone,
 * before it clears itself — long enough to register as "the command just
 * ran," short enough not to stall the boot. */
const BOOT_COMMAND_LEAVE_BEAT_MS = 250;
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

// The welcome OUTPUT's (banner/greeting/hint) space is reserved from the
// very first paint (see `welcomeEntry` below), so the container's height
// never moves. It stays invisible while `welcome` is still typing at the
// pinned prompt line above it, and only becomes visible once that typing
// finishes — the actual motion from there is line by line via
// `.welcome-line` + `data-welcome-revealed` in globals.css, so the block
// prints top-to-bottom like a real terminal instead of rising as one slab.
// The pinned prompt line itself (the "welcome" command text) is a separate
// element with its own always-mounted `.terminal-active-prompt-in` reveal —
// see the render below — since it needs to be visible and typing-into
// before this output block appears.
const WELCOME_HIDDEN_STYLE: CSSProperties = {
	opacity: 0,
};

const WELCOME_REVEALED_STYLE: CSSProperties = {
	opacity: 1,
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
	// t=0 of the opening beat's JS clock — set in the same effect that kicks
	// off the typed `welcome` beat below, so the CSS-timed beats that follow
	// it (pinned prompt reveal, chip stagger) can anchor their
	// `animation-delay`s to real hydration time via `[data-booted] ...`
	// selectors in globals.css, instead of stylesheet-load time. On a slow
	// device that lags between paint and hydration, that's the difference
	// between the prompt/chips racing ahead of the typing they're supposed to
	// follow, and everything landing in order.
	const [booted, setBooted] = useState(false);
	// One clock, three beats, strictly top to bottom: `welcome` types at the
	// PINNED prompt line (top of the session, directly under login) instead
	// of the bottom active prompt — typing at the bottom and then having the
	// pinned block materialize above it once done used to read as the eye
	// jumping bottom-to-top. `bootTyped` is that pinned line's typed-so-far
	// substring; `inputValue` stays reserved for real user input so the two
	// never collide. `bootPhase` tracks where the boot clock is: "typing"
	// (pinned line has the cursor, `bootTyped` is live), "printing" (typing
	// done, the welcome output is staggering in below it), "done" (the
	// bottom active prompt has taken over the cursor). `promptReady` is the
	// data-attribute flag that gates the bottom prompt's CSS reveal — see
	// `finishBoot` below for when it's set.
	const [bootPhase, setBootPhase] = useState<"typing" | "printing" | "done">(
		"typing",
	);
	const [bootTyped, setBootTyped] = useState("");
	const [promptReady, setPromptReady] = useState(false);
	// The pinned `welcome` command line removes itself once it's had its
	// moment: `commandCollapsing` drives the CSS fade+collapse
	// (`.boot-command-line-leaving`), and `commandLineGone` — set once that
	// transition ends (or instantly, for reduced motion / fast-forward) —
	// stops rendering the line at all, so the settled session has no
	// `lukaadzic ~ % welcome` line left in the DOM, exactly like the command
	// ran and cleared itself.
	const [commandCollapsing, setCommandCollapsing] = useState(false);
	const [commandLineGone, setCommandLineGone] = useState(false);

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
	// Mirrors `bootPhase` for synchronous reads inside `fastForward` (a
	// `useCallback` that would otherwise close over a stale value).
	const bootPhaseRef = useRef<"typing" | "printing" | "done">("typing");
	// Holds the pending "reveal the active prompt" timeout so fast-forwarding
	// mid-boot can cancel the wait and jump straight to it instead of the
	// timer firing later on top of an already-fast-forwarded session.
	const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

	/** Types `text` char-by-char, writing each prefix through `onChar` —
	 * `setInputValue` for a real command typed at the active prompt,
	 * `setBootTyped` for the boot beat typing at the pinned prompt line
	 * instead. Bumping gen fast-forwards (the loop just bails). */
	const typeAtPrompt = useCallback(
		async (
			text: string,
			gen: number,
			delay: number,
			onChar: (value: string) => void,
		) => {
			if (reducedRef.current) return;
			for (let i = 1; i <= text.length; i++) {
				if (genRef.current !== gen) return;
				onChar(text.slice(0, i));
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
				await typeAtPrompt(raw, gen, CHIP_CHAR_DELAY_MS, setInputValue);
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

	// Reaches the last beat of the boot clock: the bottom active prompt gets
	// its cursor and fades in (`data-prompt-ready`), and the boot is over.
	// Called either by the natural timer below (real welcome-line stagger
	// has settled) or immediately by `fastForward` (mid-boot click/Enter) —
	// either way this is the single place that flips everything to the
	// "done" state.
	const finishBoot = useCallback(() => {
		revealTimeoutRef.current = null;
		bootPhaseRef.current = "done";
		setBootPhase("done");
		setPromptReady(true);
		setAnimating(false);
		focusInput();
	}, [focusInput]);

	// Opening beat: auto-type one short `welcome` command (~1s) at the PINNED
	// prompt line (top of the session, not the bottom active one), let the
	// welcome output print below it, then hand a fresh prompt over at the
	// bottom — strictly top to bottom, like a real terminal. `setBooted(true)`
	// below is t=0 of this same clock — the pinned-prompt-reveal and
	// chip-stagger CSS animations in globals.css are gated on the
	// `[data-booted]` attribute this sets on the root element, with their
	// `animation-delay`s measured from here (350ms for the pinned prompt,
	// ~1600ms+ for the chips) rather than from stylesheet-load time. That
	// keeps every beat on one clock: on a slow device, hydration (and
	// therefore this effect) can lag well behind the CSS-only window fade,
	// but once it does run, the prompt/typing/chips still land in the same
	// relative order instead of the CSS beats racing ahead of typing that
	// hasn't started yet. Un-strandable fallback: globals.css also keeps a
	// bare (ungated) copy of both rules with a long ~3s delay, so if JS
	// never runs at all the pinned prompt and chips still eventually appear
	// rather than staying invisible forever. The bottom active prompt, by
	// contrast, is gated on `data-prompt-ready` — a second flag this effect
	// sets later, once typing AND the full welcome-line print stagger have
	// actually finished, rather than off a guessed fixed delay — see
	// `finishBoot`. With prefers-reduced-motion the whole sequence appears
	// instantly, same order, and the cursor holds steady.
	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;

		reducedRef.current = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		setBooted(true);

		if (reducedRef.current) {
			setCursorBlink(false);
			setCommandLineGone(true);
			setWelcomeRevealed(true);
			bootPhaseRef.current = "done";
			setBootPhase("done");
			setPromptReady(true);
			focusInput();
			return;
		}

		(async () => {
			setAnimating(true);
			const gen = ++genRef.current;
			await sleep(500);
			if (genRef.current !== gen) return; // fast-forwarded before typing even started
			await typeAtPrompt("welcome", gen, WELCOME_CHAR_DELAY_MS, setBootTyped);
			if (genRef.current !== gen) return; // fast-forwarded mid-type; fastForward already snapped to done

			// Typing's done — the line goes static (cursor removed) and sits as
			// plain "welcome" text for a brief beat, like a real shell pausing
			// right after a command runs.
			bootPhaseRef.current = "printing";
			setBootPhase("printing");

			await sleep(BOOT_COMMAND_LEAVE_BEAT_MS);
			if (genRef.current !== gen) return; // fast-forwarded mid-beat; fastForward already snapped to done

			// The command line fades + collapses away in place while the welcome
			// output starts printing directly below it — the banner ends up
			// exactly where the command line was, as an ordinary consequence of
			// the layout reflow while the line's own height animates to zero
			// (see `.boot-command-line` in globals.css).
			setBootTyped("");
			setCommandCollapsing(true);
			setWelcomeRevealed(true);

			const tailMs =
				WELCOME_LAST_LINE_DELAY_MS +
				WELCOME_LAST_LINE_DURATION_MS +
				PROMPT_READY_TAIL_MS;
			revealTimeoutRef.current = setTimeout(finishBoot, tailMs);
		})();
	}, [focusInput, typeAtPrompt, finishBoot]);

	// Outputs can run commands too (e.g. the trigger chips inside the destiny
	// section) — same path as a suggestion-chip click, typing included, and
	// the same animating gate every other entry point into submit() has.
	useEffect(() => {
		const onRun = (event: Event) => {
			if (animating) return;
			const command = (event as CustomEvent<string>).detail;
			if (typeof command === "string" && command) {
				submit(command, true);
			}
		};
		window.addEventListener("terminal:run", onRun);
		return () => window.removeEventListener("terminal:run", onRun);
	}, [submit, animating]);

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
				const lockedHeight = Number.parseFloat(container.style.height);
				if (Math.abs(newHeight - lockedHeight) < 1) {
					// Same height — no transition will fire, so transitionend
					// would never release the lock. Release immediately.
					container.style.height = "";
					container.style.overflow = "";
					container.style.transition = "";
				} else {
					container.style.overflow = "hidden";
					container.style.transition = `height ${GROUP_HEIGHT_MS}ms ${GROUP_HEIGHT_EASING}`;
					container.style.height = `${newHeight}px`;
				}
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

	// Only the longer of the two properties transitioning on the collapsing
	// command line (`max-height`, 220ms vs. `opacity`'s 180ms — see
	// `.boot-command-line` in globals.css) needs to be watched here — by the
	// time it fires, both have finished. Stops rendering the line entirely
	// from this point on, so the settled DOM has no `welcome` command line.
	function handleCommandLineTransitionEnd(
		event: TransitionEvent<HTMLDivElement>,
	) {
		if (event.propertyName !== "max-height") return;
		setCommandLineGone(true);
	}

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
		// Only the boot beat needs special handling here: it has its own
		// pending "reveal the active prompt" timer (see `finishBoot`) that a
		// bare gen bump doesn't interrupt. Once boot is over, every other
		// in-flight animation (a typed command, a leave/enter transition)
		// already bails out on its own next gen check, exactly like before.
		if (bootPhaseRef.current !== "done") {
			if (revealTimeoutRef.current != null) {
				clearTimeout(revealTimeoutRef.current);
				revealTimeoutRef.current = null;
			}
			setBootTyped("");
			// Snap straight to the settled end state: no command line (skip the
			// fade/collapse entirely rather than let it play out), full welcome
			// content, prompt + cursor — chips still land on their own schedule.
			setCommandLineGone(true);
			setWelcomeRevealed(true);
			finishBoot();
		}
	}, [finishBoot]);

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

	function chipClass(command: string): string {
		return isActive(command)
			? "terminal-chip terminal-chip-active"
			: "terminal-chip";
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
			data-booted={booted ? "" : undefined}
			data-prompt-ready={promptReady ? "" : undefined}
			className="terminal-session relative font-mono text-[13px] leading-relaxed sm:text-[14px]"
			onClick={handleContainerClick}
		>
			<LastLogin />

			<div className="mt-5">
				{/* The pinned welcome block's OWN prompt line — appears here, at
				    the top of the session, with the block cursor, and `welcome`
				    types into it directly (via `bootTyped`). Once typing finishes
				    this becomes a static line showing the same "welcome" text
				    (`welcomeEntry.command`), no cursor — the cursor moves down to
				    the bottom active prompt once that beat is reached. After a
				    brief static beat the line fades + collapses away in place
				    (`commandCollapsing` / `.boot-command-line-leaving`) and, once
				    gone (`commandLineGone`), stops rendering altogether — the
				    settled session has no `welcome` command line left, as if it
				    ran and cleared itself. */}
				<div className="terminal-active-prompt-in">
					{!commandLineGone && (
						<div
							className={`boot-command-line ${
								commandCollapsing ? "boot-command-line-leaving" : ""
							}`}
							onTransitionEnd={handleCommandLineTransitionEnd}
						>
							<PromptLine
								input={
									bootPhase === "typing" ? bootTyped : welcomeEntry.command
								}
								cursor={bootPhase === "typing"}
								cursorBlink={cursorBlink}
								active={false}
							/>
						</div>
					)}
				</div>
				<div
					style={welcomeStyle()}
					data-welcome-revealed={welcomeRevealed ? "" : undefined}
					aria-hidden={welcomeRevealed ? undefined : true}
				>
					{welcomeEntry.output && (
						<div className="mt-1.5">{welcomeEntry.output}</div>
					)}
				</div>
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

			{/* The ACTIVE prompt — the fresh one a real shell hands you once the
			    pinned welcome output above has fully printed. Gated on
			    `data-prompt-ready` (see `finishBoot`), not visible during
			    "typing"/"printing" so the eye never has to jump back up to a
			    block that appears above it later. */}
			<div ref={activePromptRef} className="terminal-prompt-ready-in mt-5">
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
						className={chipClass(command)}
					>
						{command}
					</button>
				))}
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
