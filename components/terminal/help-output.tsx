const COMMANDS: Array<[string, string]> = [
	["./everything.sh", "run the whole tour"],
	["whoami", "who am I"],
	["about", "neofetch-style info card"],
	["projects", "things I've built"],
	["socials", "where to find me online"],
	["github", "recent GitHub activity"],
	["cv", "open my resume"],
	["email", "compose an email to me"],
	["age", "exactly how old I am, right now"],
	["pwd", "print working directory"],
	["clear", "clear the screen"],
	["help", "show this list"],
];

export function HelpOutput() {
	return (
		<div className="leading-relaxed">
			<p className="text-muted">Available commands:</p>
			<dl className="mt-1 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-0.5">
				{COMMANDS.map(([name, description]) => (
					<div key={name} className="contents">
						<dt className="text-foreground">{name}</dt>
						<dd className="text-faint">{description}</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
