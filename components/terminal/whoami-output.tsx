import { ExternalLink } from "@/components/shared/external-link";
import { LiveAge } from "@/components/terminal/live-age";
import { SITE, TAGLINE_PARTS } from "@/lib/site";

const TAGLINE_LINK_CLASS =
	"text-muted underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-accent";

export function WhoamiOutput() {
	return (
		<div className="leading-relaxed">
			<p>
				<span className="text-foreground">{SITE.name}</span>
				<span className="text-muted">
					{" — "}
					{TAGLINE_PARTS.map((part, index) =>
						part.href ? (
							<ExternalLink
								key={`${part.text}-${index}`}
								href={part.href}
								className={TAGLINE_LINK_CLASS}
							>
								{part.text}
							</ExternalLink>
						) : (
							<span key={`${part.text}-${index}`}>{part.text}</span>
						),
					)}
				</span>
			</p>
			<p className="text-muted">
				age: <LiveAge />
			</p>
		</div>
	);
}
