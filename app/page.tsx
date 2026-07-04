import { TerminalSession } from "@/components/terminal/terminal-session";
import { TerminalWindow } from "@/components/terminal/terminal-window";

export default function Home() {
	return (
		// Hey — if you're reading this, you're either very bored or very
		// curious. Let's build something together: lukaadz@wharton.upenn.edu
		<main className="terminal-stage flex min-h-screen items-center justify-center px-4 py-16 sm:py-24">
			<TerminalWindow>
				<TerminalSession />
			</TerminalWindow>
		</main>
	);
}
