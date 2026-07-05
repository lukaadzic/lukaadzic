"use client";

import { useEffect, useState } from "react";

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

export function LastLogin() {
	const [line, setLine] = useState<string | null>(null);

	useEffect(() => {
		setLine(formatLastLogin(new Date()));
	}, []);

	// Reserve the line's height pre-mount so the entrance never shifts.
	return <p className="whitespace-pre text-faint">{line ?? "Last login:"}</p>;
}
