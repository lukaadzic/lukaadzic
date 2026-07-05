import { LiveAge } from "@/components/terminal/live-age";
import { SITE } from "@/lib/site";

export function WhoamiOutput() {
	return (
		<div className="leading-relaxed">
			<p>
				<span className="text-foreground">{SITE.name}</span>
				<span className="text-muted"> — {SITE.tagline}</span>
			</p>
			<p className="text-muted">
				age: <LiveAge />
			</p>
		</div>
	);
}
