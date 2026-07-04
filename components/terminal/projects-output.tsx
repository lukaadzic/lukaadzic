import { ExternalLink } from "@/components/shared/external-link";
import { PROJECTS } from "@/lib/projects";

export function ProjectsOutput() {
	return (
		<div className="flex flex-col gap-3">
			{PROJECTS.map((project) => (
				<div key={project.slug}>
					<ExternalLink
						href={project.href}
						className="group inline-flex items-center gap-1.5"
					>
						<span aria-hidden="true" className="text-faint">
							❯
						</span>
						<span className="text-[#6bc7f5] transition-colors duration-200 group-hover:text-accent">
							{project.slug}
						</span>
						<span
							aria-hidden="true"
							className="text-[12px] text-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
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
