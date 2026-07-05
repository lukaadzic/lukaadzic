import { ExternalLink } from "@/components/shared/external-link";
import { PROJECTS } from "@/lib/projects";

export function ProjectsOutput() {
	return (
		<div className="flex flex-col gap-3">
			{PROJECTS.map((project) => (
				<div key={project.slug}>
					<ExternalLink
						href={project.href}
						className="group inline-flex max-w-full items-center gap-1.5"
					>
						<span aria-hidden="true" className="shrink-0 text-faint">
							❯
						</span>
						<span className="min-w-0 break-words text-foreground underline decoration-white/20 underline-offset-4 transition-colors duration-200 group-hover:text-accent group-hover:decoration-white/40">
							{project.slug}
						</span>
						<span
							aria-hidden="true"
							className="shrink-0 text-[12px] text-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
						>
							↗
						</span>
					</ExternalLink>
					<p className="mt-0.5 pl-[22px] leading-relaxed text-muted">
						{project.description}
					</p>
				</div>
			))}
		</div>
	);
}
