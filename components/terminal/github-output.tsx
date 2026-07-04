import { GitHubContributionsLazy } from "@/components/terminal/github-contributions-lazy";
import { SITE } from "@/lib/site";

export function GithubOutput() {
	return <GitHubContributionsLazy username={SITE.githubUsername} />;
}
