import Link from "next/link";
import { FadeIn } from "@/components/shared/fade-in";

export default function NotFound() {
	return (
		<main className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center px-6 py-24 text-center">
			<FadeIn>
				<p className="font-mono text-6xl text-foreground/20">404</p>
			</FadeIn>
			<FadeIn delay="0.05s" className="mt-4">
				<p className="text-[14px] text-muted">This page doesn&apos;t exist.</p>
			</FadeIn>
			<FadeIn delay="0.1s" className="mt-8">
				<Link
					href="/"
					className="text-[13px] text-muted transition-colors duration-200 hover:text-foreground"
				>
					← Back home
				</Link>
			</FadeIn>
		</main>
	);
}
