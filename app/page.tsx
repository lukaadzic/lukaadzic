import { DescriptionTypewriter } from "@/components/home/description-typewriter";
import { GitHubContributionsLazy } from "@/components/home/github-contributions-lazy";
import { Portrait } from "@/components/home/portrait";
import { ProjectCard } from "@/components/home/project-card";
import { SocialsSection } from "@/components/home/socials-section";
import { ExternalLink } from "@/components/shared/external-link";
import { FadeIn } from "@/components/shared/fade-in";
import { PROJECTS } from "@/lib/projects";
import { SITE } from "@/lib/site";

export default function Home() {
	return (
		<>
			{/*
				Hey — if you're reading this, you're either very bored or very curious.
				Let's build something together: lukaadz@wharton.upenn.edu
			*/}
			<main className="mx-auto min-h-screen max-w-[600px] px-6 py-16 sm:py-24">
				<FadeIn delay="0s">
					<header className="flex items-start justify-between gap-6">
						<div>
							<h1 className="text-[17px] font-semibold tracking-tight text-foreground">
								{SITE.name}
							</h1>
							<p className="mt-1 text-[13.5px] text-muted">
								Student @ Wharton · Philadelphia
							</p>
							<ExternalLink
								href={SITE.resumePath}
								className="mt-4 inline-flex items-center gap-1 text-[13px] text-muted transition-colors duration-200 hover:text-foreground"
							>
								CV <span aria-hidden="true">↗</span>
							</ExternalLink>
						</div>
						<Portrait />
					</header>
				</FadeIn>

				<FadeIn delay="0.05s" className="mt-10">
					<DescriptionTypewriter />
				</FadeIn>

				<FadeIn delay="0.1s" className="mt-16">
					<h2 className="text-[11px] font-medium uppercase tracking-widest text-faint">
						Projects
					</h2>
					<div className="mt-4">
						{PROJECTS.map((project) => (
							<ProjectCard key={project.slug} project={project} />
						))}
					</div>
				</FadeIn>

				<FadeIn delay="0.15s" className="mt-16">
					<h2 className="text-[11px] font-medium uppercase tracking-widest text-faint">
						Activity
					</h2>
					<div className="mt-4">
						<GitHubContributionsLazy username={SITE.githubUsername} />
					</div>
				</FadeIn>

				<FadeIn delay="0.2s" className="mt-20">
					<SocialsSection />
				</FadeIn>
			</main>
		</>
	);
}
