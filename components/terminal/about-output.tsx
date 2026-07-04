import { ExternalLink } from "@/components/shared/external-link";
import { SITE } from "@/lib/site";

export function AboutOutput() {
	return (
		<div className="leading-relaxed text-muted">
			<p>
				Studying finance{" "}
				<ExternalLink
					href="https://www.wharton.upenn.edu/"
					className="text-foreground transition-colors duration-200 hover:text-accent"
				>
					@ Wharton
				</ExternalLink>
				, Philadelphia.
			</p>
			<p>{SITE.description}</p>
			<p className="text-faint">Stuck? try `help`.</p>
		</div>
	);
}
