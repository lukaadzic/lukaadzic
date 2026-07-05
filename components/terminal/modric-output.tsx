import { MODRIC } from "@/lib/easter-eggs";

/** `modric` — a tribute to the other Luka. */
export function ModricOutput() {
	return (
		<div className="leading-relaxed">
			<p className="text-foreground">{MODRIC.headline}</p>
			<p className="text-muted">{MODRIC.stats}</p>
			<p className="text-muted">{MODRIC.moment}</p>
			<p className="text-faint">{MODRIC.closer}</p>
			<p className="text-faint">{MODRIC.petNote}</p>
		</div>
	);
}
