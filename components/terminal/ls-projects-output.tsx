import { PROJECTS } from "@/lib/projects";

export function LsProjectsOutput() {
	return (
		<div className="flex flex-wrap gap-x-8 gap-y-1">
			{PROJECTS.map((project) => (
				<span key={project.slug} className="text-[#6bc7f5]">
					{project.slug}
				</span>
			))}
		</div>
	);
}
