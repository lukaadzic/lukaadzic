import { NotFoundTerminal } from "@/components/terminal/not-found-terminal";
import { TerminalWindow } from "@/components/terminal/terminal-window";

export default function NotFound() {
	return (
		<main className="terminal-stage flex min-h-screen items-center justify-center px-4 py-16 sm:py-24">
			<TerminalWindow floatingOnly>
				<NotFoundTerminal />
			</TerminalWindow>
		</main>
	);
}
