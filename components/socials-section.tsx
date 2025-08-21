import Link from "next/link";

export function SocialsSection() {
	return (
		<div className="mt-8">
			{/* Heading aligned with section headers */}
			<div className="mt-6 text-[18px] text-foreground/80 mb-6">
				Where to find me:
			</div>
			<div className="w-full mx-auto text-[18px]">
				<div className="space-y-0">
					<div className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group">
						<span className="pr-4">Twitter</span>
						<Link
							href="https://twitter.com/lukaadzic7/"
							target="_blank"
							rel="noopener noreferrer"
							className="group font-mono hover:text-foreground transition-colors"
						>
							@lukaadzic7
						</Link>
					</div>
					<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
					<div className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group">
						<span className="pr-4">LinkedIn</span>
						<Link
							href="https://linkedin.com/in/lukaadzic/"
							target="_blank"
							rel="noopener noreferrer"
							className="group font-mono hover:text-foreground transition-colors"
						>
							@lukaadzic
						</Link>
					</div>
					<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
					<div className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group">
						<span className="pr-4">GitHub</span>
						<Link
							href="https://github.com/lukaadzic/"
							target="_blank"
							rel="noopener noreferrer"
							className="group font-mono hover:text-foreground transition-colors"
						>
							@lukaadzic
						</Link>
					</div>
					<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
					<div className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group">
						<span className="pr-4">Instagram</span>
						<Link
							href="https://www.instagram.com/lukaadzic7/"
							className="group font-mono hover:text-foreground transition-colors"
						>
							@lukaadzic7
						</Link>
					</div>
				</div>
				<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
				<div className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group">
					<span className="pr-4">Facebook</span>
					<Link
						href="https://www.facebook.com/adzicluka"
						className="group font-mono hover:text-foreground transition-colors"
					>
						@adzicluka
					</Link>
				</div>
			</div>
		</div>
	);
}
