import Link from "next/link";
import { Fragment } from "react";
import { SOCIALS } from "@/lib/socials";

export function SocialsSection() {
	return (
		<div className="mt-8">
			{/* Heading aligned with section headers */}
			<div className="mt-6 text-[18px] text-foreground/80 mb-6">
				You’ll find me here:
			</div>
			<div className="w-full mx-auto text-[18px]">
				<div className="space-y-0">
					{SOCIALS.map((social, index) => (
						<Fragment key={social.url}>
							{index > 0 && (
								<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-0.5" />
							)}
							<Link
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-between py-4 transition-opacity duration-200 hover:opacity-70 cursor-pointer group"
							>
								<span className="pr-4">{social.label}</span>
								<span className="font-mono group-hover:text-foreground transition-colors">
									{social.handle}
								</span>
							</Link>
						</Fragment>
					))}
				</div>
			</div>
		</div>
	);
}
