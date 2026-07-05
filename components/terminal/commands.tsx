import type { ReactNode } from "react";
import { AboutOutput } from "@/components/terminal/about-output";
import { GithubOutput } from "@/components/terminal/github-output";
import { HelpOutput } from "@/components/terminal/help-output";
import { HistoryOutput } from "@/components/terminal/history-output";
import { LiveAge } from "@/components/terminal/live-age";
import { LsHomeOutput } from "@/components/terminal/ls-home-output";
import { LsProjectsOutput } from "@/components/terminal/ls-projects-output";
import { ProjectsOutput } from "@/components/terminal/projects-output";
import { SocialsOutput } from "@/components/terminal/socials-output";
import { WelcomeOutput } from "@/components/terminal/welcome-output";
import { WhoamiOutput } from "@/components/terminal/whoami-output";
import { SITE } from "@/lib/site";

export type CommandResult = {
	output: ReactNode;
	/** Runs once, at execution time — never during render. */
	sideEffect?: () => void;
};

type Renderer = () => CommandResult;

const welcome: Renderer = () => ({ output: <WelcomeOutput /> });
const whoami: Renderer = () => ({ output: <WhoamiOutput /> });
const about: Renderer = () => ({ output: <AboutOutput /> });
const lsHome: Renderer = () => ({ output: <LsHomeOutput /> });
const lsProjects: Renderer = () => ({ output: <LsProjectsOutput /> });
const projects: Renderer = () => ({ output: <ProjectsOutput /> });
const github: Renderer = () => ({ output: <GithubOutput /> });
const socials: Renderer = () => ({ output: <SocialsOutput /> });

const date: Renderer = () => ({
	output: (
		<p className="text-muted">
			{new Date().toLocaleString(undefined, {
				dateStyle: "full",
				timeStyle: "short",
			})}
		</p>
	),
});

const age: Renderer = () => ({
	output: (
		<p className="text-muted">
			age: <LiveAge />
		</p>
	),
});

const pwd: Renderer = () => ({
	output: <p className="text-muted">/Users/lukaadzic</p>,
});

const help: Renderer = () => ({ output: <HelpOutput /> });

const cv: Renderer = () => ({
	output: (
		<p className="text-muted">
			opening {SITE.resumePath.replace(/^\//, "")}{" "}
			<span aria-hidden="true">↗</span>
		</p>
	),
	sideEffect: () => {
		window.open(SITE.resumePath, "_blank", "noopener,noreferrer");
	},
});

const email: Renderer = () => ({
	output: <p className="text-muted">Composing an email to {SITE.email}…</p>,
	sideEffect: () => {
		window.location.href = `mailto:${SITE.email}`;
	},
});

/** The "show me everything" script — a single combined output, user-initiated. */
export const EVERYTHING_COMMAND = "./everything.sh";

/** The whole rundown as one output: every section stacked, blank-line separated. */
const everything: Renderer = () => ({
	output: (
		<div className="flex flex-col gap-6">
			<AboutOutput />
			<ProjectsOutput />
			<GithubOutput />
			<SocialsOutput />
		</div>
	),
});

/** Interactive command registry — same renderers power chips and typed input. */
const REGISTRY: Record<string, Renderer> = {
	welcome,
	whoami,
	"cat about.txt": about,
	about,
	"ls ~/projects": lsProjects,
	ls: lsHome,
	"open ~/projects --verbose": projects,
	projects,
	"github --contributions": github,
	github,
	"open socials/": socials,
	socials,
	age,
	date,
	pwd,
	help,
	cv,
	email,
	[EVERYTHING_COMMAND]: everything,
};

export const SUGGESTED_COMMANDS = [
	"about",
	"projects",
	"github",
	"socials",
	"cv",
];

/** Known commands for Tab-completion, roughly ordered by how likely they are to be typed. */
export const KNOWN_COMMANDS = [
	"help",
	"whoami",
	"about",
	"projects",
	"ls",
	"socials",
	"github",
	"cv",
	"email",
	"age",
	"date",
	"echo",
	"history",
	"pwd",
	"clear",
	EVERYTHING_COMMAND,
];

const NOT_SUDOERS =
	"lukaadzic is not in the sudoers file.  This incident will be reported.";
const NO_ESCAPE = "there is no escape. try `cv` instead.";

/** A little personality for the 1-in-3 unlucky typo. */
const SASSY_SUFFIX = " — try `help`, it's there for a reason.";

/**
 * Resolves raw user input into a command result, or "clear" for the special
 * case. `history` is session state that lives in the caller, so it's passed
 * in rather than looked up from the static registry.
 */
export function resolveCommand(
	raw: string,
	history: string[] = [],
): CommandResult | "clear" {
	const trimmed = raw.trim();

	if (trimmed === "") {
		return { output: null };
	}

	if (trimmed === "clear") {
		return "clear";
	}

	if (trimmed === "exit") {
		return { output: <p className="text-muted">{NO_ESCAPE}</p> };
	}

	if (/^sudo(\s|$)/.test(trimmed)) {
		return { output: <p className="text-muted">{NOT_SUDOERS}</p> };
	}

	const echoMatch = trimmed.match(/^echo(?:\s+(.*))?$/i);
	if (echoMatch) {
		return { output: <p className="text-muted">{echoMatch[1] ?? ""}</p> };
	}

	if (trimmed.toLowerCase() === "history") {
		return { output: <HistoryOutput commands={history} /> };
	}

	const handler = REGISTRY[trimmed.toLowerCase()];
	if (handler) {
		return handler();
	}

	const sassy = Math.random() < 1 / 3;
	return {
		output: (
			<p className="text-muted">
				zsh: command not found: {trimmed}
				{sassy ? SASSY_SUFFIX : ""}
			</p>
		),
	};
}
