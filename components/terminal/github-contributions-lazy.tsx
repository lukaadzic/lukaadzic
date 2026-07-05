"use client";

import dynamic from "next/dynamic";
import { ContributionsSkeleton } from "@/components/terminal/github-contributions";

const GitHubContributions = dynamic(
	() =>
		import("@/components/terminal/github-contributions").then(
			(mod) => mod.GitHubContributions,
		),
	{
		ssr: false,
		loading: () => <ContributionsSkeleton />,
	},
);

export function GitHubContributionsLazy({ username }: { username: string }) {
	return <GitHubContributions username={username} />;
}
