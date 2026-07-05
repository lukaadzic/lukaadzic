type PromptLineProps = {
	input: string;
	cursor?: boolean;
	cursorBlink?: boolean;
	/** False for past (non-active) history lines — dims the user slightly so the live prompt stays the visual anchor. */
	active?: boolean;
};

export function PromptLine({
	input,
	cursor = false,
	cursorBlink = true,
	active = true,
}: PromptLineProps) {
	return (
		<div className="flex flex-wrap items-baseline gap-x-2">
			<span className="shrink-0 whitespace-pre">
				<span className={active ? "text-[#5fd75f]" : "text-[#5fd75f]/60"}>
					lukaadzic
				</span>
				<span className="text-muted"> </span>
				<span className={active ? "text-[#6bc7f5]/80" : "text-[#6bc7f5]/50"}>
					~
				</span>
				<span className="text-muted"> % </span>
			</span>
			<span className="whitespace-pre-wrap break-all text-foreground">
				{input}
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
