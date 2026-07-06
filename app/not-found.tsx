import { NotFoundTerminal } from "@/components/terminal/not-found-terminal";
import { TerminalWindow } from "@/components/terminal/terminal-window";

export default function NotFound() {
	return (
		<main className="terminal-stage flex min-h-screen items-center justify-center px-3 py-8 sm:px-4 sm:py-24">
			<TerminalWindow>
				<NotFoundTerminal />
			</TerminalWindow>
		</main>
	);
}
