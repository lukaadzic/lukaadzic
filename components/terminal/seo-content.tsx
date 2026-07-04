import { PROJECTS } from "@/lib/projects";
import { SITE } from "@/lib/site";
import { SOCIALS } from "@/lib/socials";

/**
 * Server-rendered, visually-hidden content mirror. The interactive terminal
 * reveals sections on demand, so crawlers and no-JS visitors get the full
 * picture here instead.
 */
export function SeoContent() {
	return (
		<section className="sr-only">
			<h1>{SITE.name}</h1>
			<p>Student @ Wharton · Philadelphia</p>
			<p>{SITE.description}</p>

			<h2>Projects</h2>
			<ul>
				{PROJECTS.map((project) => (
					<li key={project.slug}>
						<a href={project.href}>{project.slug}</a> — {project.description}
					</li>
				))}
			</ul>

			<h2>Socials</h2>
			<ul>
				{SOCIALS.map((social) => (
					<li key={social.url}>
						<a href={social.url}>
							{social.label} ({social.handle})
						</a>
					</li>
				))}
				<li>
					<a href={`mailto:${SITE.email}`}>{SITE.email}</a>
				</li>
			</ul>

			<p>
				<a href={SITE.resumePath}>Resume</a>
			</p>
		</section>
	);
}
