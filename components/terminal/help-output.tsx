import { COMMAND_HELP } from "@/components/terminal/commands";

export function HelpOutput() {
	return (
		<div className="leading-relaxed">
			<p className="text-muted">Available commands:</p>
			<dl className="mt-1 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-0.5">
				{COMMAND_HELP.map(([name, description]) => (
					<div key={name} className="contents">
						<dt className="text-foreground">{name}</dt>
						<dd className="text-faint">{description}</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
