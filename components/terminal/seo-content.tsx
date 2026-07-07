import { PROJECTS } from "@/lib/projects";
import { SITE } from "@/lib/site";
import { SOCIALS } from "@/lib/socials";
import { WORK_EXPERIENCE } from "@/lib/work";

/**
 * Server-rendered, visually-hidden content mirror. The interactive terminal
 * reveals sections on demand, so crawlers and no-JS visitors get the full
 * picture here instead.
 */
export function SeoContent() {
	return (
		<section className="sr-only">
			<h1>{SITE.name}</h1>
			<p>{SITE.tagline}</p>
			<p>{SITE.description}</p>

			<h2>Experience</h2>
			<ul>
				{WORK_EXPERIENCE.map((job) => (
					<li key={`${job.org}-${job.role}`}>
						{job.role} at{" "}
						{job.href ? (
							<a href={job.href} tabIndex={-1}>
								{job.org}
							</a>
						) : (
							job.org
						)}{" "}
						({job.location}, {job.period}) — {job.description}
					</li>
				))}
			</ul>

			<h2>Projects</h2>
			<ul>
				{PROJECTS.map((project) => (
					<li key={project.slug}>
						{/* tabIndex -1: crawlable/readable, but never in the keyboard
						    tab order ahead of the interactive terminal. */}
						<a href={project.href} tabIndex={-1}>
							{project.slug}
						</a>{" "}
						— {project.description}
					</li>
				))}
			</ul>

			<h2>Socials</h2>
			<ul>
				{SOCIALS.map((social) => (
					<li key={social.url}>
						<a href={social.url} tabIndex={-1}>
							{social.label} ({social.handle})
						</a>
					</li>
				))}
				<li>
					<a href={`mailto:${SITE.email}`} tabIndex={-1}>
						{SITE.email}
					</a>
				</li>
			</ul>

			<p>
				<a href={SITE.resumePath} tabIndex={-1}>
					Resume
				</a>
			</p>
		</section>
	);
}
