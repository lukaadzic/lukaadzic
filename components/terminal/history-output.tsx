type HistoryOutputProps = {
	commands: string[];
};

/** `history` — the commands run this session, numbered like a real shell. */
export function HistoryOutput({ commands }: HistoryOutputProps) {
	if (commands.length === 0) {
		return <p className="text-muted">No commands yet — this is the first.</p>;
	}

	return (
		<ol className="leading-relaxed">
			{commands.map((command, index) => (
				<li key={`${index}-${command}`} className="flex gap-3">
					<span className="w-[3ch] shrink-0 text-right text-faint">
						{index + 1}
					</span>
					<span className="text-muted">{command}</span>
				</li>
			))}
		</ol>
	);
}
