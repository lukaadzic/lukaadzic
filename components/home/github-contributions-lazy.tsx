"use client";

import dynamic from "next/dynamic";

const GitHubContributions = dynamic(
	() =>
		import("@/components/home/github-contributions").then(
			(mod) => mod.GitHubContributions,
		),
	{
		ssr: false,
		loading: () => <ContributionsSkeleton />,
	},
);

function ContributionsSkeleton() {
	return (
		<div className="overflow-x-auto" aria-hidden="true">
			<div
				className="inline-grid grid-flow-col gap-[3px]"
				style={{ gridTemplateRows: "repeat(7, 10px)" }}
			>
				{Array.from({ length: 371 }, (_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder grid, order never changes
						key={`skeleton-cell-${i}`}
						className="h-[10px] w-[10px] animate-pulse rounded-[2px] bg-white/[0.06]"
						style={{ animationDelay: `${(i % 53) * 15}ms` }}
					/>
				))}
			</div>
		</div>
	);
}

export function GitHubContributionsLazy({ username }: { username: string }) {
	return <GitHubContributions username={username} />;
}
