import { DestinyEasterEgg } from "@/components/terminal/destiny-easter-egg";
import { SeoContent } from "@/components/terminal/seo-content";
import { TerminalSession } from "@/components/terminal/terminal-session";
import { TerminalWindow } from "@/components/terminal/terminal-window";
import { DESTINY_PHOTO } from "@/lib/easter-eggs";

export default function Home() {
	return (
		// Hey — if you're reading this, you're either very bored or very
		// curious. Let's build something together: lukaadz@wharton.upenn.edu
		<main className="terminal-stage flex min-h-screen items-center justify-center px-3 py-8 sm:px-4 sm:py-24">
			<SeoContent />
			<TerminalWindow>
				<TerminalSession />
			</TerminalWindow>
			<DestinyEasterEgg photoSrc={DESTINY_PHOTO} />
		</main>
	);
}
