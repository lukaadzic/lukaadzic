import type { Metadata } from "next";
import { NotFoundTerminal } from "@/components/terminal/not-found-terminal";
import { TerminalWindow } from "@/components/terminal/terminal-window";

export const metadata: Metadata = {
	title: "404 - Page Not Found",
	robots: {
		index: false,
		follow: false,
	},
};

export default function NotFound() {
	return (
		<main className="terminal-stage flex min-h-screen items-center justify-center px-3 py-8 sm:px-4 sm:py-24">
			<TerminalWindow>
				<NotFoundTerminal />
			</TerminalWindow>
		</main>
	);
}
