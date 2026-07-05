"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PromptLine } from "@/components/terminal/prompt-line";

export function NotFoundTerminal() {
	const pathname = usePathname();

	return (
		<div className="terminal-session font-mono text-[13px] leading-relaxed sm:text-[14px]">
			<PromptLine input={`cd ${pathname}`} />
			<p className="mt-2 text-muted">
				zsh: no such file or directory: {pathname}
			</p>
			<div className="mt-4 flex flex-wrap items-baseline gap-x-2">
				<span className="shrink-0 whitespace-pre">
					<span className="text-[#5fd75f]">lukaadzic</span>
					<span className="text-muted"> </span>
					<span className="text-[#6bc7f5]/80">~</span>
					<span className="text-muted"> % </span>
				</span>
				<Link
					href="/"
					className="text-foreground underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-accent"
				>
					cd ~
				</Link>
			</div>
		</div>
	);
}
