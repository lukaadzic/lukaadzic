"use client";

import dynamic from "next/dynamic";

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

function ContributionsSkeleton() {
	return (
		<div aria-hidden="true">
			<div className="h-[1.25em] w-full max-w-[420px] animate-pulse rounded-[2px] bg-white/[0.06] motion-reduce:animate-none" />
			<div className="mt-2 h-[1em] w-56 animate-pulse rounded-[2px] bg-white/[0.04] motion-reduce:animate-none" />
		</div>
	);
}

export function GitHubContributionsLazy({ username }: { username: string }) {
	return <GitHubContributions username={username} />;
}
