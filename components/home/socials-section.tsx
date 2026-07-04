import { ExternalLink } from "@/components/shared/external-link";
import { SITE } from "@/lib/site";
import { SOCIALS } from "@/lib/socials";

export function SocialsSection() {
	return (
		<div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-8">
			{SOCIALS.map((social) => (
				<ExternalLink
					key={social.url}
					href={social.url}
					className="text-[13.5px] text-muted transition-colors duration-200 hover:text-foreground"
					aria-label={`${social.label} (${social.handle})`}
				>
					{social.label}
				</ExternalLink>
			))}
			<a
				href={`mailto:${SITE.email}`}
				className="font-mono text-[13px] text-muted transition-colors duration-200 hover:text-foreground"
			>
				{SITE.email}
			</a>
		</div>
	);
}
