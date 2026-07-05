import { ExternalLink } from "@/components/shared/external-link";
import { BELOVED } from "@/lib/easter-eggs";

/** Length of the ASCII progress bar, in glyphs. */
export const GIVEON_BAR_LENGTH = 12;

type GiveonOutputProps = {
	/** Picked at command-execution time by the caller (same pattern as
	 *  `date`) so it doesn't reshuffle on unrelated re-renders. */
	track: string;
	filled: number;
};

/** `giveon` / `beloved` — a terminal "now playing" card for GIVĒON's Beloved. */
export function GiveonOutput({ track, filled }: GiveonOutputProps) {
	const bar = "▮".repeat(filled) + "▯".repeat(GIVEON_BAR_LENGTH - filled);

	return (
		<div className="leading-relaxed">
			<p className="text-[#e0a458]">♫ now playing</p>
			<p className="text-foreground">{track}</p>
			<p className="text-muted" aria-hidden="true">
				{bar}
			</p>
			<p className="text-faint">
				{BELOVED.title} — {BELOVED.artist} · {BELOVED.year}
			</p>
			<ExternalLink
				href={BELOVED.spotifyUrl}
				className="text-muted underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-accent"
			>
				open in spotify <span aria-hidden="true">↗</span>
			</ExternalLink>
		</div>
	);
}
