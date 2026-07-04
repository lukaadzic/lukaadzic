type PromptLineProps = {
	input: string;
	cursor?: boolean;
	cursorBlink?: boolean;
};

export function PromptLine({
	input,
	cursor = false,
	cursorBlink = true,
}: PromptLineProps) {
	return (
		<div className="flex flex-wrap items-baseline gap-x-2">
			<span className="shrink-0 whitespace-pre">
				<span className="text-[#5fd75f]">luka</span>
				<span className="text-muted">@</span>
				<span className="text-[#5fd75f]">wharton</span>
				<span className="text-muted"> ~ % </span>
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
