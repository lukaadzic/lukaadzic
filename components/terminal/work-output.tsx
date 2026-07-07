import { ExternalLink } from "@/components/shared/external-link";
import { WORK_EXPERIENCE } from "@/lib/work";

export function WorkOutput() {
	return (
		<div className="flex flex-col gap-3">
			{WORK_EXPERIENCE.map((job) => (
				<div key={`${job.org}-${job.role}`}>
					<div className="flex flex-wrap items-baseline gap-x-1.5">
						<span aria-hidden="true" className="shrink-0 text-faint">
							❯
						</span>
						<span className="text-foreground">{job.role}</span>
						<span className="text-muted">@</span>
						{job.href ? (
							<ExternalLink
								href={job.href}
								className="group inline-flex items-center gap-1 text-foreground underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-accent hover:decoration-white/40"
							>
								{job.org}
								<span
									aria-hidden="true"
									className="text-[12px] text-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
								>
									↗
								</span>
							</ExternalLink>
						) : (
							<span className="text-foreground">{job.org}</span>
						)}
						<span className="text-faint">
							· {job.location} · {job.period}
						</span>
					</div>
					<p className="mt-0.5 pl-[22px] leading-relaxed text-muted">
						{job.description}
					</p>
				</div>
			))}
		</div>
	);
}
