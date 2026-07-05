import { ExternalLink } from "@/components/shared/external-link";
import { BELOVED, type FeaturedTrack } from "@/lib/easter-eggs";

type GiveonOutputProps = {
	/** Picked at command-execution time by the caller (same pattern as
	 *  `date`) so it doesn't reshuffle on unrelated re-renders. */
	track: FeaturedTrack;
};

/**
 * `giveon` / `beloved` — a terminal "now playing" card that actually plays:
 * the official Spotify track embed (30s preview for everyone, full track
 * for logged-in Spotify users). frame-src for open.spotify.com is
 * allowlisted in next.config.ts.
 */
export function GiveonOutput({ track }: GiveonOutputProps) {
	return (
		<div className="leading-relaxed">
			<p className="text-[#e0a458]">♫ now playing</p>
			<p className="mb-2 text-foreground">{track.title}</p>
			<iframe
				src={`https://open.spotify.com/embed/track/${track.spotifyTrackId}?theme=0`}
				width="100%"
				height="152"
				title={`Spotify player — ${track.title}`}
				loading="lazy"
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				className="max-w-[420px] rounded-xl border-0"
			/>
			<p className="mt-2 text-faint">
				{BELOVED.title} — {BELOVED.artist} · {BELOVED.year}
			</p>
			<ExternalLink
				href={BELOVED.spotifyUrl}
				className="text-muted underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-accent"
			>
				open the album in spotify <span aria-hidden="true">↗</span>
			</ExternalLink>
		</div>
	);
}
