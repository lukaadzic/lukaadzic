import type { ReactNode } from "react";
import { AboutOutput } from "@/components/terminal/about-output";
import { GithubOutput } from "@/components/terminal/github-output";
import { HelpOutput } from "@/components/terminal/help-output";
import { LiveAge } from "@/components/terminal/live-age";
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
const lsProjects: Renderer = () => ({ output: <LsProjectsOutput /> });
const projects: Renderer = () => ({ output: <ProjectsOutput /> });
const github: Renderer = () => ({ output: <GithubOutput /> });
const socials: Renderer = () => ({ output: <SocialsOutput /> });

const age: Renderer = () => ({
	output: (
		<p className="text-muted">
			age: <LiveAge />
		</p>
	),
});

const pwd: Renderer = () => ({
	output: <p className="text-muted">/Users/luka/wharton</p>,
});

const help: Renderer = () => ({ output: <HelpOutput /> });

const cv: Renderer = () => ({
	output: <p className="text-muted">Opening {SITE.resumePath} in a new tab…</p>,
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

/** The "show me everything" script — runs command-by-command, user-initiated. */
export const EVERYTHING_COMMAND = "./everything.sh";

export const EVERYTHING_STEPS: Array<{ command: string; run: Renderer }> = [
	{ command: "whoami", run: whoami },
	{ command: "cat about.txt", run: about },
	{ command: "ls ~/projects", run: lsProjects },
	{ command: "open ~/projects --verbose", run: projects },
	{ command: "github --contributions", run: github },
	{ command: "open socials/", run: socials },
];

/** Interactive command registry — same renderers as the scripted sequence. */
const REGISTRY: Record<string, Renderer> = {
	welcome,
	whoami,
	"cat about.txt": about,
	about,
	"ls ~/projects": lsProjects,
	ls: lsProjects,
	"open ~/projects --verbose": projects,
	projects,
	"github --contributions": github,
	github,
	"open socials/": socials,
	socials,
	age,
	pwd,
	help,
	cv,
	email,
};

export const SUGGESTED_COMMANDS = [
	"about",
	"projects",
	"github",
	"socials",
	"cv",
];

const NOT_SUDOERS =
	"luka is not in the sudoers file.  This incident will be reported.";
const NO_ESCAPE = "there is no escape. try `cv` instead.";

/** Resolves raw user input into a command result, or "clear" for the special case. */
export function resolveCommand(raw: string): CommandResult | "clear" {
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

	const handler = REGISTRY[trimmed.toLowerCase()];
	if (handler) {
		return handler();
	}

	return {
		output: <p className="text-muted">zsh: command not found: {trimmed}</p>,
	};
}
