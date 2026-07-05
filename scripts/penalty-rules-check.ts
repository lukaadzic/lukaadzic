/**
 * Assertion script for the pure shootout rules in `lib/penalty.ts`.
 * No test framework — run with: bun scripts/penalty-rules-check.ts
 * Exits non-zero on the first failed assertion.
 */

import {
	decide,
	initialShootoutState,
	type Kick,
	type Kicker,
	nextKicker,
	REGULATION_KICKS,
	recordKick,
	type ShootoutState,
} from "../lib/penalty";

let checks = 0;

function assert(condition: boolean, label: string): void {
	checks += 1;
	if (!condition) {
		console.error(`FAIL: ${label}`);
		process.exit(1);
	}
}

function ok(label: string): void {
	console.log(`ok — ${label}`);
}

/**
 * Plays a fixed kick sequence, asserting the kick order matches
 * `nextKicker` and that no kick happens after a decision.
 */
function play(kicks: Array<[Kicker, Kick]>): {
	state: ShootoutState;
	winner: Kicker | undefined;
} {
	let state = initialShootoutState();
	let winner: Kicker | undefined;
	for (const [kicker, kick] of kicks) {
		assert(winner === undefined, "no kicks may happen after a decision");
		assert(
			nextKicker(state) === kicker,
			`kick order: expected ${nextKicker(state)}, sequence says ${kicker}`,
		);
		state = recordKick(state, kicker, kick);
		winner = decide(state);
	}
	return { state, winner };
}

// --- 1. The user's exact scenario -----------------------------------------
// Croatia 4/4, you 3 of your first 4 then miss your 5th: you're at 3 with 0
// remaining, Croatia at 4 → Croatia wins on the spot, their 5th kick never
// happens.
{
	const { state, winner } = play([
		["you", "goal"],
		["croatia", "goal"],
		["you", "goal"],
		["croatia", "goal"],
		["you", "goal"],
		["croatia", "goal"],
		["you", "miss"],
		["croatia", "goal"],
		["you", "miss"], // your 5th — decided here
	]);
	assert(winner === "croatia", "user scenario: croatia wins");
	assert(state.croKicks === 4, "user scenario: croatia's 5th kick skipped");
	assert(state.yourKicks === 5, "user scenario: you took all 5");
	ok(
		"user scenario: 4/4 croatia, you miss your 5th → croatia wins, their 5th never happens",
	);
}

// --- 2. Early win for you, Croatia's 5th kick skipped ----------------------
// You 4/4, Croatia 3/4 (undecided), you score your 5th → 5 > 3 + 1 → you
// win after your own kick; Croatia's 5th is skipped.
{
	const { state, winner } = play([
		["you", "goal"],
		["croatia", "goal"],
		["you", "goal"],
		["croatia", "miss"],
		["you", "goal"],
		["croatia", "goal"],
		["you", "goal"],
		["croatia", "goal"],
		["you", "goal"], // your 5th — decided here
	]);
	assert(winner === "you", "early win: you win");
	assert(state.croKicks === 4, "early win: croatia's 5th kick skipped");
	ok("early win for you after your 5th → croatia's 5th kick skipped");
}

// --- 3. Decision mid-round after your kick, before round 5 -----------------
// Croatia 3/3, you 1 of 3, you miss your 4th: 3 > 1 + 1 → croatia wins;
// their 4th AND 5th kicks never happen.
{
	const { state, winner } = play([
		["you", "goal"],
		["croatia", "goal"],
		["you", "miss"],
		["croatia", "goal"],
		["you", "miss"],
		["croatia", "goal"],
		["you", "miss"], // your 4th — decided here
	]);
	assert(winner === "croatia", "mid-round: croatia wins after your 4th kick");
	assert(state.croKicks === 3, "mid-round: croatia's 4th and 5th skipped");
	assert(state.yourKicks === 4, "mid-round: your 5th never happens either");
	ok(
		"decision mid-round after your 4th kick → croatia's last two kicks skipped",
	);
}

// --- 4. No premature decision while catch-up is possible -------------------
// 4-3 to Croatia after 4 full rounds: you have a kick left, so NOT decided.
// You equalize, Croatia misses their 5th → 4-4 → sudden death.
{
	let state = initialShootoutState();
	const openingRounds: Array<[Kicker, Kick]> = [
		["you", "goal"],
		["croatia", "goal"],
		["you", "goal"],
		["croatia", "goal"],
		["you", "goal"],
		["croatia", "goal"],
		["you", "miss"],
		["croatia", "goal"],
	];
	for (const [kicker, kick] of openingRounds) {
		state = recordKick(state, kicker, kick);
	}
	assert(state.croGoals === 4 && state.yourGoals === 3, "setup is 4-3");
	assert(decide(state) === undefined, "4-3 with your kick left is NOT decided");
	state = recordKick(state, "you", "goal"); // 4-4, croatia still to kick
	assert(
		decide(state) === undefined,
		"4-4 with croatia's kick left is NOT decided",
	);
	state = recordKick(state, "croatia", "miss"); // 4-4 after 5 each
	assert(decide(state) === undefined, "4-4 after 5 each is NOT decided");
	assert(state.phase === "suddenDeath", "4-4 after 5 each → sudden death");
	ok(
		"no premature decision at 4-3 with kicks left; 4-4 after 5 each → sudden death",
	);
}

/** A tied-after-regulation state to launch sudden-death scenarios from. */
function tiedAfterRegulation(): ShootoutState {
	return {
		yourGoals: 4,
		croGoals: 4,
		yourKicks: REGULATION_KICKS,
		croKicks: REGULATION_KICKS,
		phase: "suddenDeath",
	};
}

// --- 5. Sudden death: win / loss / continue --------------------------------
{
	// You score, Croatia misses → you win.
	let state = recordKick(tiedAfterRegulation(), "you", "goal");
	assert(
		decide(state) === undefined,
		"sudden death: not decided after your kick",
	);
	state = recordKick(state, "croatia", "miss");
	assert(
		decide(state) === "you",
		"sudden death: you score, croatia misses → you win",
	);

	// You miss — Croatia STILL kicks, and wins by scoring.
	state = recordKick(tiedAfterRegulation(), "you", "miss");
	assert(
		decide(state) === undefined,
		"sudden death: your miss alone decides nothing — croatia still kicks",
	);
	assert(
		nextKicker(state) === "croatia",
		"sudden death: croatia replies after your miss",
	);
	state = recordKick(state, "croatia", "goal");
	assert(
		decide(state) === "croatia",
		"sudden death: you miss, croatia scores → croatia wins",
	);

	// Both miss, then both score → still going.
	state = recordKick(tiedAfterRegulation(), "you", "miss");
	state = recordKick(state, "croatia", "miss");
	assert(decide(state) === undefined, "sudden death: both miss → continue");
	state = recordKick(state, "you", "goal");
	state = recordKick(state, "croatia", "goal");
	assert(decide(state) === undefined, "sudden death: both score → continue");
	state = recordKick(state, "you", "goal");
	state = recordKick(state, "croatia", "miss");
	assert(decide(state) === "you", "sudden death: eventually decided");
	ok(
		"sudden death: win, loss (croatia replies after your miss), and continue all correct",
	);
}

// --- 6. 1000 random games: invariants --------------------------------------
{
	const KICK_CAP = 1000;
	for (let game = 0; game < 1000; game++) {
		let state = initialShootoutState();
		let winner: Kicker | undefined;
		let kicksTaken = 0;

		while (winner === undefined) {
			assert(kicksTaken < KICK_CAP, "game must terminate");
			if (state.phase === "regulation") {
				assert(
					state.yourKicks <= REGULATION_KICKS &&
						state.croKicks <= REGULATION_KICKS,
					"never more than 5 regulation kicks per side",
				);
				assert(
					state.yourKicks - state.croKicks === 0 ||
						state.yourKicks - state.croKicks === 1,
					"you always kick first, alternating",
				);
			}
			const kicker = nextKicker(state);
			const kick: Kick = Math.random() < 0.72 ? "goal" : "miss";
			state = recordKick(state, kicker, kick);
			kicksTaken += 1;
			winner = decide(state);
		}

		// The winner must satisfy the catch-up math on the final state.
		if (state.phase === "regulation") {
			assert(
				state.yourKicks <= REGULATION_KICKS &&
					state.croKicks <= REGULATION_KICKS,
				"final regulation kick counts stay within 5",
			);
			if (winner === "croatia") {
				assert(
					state.croGoals >
						state.yourGoals + (REGULATION_KICKS - state.yourKicks),
					"croatia's win is mathematically sealed",
				);
			} else {
				assert(
					state.yourGoals >
						state.croGoals + (REGULATION_KICKS - state.croKicks),
					"your win is mathematically sealed",
				);
			}
		} else {
			assert(
				state.yourKicks === state.croKicks,
				"sudden death decided only on equal kicks",
			);
			assert(
				winner === (state.yourGoals > state.croGoals ? "you" : "croatia"),
				"sudden-death winner has more goals",
			);
		}
	}
	ok(
		"1000 random games: termination, kick order, kick caps, and winner math all hold",
	);
}

console.log(`\nall good — ${checks} assertions passed`);
