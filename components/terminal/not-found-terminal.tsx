"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NotFoundTerminal() {
	const pathname = usePathname();

	return (
		<div className="font-mono text-[13px] leading-relaxed sm:text-[14px]">
			<div className="flex flex-wrap items-baseline gap-x-2">
				<span className="shrink-0 whitespace-pre">
					<span className="text-[#5fd75f]">luka</span>
					<span className="text-muted">@</span>
					<span className="text-[#5fd75f]">wharton</span>
					<span className="text-muted"> ~ % </span>
				</span>
				<span className="text-foreground">cd {pathname}</span>
			</div>
			<p className="mt-2 text-muted">
				zsh: no such file or directory: {pathname}
			</p>
			<div className="mt-4 flex flex-wrap items-baseline gap-x-2">
				<span className="shrink-0 whitespace-pre">
					<span className="text-[#5fd75f]">luka</span>
					<span className="text-muted">@</span>
					<span className="text-[#5fd75f]">wharton</span>
					<span className="text-muted"> ~ % </span>
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
