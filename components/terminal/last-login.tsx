"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Real macOS login banner format: `Last login: Sat Jul  5 01:23:45 on ttys003`.
 * The visitor's "last login" is genuinely the moment they opened this session,
 * so it's computed client-side after mount (never during SSR — the value is
 * visitor-local and would mismatch hydration otherwise).
 */
function formatLastLogin(now: Date): string {
	const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
	const month = now.toLocaleDateString("en-US", { month: "short" });
	// Real `last` output pads single-digit days to two columns.
	const day = String(now.getDate()).padStart(2, " ");
	const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
		.map((part) => String(part).padStart(2, "0"))
		.join(":");
	return `Last login: ${weekday} ${month} ${day} ${time} on ttys003`;
}

/** Never actually shown — see the permanent `opacity: 0` base in globals.css
 * below, which covers this line from the very first (pre-hydration) paint.
 * It only exists to reserve the line's height before the real value lands. */
const PLACEHOLDER = "Last login:";

export function LastLogin() {
	const [line, setLine] = useState<string | null>(null);

	// useLayoutEffect (not useEffect) fires synchronously before the browser
	// gets to paint the hydrated tree, so the real value is already in place
	// by the first frame anyone can actually see. Combined with the
	// always-on `opacity: 0` base (which also covers the SSR-rendered paint
	// before any JS has run), the bare "Last login:" placeholder is never
	// visible — this line only ever reserves its own height until then. The
	// reveal itself is a fixed-delay CSS animation (`terminal-last-login-in`)
	// rather than something wired up to this effect, so it lands as its own
	// beat in the opening choreography regardless of exactly how fast
	// hydration happens to run.
	useLayoutEffect(() => {
		setLine(formatLastLogin(new Date()));
	}, []);

	return (
		<p
			className={`terminal-last-login whitespace-pre text-faint ${
				line ? "terminal-last-login-in" : ""
			}`}
			aria-hidden={line ? undefined : true}
		>
			{line ?? PLACEHOLDER}
		</p>
	);
}
