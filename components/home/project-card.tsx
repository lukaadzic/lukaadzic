import { ExternalLink } from "@/components/shared/external-link";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
	return (
		<ExternalLink
			href={project.href}
			className="group -mx-3 block rounded-lg px-3 py-3 transition-colors duration-200 hover:bg-white/[0.03]"
		>
			<div className="flex items-center gap-1.5">
				<span className="font-mono text-[14px] text-foreground transition-colors duration-200 group-hover:text-accent">
					{project.slug}
				</span>
				<span
					aria-hidden="true"
					className="text-[12px] text-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
				>
					↗
				</span>
			</div>
			<p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
				{project.description}
			</p>
		</ExternalLink>
	);
}
