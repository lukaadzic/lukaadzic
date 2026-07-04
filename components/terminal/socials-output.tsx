import { ExternalLink } from "@/components/shared/external-link";
import { SITE } from "@/lib/site";
import { SOCIALS } from "@/lib/socials";

export function SocialsOutput() {
	return (
		<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
			{SOCIALS.map((social) => (
				<ExternalLink
					key={social.url}
					href={social.url}
					className="text-muted transition-colors duration-200 hover:text-foreground"
					aria-label={`${social.label} (${social.handle})`}
				>
					{social.label}
				</ExternalLink>
			))}
			<a
				href={`mailto:${SITE.email}`}
				className="text-muted transition-colors duration-200 hover:text-foreground"
			>
				mail luka
			</a>
		</div>
	);
}
