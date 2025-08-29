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
					<Link
						href="https://twitter.com/lukaadzic7/"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group"
					>
						<span className="pr-4">Twitter</span>
						<span className="font-mono group-hover:text-foreground transition-colors">
							@lukaadzic7
						</span>
					</Link>
					<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
					<Link
						href="https://linkedin.com/in/lukaadzic/"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group"
					>
						<span className="pr-4">LinkedIn</span>
						<span className="font-mono group-hover:text-foreground transition-colors">
							@lukaadzic
						</span>
					</Link>
					<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
					<Link
						href="https://github.com/lukaadzic/"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group"
					>
						<span className="pr-4">GitHub</span>
						<span className="font-mono group-hover:text-foreground transition-colors">
							@lukaadzic
						</span>
					</Link>
					<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
					<Link
						href="https://www.instagram.com/lukaadzic7/"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group"
					>
						<span className="pr-4">Instagram</span>
						<span className="font-mono group-hover:text-foreground transition-colors">
							@lukaadzic7
						</span>
					</Link>
				</div>
				<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
				<Link
					href="https://www.facebook.com/adzicluka"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group"
				>
					<span className="pr-4">Facebook</span>
					<span className="font-mono group-hover:text-foreground transition-colors">
						@adzicluka
					</span>
				</Link>
			</div>
		</div>
	);
}
