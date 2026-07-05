"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AboutOutput } from "@/components/terminal/about-output";
import { openDestiny } from "@/components/terminal/destiny-easter-egg";
import { DestinyOutput } from "@/components/terminal/destiny-output";
import { GithubOutput } from "@/components/terminal/github-output";
import { GiveonOutput } from "@/components/terminal/giveon-output";
import { HelpOutput } from "@/components/terminal/help-output";
import { HistoryOutput } from "@/components/terminal/history-output";
import { LiveAge } from "@/components/terminal/live-age";
import { LsHomeOutput } from "@/components/terminal/ls-home-output";
import { LsProjectsOutput } from "@/components/terminal/ls-projects-output";
import { ModricOutput } from "@/components/terminal/modric-output";
import { PenaltyGame } from "@/components/terminal/penalty-game";
import { ProjectsOutput } from "@/components/terminal/projects-output";
import { SocialsOutput } from "@/components/terminal/socials-output";
import { VatreniOutput } from "@/components/terminal/vatreni-output";
import { WelcomeOutput } from "@/components/terminal/welcome-output";
import { WhoamiOutput } from "@/components/terminal/whoami-output";
import { DESTINY, FEATURED_TRACKS } from "@/lib/easter-eggs";
import { SITE } from "@/lib/site";

/** Whether to skip the staggered reveal below and show everything at once —
 * read once per mount, same pattern as the rest of the app's motion gates. */
function useReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	}, []);
	return reduced;
}

const LOVED_ONES_LINE_MS = 200;
/** Delay after the destiny line itself has revealed, not after mount. */
const LOVED_ONES_OPEN_DELAY_MS = 800;

/** `cat /etc/loved-ones` — lines stagger in like close-alert's own line
 * reveal (same class, same easing), then the terminal-style destiny reveal
 * opens on its own a beat after her line lands. */
function LovedOnesOutput() {
	const reduced = useReducedMotion();
	const lineClass = reduced ? undefined : "close-alert-line";
	const delayStyle = (index: number) =>
		reduced ? undefined : { animationDelay: `${index * LOVED_ONES_LINE_MS}ms` };

	useEffect(() => {
		const destinyLineDelay = reduced ? 0 : 1 * LOVED_ONES_LINE_MS;
		const timeout = setTimeout(
			() => openDestiny("terminal"),
			destinyLineDelay + LOVED_ONES_OPEN_DELAY_MS,
		);
		return () => clearTimeout(timeout);
	}, [reduced]);

	return (
		<div className="leading-relaxed">
			<p className={lineClass} style={delayStyle(0)}>
				{DESTINY.lovedOnes.intro}
			</p>
			<div className="mt-2">
				{DESTINY.lovedOnes.lines.map((line, index) => (
					<p
						key={line.text}
						className={`${lineClass ?? ""} ${line.pink ? "text-[#f0a6ca]" : "text-foreground"}`}
						style={delayStyle(index + 1)}
					>
						{line.text}
					</p>
				))}
			</div>
			<p
				className={`mt-2 text-faint ${lineClass ?? ""}`}
				style={delayStyle(DESTINY.lovedOnes.lines.length + 1)}
			>
				{DESTINY.lovedOnes.note}
			</p>
		</div>
	);
}

const GIT_LOG_LINE_MS = 180;
const GIT_LOG_DESTINY_INDEX = 1;
/** Delay after the destiny commit line itself has revealed, not after mount. */
const GIT_LOG_OPEN_DELAY_MS = 600;

/** `git log --oneline` — commits stagger in the same way; the destiny commit
 * (the pink one) opens the card-style destiny reveal a beat after it lands. */
function GitLogOutput() {
	const reduced = useReducedMotion();
	const lineClass = reduced ? undefined : "close-alert-line";

	useEffect(() => {
		const destinyLineDelay = reduced
			? 0
			: GIT_LOG_DESTINY_INDEX * GIT_LOG_LINE_MS;
		const timeout = setTimeout(
			() => openDestiny("card"),
			destinyLineDelay + GIT_LOG_OPEN_DELAY_MS,
		);
		return () => clearTimeout(timeout);
	}, [reduced]);

	return (
		<div className="leading-relaxed">
			{DESTINY.gitLog.map((commit, index) => (
				<p
					key={commit.hash}
					className={lineClass}
					style={
						reduced
							? undefined
							: { animationDelay: `${index * GIT_LOG_LINE_MS}ms` }
					}
				>
					{commit.pink ? (
						<span className="text-[#f0a6ca]">
							{commit.hash} {commit.message}
						</span>
					) : (
						<>
							<span className="text-[#6bc7f5]">{commit.hash}</span>{" "}
							<span className="text-muted">{commit.message}</span>
						</>
					)}
				</p>
			))}
		</div>
	);
}

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
const lsHomeHidden: Renderer = () => ({ output: <LsHomeOutput showHidden /> });
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

/** `giveon` / `beloved` — the playable track is picked here, at execution
 * time (same pattern as `date`), never inside the component's render. */
const giveon: Renderer = () => {
	const track =
		FEATURED_TRACKS[Math.floor(Math.random() * FEATURED_TRACKS.length)];
	return { output: <GiveonOutput track={track} /> };
};

const vatreni: Renderer = () => ({ output: <VatreniOutput /> });

const modric: Renderer = () => ({ output: <ModricOutput /> });

/** `penalty` / `shootout` / `./penalty.sh` — the shootout minigame owns its
 * own state; the registry just mounts it, same as any other renderer. */
const penalty: Renderer = () => ({ output: <PenaltyGame /> });

/** `destiny` — her own first-class section (chip + help), while
 * `cat /etc/loved-ones` / `git log --oneline` / the konami code remain the
 * playful triggers that open the modal reveals (konami is listened for
 * directly in destiny-easter-egg.tsx). */
const destiny: Renderer = () => ({ output: <DestinyOutput /> });
const lovedOnes: Renderer = () => ({ output: <LovedOnesOutput /> });
const gitLog: Renderer = () => ({ output: <GitLogOutput /> });

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
			<DestinyOutput />
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
	"ls -la": lsHomeHidden,
	"ls -a": lsHomeHidden,
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
	giveon,
	beloved: giveon,
	".beloved": giveon,
	"cat .beloved": giveon,
	vatreni,
	hrvatska: vatreni,
	croatia: vatreni,
	".vatreni": vatreni,
	"cat .vatreni": vatreni,
	modric,
	destiny,
	penalty,
	shootout: penalty,
	"./penalty.sh": penalty,
	"cat /etc/loved-ones": lovedOnes,
	"git log --oneline": gitLog,
	[EVERYTHING_COMMAND]: everything,
};

export const SUGGESTED_COMMANDS = [
	"about",
	"projects",
	"github",
	"socials",
	"destiny",
	"cv",
	"help",
];

/**
 * Command metadata shared by the help screen and Tab-completion, so neither
 * can drift from the registry. Order = how the help screen lists them.
 */
export const COMMAND_HELP: Array<[string, string]> = [
	[EVERYTHING_COMMAND, "run the whole tour"],
	["whoami", "who am I"],
	["about", "neofetch-style info card"],
	["projects", "things I've built"],
	["ls", "list the home directory"],
	["socials", "where to find me online"],
	["github", "recent GitHub activity"],
	["destiny", "my sweet angel girl"],
	["cv", "open my resume"],
	["email", "compose an email to me"],
	["age", "exactly how old I am, right now"],
	["date", "today, from your side of the screen"],
	["echo <text>", "say it back"],
	["history", "commands you've run this session"],
	["pwd", "print working directory"],
	["clear", "clear the screen"],
	["help", "show this list"],
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
	"destiny",
	"echo",
	"history",
	"pwd",
	"clear",
	EVERYTHING_COMMAND,
	"giveon",
	"beloved",
	".beloved",
	"cat .beloved",
	"vatreni",
	"hrvatska",
	"croatia",
	".vatreni",
	"cat .vatreni",
	"modric",
	"penalty",
	"shootout",
	"./penalty.sh",
	"cat /etc/loved-ones",
	"git log --oneline",
	"ls -la",
];

const NOT_SUDOERS =
	"lukaadzic is not in the sudoers file.  This incident will be reported.";
const NO_ESCAPE = "there is no escape. try `cv` instead.";

/** A little personality for the 1-in-3 unlucky typo — rotates between variants. */
const SASSY_SUFFIXES = [
	" — try `help`, it's there for a reason.",
	" — try `ls -la`, there's more here than it looks.",
];

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
	const lower = trimmed.toLowerCase();

	if (trimmed === "") {
		return { output: null };
	}

	if (lower === "clear") {
		return "clear";
	}

	if (lower === "exit") {
		return { output: <p className="text-muted">{NO_ESCAPE}</p> };
	}

	if (/^sudo(\s|$)/.test(lower)) {
		return { output: <p className="text-muted">{NOT_SUDOERS}</p> };
	}

	const echoMatch = trimmed.match(/^echo(?:\s+(.*))?$/i);
	if (echoMatch) {
		return { output: <p className="text-muted">{echoMatch[1] ?? ""}</p> };
	}

	if (lower === "history") {
		return { output: <HistoryOutput commands={history} /> };
	}

	const handler = REGISTRY[lower];
	if (handler) {
		return handler();
	}

	const sassy = Math.random() < 1 / 3;
	const suffix = sassy
		? SASSY_SUFFIXES[Math.floor(Math.random() * SASSY_SUFFIXES.length)]
		: "";
	return {
		output: (
			<p className="text-muted">
				zsh: command not found: {trimmed}
				{suffix}
			</p>
		),
	};
}
