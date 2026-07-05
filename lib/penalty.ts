/**
 * Pure shootout rules for the `penalty` minigame — no React, no randomness.
 *
 * Best-of-5. YOU kick first in every round, then Croatia. After EVERY kick
 * (including between your kick and Croatia's within a round) the game checks
 * whether the trailing side can still catch up with their remaining
 * regulation kicks; the moment they can't, it's decided and every remaining
 * kick is skipped — real shootout rules. Tied after 5 each → sudden death:
 * one kick each per round (you first), decided only once both sides have
 * taken the same number of kicks (Croatia always gets their reply).
 *
 * Kept free of React and I/O so `scripts/penalty-rules-check.ts` can assert
 * the exact rules against fixed scenarios and random simulations.
 */

export type Kick = "goal" | "miss";
export type Kicker = "you" | "croatia";
export type ShootoutPhase = "regulation" | "suddenDeath";

export type ShootoutState = {
	yourGoals: number;
	croGoals: number;
	yourKicks: number;
	croKicks: number;
	phase: ShootoutPhase;
};

export const REGULATION_KICKS = 5;

export function initialShootoutState(): ShootoutState {
	return {
		yourGoals: 0,
		croGoals: 0,
		yourKicks: 0,
		croKicks: 0,
		phase: "regulation",
	};
}

/**
 * Applies one kick and returns the next state. Flips to sudden death the
 * moment both sides have taken all regulation kicks still level.
 */
export function recordKick(
	state: ShootoutState,
	kicker: Kicker,
	kick: Kick,
): ShootoutState {
	const next: ShootoutState = { ...state };
	if (kicker === "you") {
		next.yourKicks += 1;
		if (kick === "goal") next.yourGoals += 1;
	} else {
		next.croKicks += 1;
		if (kick === "goal") next.croGoals += 1;
	}
	if (
		next.phase === "regulation" &&
		next.yourKicks === REGULATION_KICKS &&
		next.croKicks === REGULATION_KICKS &&
		next.yourGoals === next.croGoals
	) {
		next.phase = "suddenDeath";
	}
	return next;
}

/**
 * The decision check, run after every kick.
 *
 * Regulation: a side wins the moment the other side can no longer equal
 * their score with all of their remaining regulation kicks.
 * Sudden death: decided only when both sides have taken the same number of
 * kicks and the scores differ — Croatia always takes their reply, even if
 * you missed (they win by scoring; if they also miss, play continues).
 */
export function decide(state: ShootoutState): Kicker | undefined {
	const { yourGoals, croGoals, yourKicks, croKicks, phase } = state;
	if (phase === "regulation") {
		const yourRemaining = REGULATION_KICKS - yourKicks;
		const croRemaining = REGULATION_KICKS - croKicks;
		if (croGoals > yourGoals + yourRemaining) return "croatia";
		if (yourGoals > croGoals + croRemaining) return "you";
		return undefined;
	}
	if (yourKicks === croKicks && yourGoals !== croGoals) {
		return yourGoals > croGoals ? "you" : "croatia";
	}
	return undefined;
}

/**
 * Whose kick comes next in an undecided game. You open every round, so your
 * kick count is always equal to (start of round) or one ahead of Croatia's.
 */
export function nextKicker(state: ShootoutState): Kicker {
	return state.yourKicks === state.croKicks ? "you" : "croatia";
}
