import type { ReactNode } from "react";
import { LiveAge } from "@/components/terminal/live-age";
import { PROJECTS } from "@/lib/projects";
import { SITE } from "@/lib/site";

const TITLE = SITE.githubUsername;
const UNDERLINE = "─".repeat(TITLE.length);

/** neofetch-style: keys in a muted green accent, values in foreground. */
const KEY_CLASS = "text-[#5fd75f]/70";
const VALUE_CLASS = "min-w-0 break-words text-foreground";

const ROWS: Array<[string, ReactNode]> = [
	["name", SITE.name],
	["school", SITE.school],
	["location", SITE.location],
	["age", <LiveAge key="age" />],
	["focus", SITE.focus],
	["projects", `${PROJECTS.length} shipped — try \`projects\``],
	[
		"contact",
		<a
			key="contact"
			href={`mailto:${SITE.email}`}
			className="text-foreground underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-accent"
		>
			{SITE.email}
		</a>,
	],
	["socials", "try `socials`"],
];

export function AboutOutput() {
	return (
		<div className="leading-relaxed">
			<p className="text-[#5fd75f]">{TITLE}</p>
			<p className="text-[#5fd75f]" aria-hidden="true">
				{UNDERLINE}
			</p>
			<dl className="mt-1 grid grid-cols-[10ch_1fr] gap-x-3 gap-y-0.5">
				{ROWS.map(([key, value]) => (
					<div key={key} className="contents">
						<dt className={KEY_CLASS}>{key}</dt>
						<dd className={VALUE_CLASS}>{value}</dd>
					</div>
				))}
			</dl>
			<p className="mt-2 text-faint">Stuck? try `help`.</p>
		</div>
	);
}
