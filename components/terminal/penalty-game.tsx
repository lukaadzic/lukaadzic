"use client";

import { useRef, useState } from "react";
import { PENALTY_END_MESSAGES, SHOOTOUT_HISTORY } from "@/lib/easter-eggs";

type Side = "L" | "C" | "R";
type Kick = "goal" | "miss";
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

/** Best-of-5 in regulation; past round 5, only that round's outcome (one
 * kick each) matters — decided the moment the two results differ. */
function checkGameOver(you: Kick[], hrv: Kick[]): "win" | "loss" | null {
	const n = you.length;
	if (n <= 5) {
		const yourGoals = you.filter((k) => k === "goal").length;
		const hrvGoals = hrv.filter((k) => k === "goal").length;
		const remaining = 5 - n;
		if (yourGoals > hrvGoals + remaining) return "win";
		if (hrvGoals > yourGoals + remaining) return "loss";
		if (n === 5) {
			if (yourGoals > hrvGoals) return "win";
			if (hrvGoals > yourGoals) return "loss";
		}
		return null;
	}
	const lastYou = you[n - 1];
	const lastHrv = hrv[n - 1];
	if (lastYou === lastHrv) return null;
	return lastYou === "goal" ? "win" : "loss";
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
 * Livaković, the goalkeeper who's never lost a World Cup shootout. Manages
 * its own state, same as any other client-only interactive output. */
export function PenaltyGame() {
	const [yourKicks, setYourKicks] = useState<Kick[]>([]);
	const [hrvKicks, setHrvKicks] = useState<Kick[]>([]);
	const [phase, setPhase] = useState<Phase>("shoot");
	const [roundNumber, setRoundNumber] = useState(1);
	const [lastYourShot, setLastYourShot] = useState<ShotRecord | null>(null);
	const [lastHrvShot, setLastHrvShot] = useState<HrvShotRecord | null>(null);
	const [triviaLine, setTriviaLine] = useState<string | null>(null);
	const [gameResult, setGameResult] = useState<"win" | "loss" | null>(null);
	const triviaIndexRef = useRef(0);

	function handleShoot(side: Side) {
		const { result, keeperSide } = resolveYourShot(side);
		setLastYourShot({ side, keeperSide, result });
		setYourKicks((prev) => [...prev, result]);
		setPhase("dive");
	}

	function handleDive(side: Side) {
		const { result, hrvSide } = resolveHrvShot(side);
		setLastHrvShot({ hrvSide, yourDive: side, result });
		const newHrv = [...hrvKicks, result];
		setHrvKicks(newHrv);

		const line =
			SHOOTOUT_HISTORY[triviaIndexRef.current % SHOOTOUT_HISTORY.length];
		triviaIndexRef.current += 1;
		setTriviaLine(line);

		const outcome = checkGameOver(yourKicks, newHrv);
		if (outcome) {
			setGameResult(outcome);
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
		setYourKicks([]);
		setHrvKicks([]);
		setPhase("shoot");
		setRoundNumber(1);
		setLastYourShot(null);
		setLastHrvShot(null);
		setTriviaLine(null);
		setGameResult(null);
		triviaIndexRef.current = 0;
	}

	const roundLabel =
		roundNumber <= 5
			? `round ${roundNumber} of 5`
			: `sudden death — kick ${roundNumber - 5}`;

	return (
		<div className="leading-relaxed">
			<p className="text-[#e63946]">⚽ penalty — vs Livaković</p>
			<p className="text-faint">{roundLabel}</p>

			<p className="mt-2 text-muted">
				HRV {hrvKicks.length > 0 ? hrvKicks.map(icon).join("") : "—"} · YOU{" "}
				{yourKicks.length > 0 ? yourKicks.map(icon).join("") : "—"}
			</p>

			{phase === "shoot" && (
				<SideButtons
					prompt="you shoot. Livaković's saved harder shots than yours — pick a side."
					verb="shoot"
					onPick={handleShoot}
				/>
			)}

			{phase === "dive" && lastYourShot && (
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
					<SideButtons
						prompt="Croatia shoots. you keep — pick a side to dive."
						verb="dive"
						onPick={handleDive}
					/>
				</div>
			)}

			{(phase === "roundEnd" || phase === "gameOver") && lastHrvShot && (
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
							{roundNumber < 5 ? "next round ▸" : "sudden death ▸"}
						</button>
					)}

					{phase === "gameOver" && gameResult && (
						<div className="mt-3">
							<p className="text-foreground">
								{gameResult === "win" ? "YOU WIN" : "CROATIA WINS"}
							</p>
							<p className="mt-1 text-muted">
								{PENALTY_END_MESSAGES[gameResult]}
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
