"use client";

import {
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	BOOT_STEPS,
	resolveCommand,
	SUGGESTED_COMMANDS,
} from "@/components/terminal/commands";
import { PromptLine } from "@/components/terminal/prompt-line";

// Stable fake session banner — never derived from Date.now() at render, so
// server and client always agree and there's no hydration mismatch.
const LAST_LOGIN = "Last login: Thu Nov 14 09:32:07 on ttys003";

const SKIP_KEY = "terminal-booted";
const CHAR_DELAY_MS = 35;
const STEP_PAUSE_MS = 380;

type HistoryEntry = {
	id: number;
	command: string;
	output: ReactNode;
};

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// useLayoutEffect is a no-op (with a warning) during SSR. This component only
// ever runs the effect on the client, so fall back to useEffect on the server
// purely to keep React quiet — the effect body never executes there anyway.
const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function TerminalSession() {
	// Default state renders the ENTIRE boot sequence, fully typed, with no
	// animation — this is what gets sent as server-rendered HTML (and what a
	// no-JS browser keeps forever). On mount, a layout effect decides whether
	// to rewind to the start and replay the intro, before the browser ever
	// paints the "fully booted" frame — so JS users see no flash.
	const [bootIndex, setBootIndex] = useState(BOOT_STEPS.length);
	const [currentTyped, setCurrentTyped] = useState("");
	const [booting, setBooting] = useState(false);
	const [cursorBlink, setCursorBlink] = useState(true);
	const [cleared, setCleared] = useState(false);
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [inputValue, setInputValue] = useState("");

	const genRef = useRef(0);
	const idRef = useRef(0);
	const commandHistoryRef = useRef<string[]>([]);
	const historyPointerRef = useRef<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Each boot step's output is generated once — reused verbatim whether it's
	// mid-typing-animation or shown instantly, so a component like LiveAge
	// never remounts (and therefore never restarts) mid-session.
	const bootOutputs = useMemo(
		() => BOOT_STEPS.map((step) => step.run().output),
		[],
	);

	useIsomorphicLayoutEffect(() => {
		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const alreadyBooted = sessionStorage.getItem(SKIP_KEY) === "1";

		if (prefersReduced) {
			setCursorBlink(false);
		}

		if (prefersReduced || alreadyBooted) {
			return; // keep the fully-booted default state — nothing to animate
		}

		setBootIndex(0);
		setCurrentTyped("");
		setBooting(true);
	}, []);

	useEffect(() => {
		if (!booting) return;

		const myGen = ++genRef.current;

		(async () => {
			for (let i = 0; i < BOOT_STEPS.length; i++) {
				const { command } = BOOT_STEPS[i];

				for (let charCount = 1; charCount <= command.length; charCount++) {
					if (genRef.current !== myGen) return;
					setCurrentTyped(command.slice(0, charCount));
					await sleep(CHAR_DELAY_MS);
				}

				if (genRef.current !== myGen) return;
				setBootIndex(i + 1);
				setCurrentTyped("");
				await sleep(STEP_PAUSE_MS);
			}

			if (genRef.current === myGen) {
				setBooting(false);
				sessionStorage.setItem(SKIP_KEY, "1");
			}
		})();
	}, [booting]);

	function skipBoot() {
		if (!booting) return;
		genRef.current++;
		setBootIndex(BOOT_STEPS.length);
		setCurrentTyped("");
		setBooting(false);
		sessionStorage.setItem(SKIP_KEY, "1");
	}

	function focusInput() {
		inputRef.current?.focus();
	}

	function handleContainerClick() {
		if (booting) {
			skipBoot();
			return;
		}
		focusInput();
	}

	function runCommand(raw: string) {
		const trimmed = raw.trim();

		if (trimmed !== "") {
			commandHistoryRef.current.push(raw);
		}
		historyPointerRef.current = null;
		setInputValue("");

		const result = resolveCommand(raw);

		if (result === "clear") {
			setCleared(true);
			setHistory([]);
			return;
		}

		result.sideEffect?.();
		idRef.current += 1;
		setHistory((prev) => [
			...prev,
			{ id: idRef.current, command: raw, output: result.output },
		]);
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
		if (booting) {
			if (event.key === "Enter") {
				event.preventDefault();
				skipBoot();
			}
			return;
		}

		if (event.key === "Enter") {
			event.preventDefault();
			runCommand(inputValue);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			navigateHistory(-1);
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			navigateHistory(1);
		}
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: click only focuses the input below; keyboard users can already Tab to it directly.
		<div
			role="log"
			aria-label="Terminal session"
			className="relative font-mono text-[13px] leading-relaxed sm:text-[14px]"
			onClick={handleContainerClick}
		>
			{booting && (
				<button
					type="button"
					onClick={(event) => {
						event.stopPropagation();
						skipBoot();
					}}
					className="absolute right-0 top-0 text-[11px] text-faint transition-colors duration-200 hover:text-muted"
				>
					⏎ skip
				</button>
			)}

			{!cleared && (
				<>
					<p className="text-faint">{LAST_LOGIN}</p>

					{BOOT_STEPS.slice(0, bootIndex).map((step, index) => (
						<div key={step.command} className="mt-3">
							<PromptLine input={step.command} />
							<div className="terminal-output-in mt-1">
								{bootOutputs[index]}
							</div>
						</div>
					))}

					{booting && bootIndex < BOOT_STEPS.length && (
						<div className="mt-3">
							<PromptLine input={currentTyped} />
						</div>
					)}
				</>
			)}

			{!booting && (
				<>
					{history.map((entry) => (
						<div key={entry.id} className="mt-3">
							<PromptLine input={entry.command} />
							{entry.output && (
								<div className="terminal-output-in mt-1">{entry.output}</div>
							)}
						</div>
					))}

					<div className="mt-3">
						<PromptLine input={inputValue} cursor cursorBlink={cursorBlink} />
					</div>

					<div className="mt-4 flex flex-wrap gap-2 sm:hidden">
						{SUGGESTED_COMMANDS.map((command) => (
							<button
								key={command}
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									runCommand(command);
								}}
								className="terminal-chip"
							>
								{command}
							</button>
						))}
					</div>
				</>
			)}

			{/* Visually hidden, but focusable — captures real keystrokes so the
			 	prompt above can render the echoed text. */}
			<input
				ref={inputRef}
				value={inputValue}
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
