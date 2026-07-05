"use client";

import { useRef, useState } from "react";
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
type Phase = "shoot" | "dive" | "roundEnd" | "gameOver";

const SIDES: readonly Side[] = ["L", "C", "R"];
const SIDE_LABEL: Record<Side, string> = {
	L: "left",
	C: "center",
	R: "right",
};

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

/** A tiny 3-column ASCII goal mouth: ⚽ shows where the shot went, 🧤 shows
 * where the keeper dove. Fixed-width monospace cells so it lines up. */
function goalFrame(ballSide: Side, keeperSide: Side): string {
	const cell = (side: Side, mark: string) =>
		` ${ballSide === side ? mark : " "} `;
	const keeperRow = SIDES.map((side) =>
		keeperSide === side ? " 🧤 " : "    ",
	).join("");
	return [
		"┌───┬───┬───┐",
		`│${cell("L", "⚽")}│${cell("C", "⚽")}│${cell("R", "⚽")}│`,
		"└───┴───┴───┘",
		` ${keeperRow}`,
	].join("\n");
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

type ShotRecord = { side: Side; keeperSide: Side; result: Kick };
type HrvShotRecord = { hrvSide: Side; yourDive: Side; result: Kick };

function SideButtons({
	prompt,
	verb,
	onPick,
}: {
	prompt: string;
	verb: string;
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
 * pure functions; this component only rolls dice and renders. */
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
	const triviaIndexRef = useRef(0);

	function nextTrivia(): string {
		const line =
			SHOOTOUT_HISTORY[triviaIndexRef.current % SHOOTOUT_HISTORY.length];
		triviaIndexRef.current += 1;
		return line;
	}

	function handleShoot(side: Side) {
		const { result, keeperSide } = resolveYourShot(side);
		setLastYourShot({ side, keeperSide, result });
		setLastHrvShot(null);
		setYourList((prev) => [...prev, result]);

		const next = recordKick(shootout, "you", result);
		setShootout(next);

		// Real shootout rules: the game can end on YOUR kick — if it does,
		// Croatia's reply never happens.
		const decided = decide(next);
		if (decided) {
			setWinner(decided);
			setSkipNote(skippedKicksNote(next, decided));
			setTriviaLine(nextTrivia());
			setPhase("gameOver");
		} else {
			setPhase("dive");
		}
	}

	function handleDive(side: Side) {
		const { result, hrvSide } = resolveHrvShot(side);
		setLastHrvShot({ hrvSide, yourDive: side, result });
		setCroList((prev) => [...prev, result]);

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
	}

	function handleContinue() {
		setRoundNumber((r) => r + 1);
		setLastYourShot(null);
		setLastHrvShot(null);
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
		triviaIndexRef.current = 0;
	}

	const roundLabel =
		roundNumber <= REGULATION_KICKS
			? `round ${roundNumber} of ${REGULATION_KICKS}`
			: `sudden death — kick ${roundNumber - REGULATION_KICKS}`;

	// Which kick to show in the aftermath: Croatia's if they kicked this
	// round, otherwise yours (the game ended before their reply).
	const finalShot = lastHrvShot ?? null;

	return (
		<div className="leading-relaxed">
			<p className="text-[#e63946]">
				⚽ penalty — vs Livaković (the 2022 wall)
			</p>
			<p className="text-faint">{roundLabel}</p>

			<p className="mt-2 text-muted">
				HRV {croList.length > 0 ? croList.map(icon).join("") : "—"} · YOU{" "}
				{yourList.length > 0 ? yourList.map(icon).join("") : "—"}
			</p>

			{phase === "shoot" && (
				<SideButtons
					prompt="you shoot. Livaković's saved harder shots than yours — pick a side."
					verb="shoot"
					onPick={handleShoot}
				/>
			)}

			{(phase === "dive" || (phase === "gameOver" && !finalShot)) &&
				lastYourShot && (
					<div className="mt-2">
						<pre aria-hidden="true" className="text-foreground">
							{goalFrame(lastYourShot.side, lastYourShot.keeperSide)}
						</pre>
						<p className="sr-only">
							You shot {SIDE_LABEL[lastYourShot.side]}. Livaković dove{" "}
							{SIDE_LABEL[lastYourShot.keeperSide]}.{" "}
							{lastYourShot.result === "goal" ? "Goal." : "Saved."}
						</p>
						<p className="text-muted">
							{lastYourShot.result === "goal"
								? `GOAL. Livaković dove to the ${SIDE_LABEL[lastYourShot.keeperSide]} — you went to the ${SIDE_LABEL[lastYourShot.side]}.`
								: `SAVED. Livaković read your shot to the ${SIDE_LABEL[lastYourShot.side]} like a book.`}
						</p>
						{phase === "dive" && (
							<SideButtons
								prompt="Croatia shoots. you keep — pick a side to dive."
								verb="dive"
								onPick={handleDive}
							/>
						)}
					</div>
				)}

			{(phase === "roundEnd" || (phase === "gameOver" && finalShot)) &&
				lastHrvShot && (
					<div className="mt-2">
						<pre aria-hidden="true" className="text-foreground">
							{goalFrame(lastHrvShot.hrvSide, lastHrvShot.yourDive)}
						</pre>
						<p className="sr-only">
							Croatia shot {SIDE_LABEL[lastHrvShot.hrvSide]}. You dove{" "}
							{SIDE_LABEL[lastHrvShot.yourDive]}.{" "}
							{lastHrvShot.result === "goal" ? "Goal." : "Saved."}
						</p>
						<p className="text-muted">
							{lastHrvShot.result === "miss"
								? `SAVED! You dove to the ${SIDE_LABEL[lastHrvShot.yourDive]} and got it — Croatia's finally human.`
								: lastHrvShot.yourDive === lastHrvShot.hrvSide
									? `GOAL. You guessed correctly — didn't matter. Clinical.`
									: `GOAL. Croatia doesn't miss when it matters.`}
						</p>
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
							{shootout.phase === "suddenDeath" &&
							roundNumber >= REGULATION_KICKS
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
