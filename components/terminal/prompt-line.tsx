import type { ReactNode } from "react";
import { SITE } from "@/lib/site";

type PromptLineProps = {
	input?: string;
	/** Rendered in place of `input` — for interactive content like links. */
	trailing?: ReactNode;
	cursor?: boolean;
	cursorBlink?: boolean;
	/** False for past (non-active) history lines — dims the user slightly so the live prompt stays the visual anchor. */
	active?: boolean;
};

export function PromptLine({
	input = "",
	trailing,
	cursor = false,
	cursorBlink = true,
	active = true,
}: PromptLineProps) {
	return (
		<div className="flex flex-wrap items-baseline gap-x-2">
			<span className="shrink-0 whitespace-pre">
				<span className={active ? "text-[#5fd75f]" : "text-[#5fd75f]/60"}>
					{SITE.githubUsername}
				</span>
				<span className="text-muted"> </span>
				<span className={active ? "text-[#6bc7f5]/80" : "text-[#6bc7f5]/50"}>
					~
				</span>
				<span className="text-muted"> % </span>
			</span>
			<span className="whitespace-pre-wrap break-all text-foreground">
				{trailing ?? input}
				{cursor && (
					<span
						aria-hidden="true"
						className={`ml-px inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-foreground align-baseline ${
							cursorBlink ? "terminal-cursor-blink" : ""
						}`}
					/>
				)}
			</span>
		</div>
	);
}
