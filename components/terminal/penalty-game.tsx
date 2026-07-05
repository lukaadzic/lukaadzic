"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { PENALTY_END_MESSAGES, SHOOTOUT_HISTORY } from "@/lib/easter-eggs";
import {
	decide,
	initialShootoutState,
	type Kick,
	type Kicker,
	REGULATION_KICKS,
	recordKick,
	type ShootoutState,
} from "@/lib/penalty";

type Side = "L" | "C" | "R";
type Phase =
	| "shoot"
	| "shootSuspense"
	| "dive"
	| "diveSuspense"
	| "roundEnd"
	| "gameOver";

const SIDES: readonly Side[] = ["L", "C", "R"];
const SIDE_LABEL: Record<Side, string> = {
	L: "left",
	C: "center",
	R: "right",
};

/** How long the stadium holds its breath between the pick and the reveal. */
const SUSPENSE_MS = 600;

/** Flavor only — rotated per kick while the suspense timer runs. */
const SUSPENSE_LINES = [
	"the stadium holds its breath…",
	"run-up…",
	"eye contact from twelve yards…",
	"the crowd goes quiet…",
] as const;

/** Livaković is the wall: he guesses your side 45% of the time (vs. a fair
 * 33%) — "he's saved harder shots than yours." */
function resolveYourShot(side: Side): { result: Kick; keeperSide: Side } {
	if (Math.random() < 0.45) {
		return { result: "miss", keeperSide: side };
	}
	const others = SIDES.filter((s) => s !== side);
	const keeperSide = others[Math.floor(Math.random() * others.length)];
	return { result: "goal", keeperSide };
}

/** Croatia is clinical: they convert unless you guess their side AND a
 * 40%-roll goes your way. */
function resolveHrvShot(yourDive: Side): { result: Kick; hrvSide: Side } {
	const hrvSide = SIDES[Math.floor(Math.random() * SIDES.length)];
	if (yourDive === hrvSide && Math.random() < 0.4) {
		return { result: "miss", hrvSide };
	}
	return { result: "goal", hrvSide };
}

function icon(k: Kick): string {
	return k === "goal" ? "⚽" : "❌";
}

/** Narration for kicks that never happen once the math is settled. */
function skippedKicksNote(state: ShootoutState, winner: Kicker): string | null {
	if (state.phase !== "regulation") return null;
	const croLeft = REGULATION_KICKS - state.croKicks;
	if (croLeft <= 0) return null;
	if (winner === "croatia") {
		return croLeft === 1
			? "Croatia doesn't even need their last kick."
			: "Croatia doesn't even need their remaining kicks.";
	}
	return croLeft === 1
		? "Croatia's last kick can't save them — it never happens."
		: "Croatia's remaining kicks can't save them — they never happen.";
}

const GOAL_TOP = "┌───────┬───────┬───────┐";
const GOAL_BOTTOM = "└───────┴───────┴───────┘";
const EMPTY_CELL = "       ";

/** One zone of the goalmouth; the emoji pops in via CSS when present. */
function zoneCell(present: boolean, emoji: string, animClass: string) {
	if (!present) return EMPTY_CELL;
	return (
		<>
			{"  "}
			<span className={animClass}>{emoji}</span>
			{"   "}
		</>
	);
}

/** The goalmouth: posts + crossbar in box-drawing chars, three zones, ⚽ in
 * the shot zone (top row) and 🧤 in the dive zone (bottom row). Remounted
 * per kick, so the pop-in animations replay for every reveal. */
function GoalFrame({
	ballSide,
	gloveSide,
}: {
	ballSide: Side;
	gloveSide: Side;
}) {
	return (
		<div
			aria-hidden="true"
			className="select-none whitespace-pre font-mono leading-[1.35] text-foreground"
		>
			<div>{GOAL_TOP}</div>
			<div>
				{"│"}
				{SIDES.map((side) => (
					<Fragment key={side}>
						{zoneCell(side === ballSide, "⚽", "penalty-ball-in")}
						{"│"}
					</Fragment>
				))}
			</div>
			<div>
				{"│"}
				{SIDES.map((side) => (
					<Fragment key={side}>
						{zoneCell(side === gloveSide, "🧤", "penalty-glove-in")}
						{"│"}
					</Fragment>
				))}
			</div>
			<div>{GOAL_BOTTOM}</div>
		</div>
	);
}

/** Scoreline icons; the newest one pops as it lands. */
function ScoreIcons({ kicks, pop }: { kicks: Kick[]; pop: boolean }) {
	if (kicks.length === 0) return "—";
	const head = kicks.slice(0, -1).map(icon).join("");
	return (
		<>
			{head}
			<span key={kicks.length} className={pop ? "penalty-icon-pop" : undefined}>
				{icon(kicks[kicks.length - 1])}
			</span>
		</>
	);
}

/** The verdict line: colored verdict word flashes in just after the ball. */
function ResultLine({
	verdict,
	good,
	rest,
}: {
	verdict: string;
	good: boolean;
	rest: string;
}) {
	return (
		<p className="penalty-result-in text-muted">
			<span className={good ? "text-[#5fd75f]" : "text-[#e63946]"}>
				{verdict}
			</span>
			{rest}
		</p>
	);
}

type ShotRecord = { side: Side; keeperSide: Side; result: Kick };
type HrvShotRecord = { hrvSide: Side; yourDive: Side; result: Kick };

function SideButtons({
	prompt,
	verb,
	disabled,
	onPick,
}: {
	prompt: string;
	verb: string;
	disabled: boolean;
	onPick: (side: Side) => void;
}) {
	return (
		<div className="mt-2">
			<p className="text-muted">{prompt}</p>
			<div className="mt-2 flex flex-wrap gap-2">
				{SIDES.map((side) => (
					<button
						key={side}
						type="button"
						disabled={disabled}
						className="terminal-chip penalty-chip"
						onClick={(event) => {
							event.stopPropagation();
							onPick(side);
						}}
					>
						{verb} {SIDE_LABEL[side]}
					</button>
				))}
			</div>
		</div>
	);
}

/** `penalty` / `shootout` / `./penalty.sh` — a best-of-5 shootout against
 * Livaković, Croatia's 2022 shootout wall (Subašić held 2018 — the trivia
 * keeps the years straight). The rules math lives in `lib/penalty.ts` as
 * pure functions; this component only rolls dice, holds its breath for a
 * beat, and renders the reveal. */
export function PenaltyGame() {
	const [shootout, setShootout] = useState<ShootoutState>(initialShootoutState);
	const [yourList, setYourList] = useState<Kick[]>([]);
	const [croList, setCroList] = useState<Kick[]>([]);
	const [phase, setPhase] = useState<Phase>("shoot");
	const [roundNumber, setRoundNumber] = useState(1);
	const [lastYourShot, setLastYourShot] = useState<ShotRecord | null>(null);
	const [lastHrvShot, setLastHrvShot] = useState<HrvShotRecord | null>(null);
	const [triviaLine, setTriviaLine] = useState<string | null>(null);
	const [winner, setWinner] = useState<Kicker | null>(null);
	const [skipNote, setSkipNote] = useState<string | null>(null);
	const [suspenseLine, setSuspenseLine] = useState("");
	const [landedFor, setLandedFor] = useState<"you" | "cro" | null>(null);
	const triviaIndexRef = useRef(0);
	const suspenseIndexRef = useRef(0);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const reducedRef = useRef(false);

	useEffect(() => {
		reducedRef.current = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		return () => {
			if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
		};
	}, []);

	function nextTrivia(): string {
		const line =
			SHOOTOUT_HISTORY[triviaIndexRef.current % SHOOTOUT_HISTORY.length];
		triviaIndexRef.current += 1;
		return line;
	}

	function nextSuspenseLine(): string {
		const line =
			SUSPENSE_LINES[suspenseIndexRef.current % SUSPENSE_LINES.length];
		suspenseIndexRef.current += 1;
		return line;
	}

	/** Holds ~600ms of tension before the reveal; instant under reduced motion. */
	function afterSuspense(reveal: () => void) {
		if (reducedRef.current) {
			reveal();
			return;
		}
		timeoutRef.current = setTimeout(reveal, SUSPENSE_MS);
	}

	function handleShoot(side: Side) {
		const { result, keeperSide } = resolveYourShot(side);
		setSuspenseLine(nextSuspenseLine());
		setPhase("shootSuspense");
		afterSuspense(() => {
			setLastYourShot({ side, keeperSide, result });
			setLastHrvShot(null);
			setYourList((prev) => [...prev, result]);
			setLandedFor("you");

			const next = recordKick(shootout, "you", result);
			setShootout(next);

			// Real shootout rules: the game can end on YOUR kick — if it
			// does, Croatia's reply never happens.
			const decided = decide(next);
			if (decided) {
				setWinner(decided);
				setSkipNote(skippedKicksNote(next, decided));
				setTriviaLine(nextTrivia());
				setPhase("gameOver");
			} else {
				setPhase("dive");
			}
		});
	}

	function handleDive(side: Side) {
		const { result, hrvSide } = resolveHrvShot(side);
		setSuspenseLine(nextSuspenseLine());
		setPhase("diveSuspense");
		afterSuspense(() => {
			setLastHrvShot({ hrvSide, yourDive: side, result });
			setCroList((prev) => [...prev, result]);
			setLandedFor("cro");

			const next = recordKick(shootout, "croatia", result);
			setShootout(next);
			setTriviaLine(nextTrivia());

			const decided = decide(next);
			if (decided) {
				setWinner(decided);
				setSkipNote(skippedKicksNote(next, decided));
				setPhase("gameOver");
			} else {
				setPhase("roundEnd");
			}
		});
	}

	function handleContinue() {
		setRoundNumber((r) => r + 1);
		setLastYourShot(null);
		setLastHrvShot(null);
		setLandedFor(null);
		setPhase("shoot");
	}

	function handlePlayAgain() {
		setShootout(initialShootoutState());
		setYourList([]);
		setCroList([]);
		setPhase("shoot");
		setRoundNumber(1);
		setLastYourShot(null);
		setLastHrvShot(null);
		setTriviaLine(null);
		setWinner(null);
		setSkipNote(null);
		setLandedFor(null);
		triviaIndexRef.current = 0;
		suspenseIndexRef.current = 0;
	}

	const roundLabel =
		roundNumber <= REGULATION_KICKS
			? `round ${roundNumber} of ${REGULATION_KICKS}`
			: `sudden death — kick ${roundNumber - REGULATION_KICKS}`;

	const phaseLabel =
		phase === "shoot" || phase === "shootSuspense"
			? "you shoot"
			: phase === "dive" || phase === "diveSuspense"
				? "croatia shoots"
				: phase === "roundEnd"
					? "round over"
					: "full time";

	// Which kick to show in the aftermath: Croatia's if they kicked this
	// round, otherwise yours (the game ended before their reply).
	const finalShot = lastHrvShot ?? null;

	return (
		<div className="leading-relaxed">
			<p className="text-[#e63946]">
				⚽ penalty — vs Livaković (the 2022 wall)
			</p>
			<p
				key={`${roundLabel} · ${phaseLabel}`}
				className="penalty-fade text-faint"
			>
				{roundLabel} · {phaseLabel}
			</p>

			<p className="mt-2 text-muted">
				HRV <ScoreIcons kicks={croList} pop={landedFor === "cro"} /> · YOU{" "}
				<ScoreIcons kicks={yourList} pop={landedFor === "you"} />
			</p>

			{(phase === "shoot" || phase === "shootSuspense") && (
				<>
					<SideButtons
						prompt="you shoot. Livaković's saved harder shots than yours — pick a side."
						verb="shoot"
						disabled={phase === "shootSuspense"}
						onPick={handleShoot}
					/>
					{phase === "shootSuspense" && (
						<p className="penalty-suspense mt-2 text-faint">{suspenseLine}</p>
					)}
				</>
			)}

			{(phase === "dive" ||
				phase === "diveSuspense" ||
				(phase === "gameOver" && !finalShot)) &&
				lastYourShot && (
					<div className="mt-2">
						<GoalFrame
							ballSide={lastYourShot.side}
							gloveSide={lastYourShot.keeperSide}
						/>
						<p className="sr-only">
							You shot {SIDE_LABEL[lastYourShot.side]}. Livaković dove{" "}
							{SIDE_LABEL[lastYourShot.keeperSide]}.{" "}
							{lastYourShot.result === "goal" ? "Goal." : "Saved."}
						</p>
						{lastYourShot.result === "goal" ? (
							<ResultLine
								verdict="GOAL"
								good
								rest={`. Livaković dove to the ${SIDE_LABEL[lastYourShot.keeperSide]} — you went to the ${SIDE_LABEL[lastYourShot.side]}.`}
							/>
						) : (
							<ResultLine
								verdict="SAVED"
								good={false}
								rest={`. Livaković read your shot to the ${SIDE_LABEL[lastYourShot.side]} like a book.`}
							/>
						)}
						{(phase === "dive" || phase === "diveSuspense") && (
							<>
								<SideButtons
									prompt="Croatia shoots. you keep — pick a side to dive."
									verb="dive"
									disabled={phase === "diveSuspense"}
									onPick={handleDive}
								/>
								{phase === "diveSuspense" && (
									<p className="penalty-suspense mt-2 text-faint">
										{suspenseLine}
									</p>
								)}
							</>
						)}
					</div>
				)}

			{(phase === "roundEnd" || (phase === "gameOver" && finalShot)) &&
				lastHrvShot && (
					<div className="mt-2">
						<GoalFrame
							ballSide={lastHrvShot.hrvSide}
							gloveSide={lastHrvShot.yourDive}
						/>
						<p className="sr-only">
							Croatia shot {SIDE_LABEL[lastHrvShot.hrvSide]}. You dove{" "}
							{SIDE_LABEL[lastHrvShot.yourDive]}.{" "}
							{lastHrvShot.result === "goal" ? "Goal." : "Saved."}
						</p>
						{lastHrvShot.result === "miss" ? (
							<ResultLine
								verdict="SAVED"
								good
								rest={`! You dove to the ${SIDE_LABEL[lastHrvShot.yourDive]} and got it — Croatia's finally human.`}
							/>
						) : (
							<ResultLine
								verdict="GOAL"
								good={false}
								rest={
									lastHrvShot.yourDive === lastHrvShot.hrvSide
										? ". You guessed correctly — didn't matter. Clinical."
										: ". Croatia doesn't miss when it matters."
								}
							/>
						)}
					</div>
				)}

			{(phase === "roundEnd" || phase === "gameOver") && (
				<div>
					{skipNote && <p className="mt-2 text-muted">{skipNote}</p>}
					{triviaLine && <p className="mt-2 text-faint">{triviaLine}</p>}

					{phase === "roundEnd" && (
						<button
							type="button"
							className="terminal-chip penalty-chip mt-3"
							onClick={(event) => {
								event.stopPropagation();
								handleContinue();
							}}
						>
							{shootout.phase === "suddenDeath"
								? "sudden death ▸"
								: "next round ▸"}
						</button>
					)}

					{phase === "gameOver" && winner && (
						<div className="mt-3">
							<p className="text-foreground">
								{winner === "you" ? "YOU WIN" : "CROATIA WINS"}
							</p>
							<p className="mt-1 text-muted">
								{PENALTY_END_MESSAGES[winner === "you" ? "win" : "loss"]}
							</p>
							<button
								type="button"
								className="terminal-chip terminal-chip-accent penalty-chip mt-3"
								onClick={(event) => {
									event.stopPropagation();
									handlePlayAgain();
								}}
							>
								play again
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
