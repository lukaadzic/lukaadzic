import { ExternalLink } from "@/components/shared/external-link";
import { SpotifyPlayer } from "@/components/terminal/spotify-player";
import { BELOVED, type FeaturedTrack } from "@/lib/easter-eggs";

type GiveonOutputProps = {
	/** Picked at command-execution time by the caller (same pattern as
	 *  `date`) so it doesn't reshuffle on unrelated re-renders. */
	track: FeaturedTrack;
};

/**
 * `giveon` / `beloved` — a terminal "now playing" card that actually plays:
 * the shared SpotifyPlayer mounts the official embed and autoplays the
 * track the moment the command runs.
 */
export function GiveonOutput({ track }: GiveonOutputProps) {
	return (
		<div className="leading-relaxed">
			<p className="text-[#e0a458]">♫ now playing</p>
			<p className="mb-2 text-foreground">{track.title}</p>
			<div className="max-w-[420px]">
				<SpotifyPlayer trackId={track.spotifyTrackId} />
			</div>
			<p className="mt-1.5 text-faint">
				(if it's quiet, tap play — your browser is shy)
			</p>
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
