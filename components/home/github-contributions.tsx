"use client";

import { useEffect, useState } from "react";
import {
	type ContributionDay,
	generateFallbackContributions,
} from "@/lib/github-contributions";

interface GitHubContributionsProps {
	username: string;
}

const LEVEL_COLORS = [
	"rgba(255, 255, 255, 0.06)",
	"rgba(255, 255, 255, 0.2)",
	"rgba(255, 255, 255, 0.38)",
	"rgba(255, 255, 255, 0.58)",
	"rgba(255, 255, 255, 0.85)",
];

function getContributionColor(level: number): string {
	return LEVEL_COLORS[level] ?? LEVEL_COLORS[0];
}

function getWeeksInYear(contributions: ContributionDay[]): ContributionDay[][] {
	const weeks: ContributionDay[][] = [];
	let currentWeek: ContributionDay[] = [];
	let placeholderIndex = 0;

	contributions.forEach((day, index) => {
		const dayOfWeek = new Date(day.date).getDay();

		if (index === 0) {
			for (let i = 0; i < dayOfWeek; i++) {
				currentWeek.push({
					date: `placeholder-start-${placeholderIndex++}`,
					count: 0,
					level: 0,
				});
			}
		}

		currentWeek.push(day);

		if (dayOfWeek === 6 || index === contributions.length - 1) {
			while (currentWeek.length < 7) {
				currentWeek.push({
					date: `placeholder-end-${placeholderIndex++}`,
					count: 0,
					level: 0,
				});
			}
			weeks.push(currentWeek);
			currentWeek = [];
		}
	});

	return weeks;
}

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
						key={`loading-cell-${i}`}
						className="h-[10px] w-[10px] animate-pulse rounded-[2px] bg-white/[0.06]"
					/>
				))}
			</div>
		</div>
	);
}

export function GitHubContributions({ username }: GitHubContributionsProps) {
	const [contributions, setContributions] = useState<ContributionDay[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalContributions, setTotalContributions] = useState(0);

	useEffect(() => {
		let cancelled = false;

		async function fetchContributions() {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(
					`/api/github-contributions?username=${encodeURIComponent(username)}`,
				);

				if (!response.ok) {
					throw new Error(`Failed to fetch contributions: ${response.status}`);
				}

				const data = await response.json();
				if (cancelled) return;

				if (data.error) {
					setError(data.error);
				}

				setContributions(data.contributions);
				setTotalContributions(data.totalContributions);
			} catch {
				if (cancelled) return;

				setError("Failed to load contributions");
				const fallback = generateFallbackContributions();
				setContributions(fallback.contributions);
				setTotalContributions(fallback.totalContributions);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		if (username) {
			fetchContributions();
		}

		return () => {
			cancelled = true;
		};
	}, [username]);

	const weeks = contributions.length > 0 ? getWeeksInYear(contributions) : [];

	if (loading) {
		return <ContributionsSkeleton />;
	}

	return (
		<div>
			<div className="overflow-x-auto">
				<div
					className="inline-grid grid-flow-col gap-[3px]"
					style={{ gridTemplateRows: "repeat(7, 10px)" }}
				>
					{weeks.map((week) =>
						week.map((day) => (
							<div
								key={day.date}
								className="h-[10px] w-[10px] rounded-[2px]"
								style={{ backgroundColor: getContributionColor(day.level) }}
								title={
									day.count > 0
										? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`
										: undefined
								}
							/>
						)),
					)}
				</div>
			</div>

			<div className="mt-4 flex items-center justify-between text-[12px] text-faint">
				<span>
					{totalContributions} contribution{totalContributions === 1 ? "" : "s"}
					{error ? " · sample data" : ""}
				</span>
				<span className="flex items-center gap-1.5">
					Less
					<span className="flex gap-[3px]">
						{[0, 1, 2, 3, 4].map((level) => (
							<span
								key={level}
								className="h-[10px] w-[10px] rounded-[2px]"
								style={{ backgroundColor: getContributionColor(level) }}
							/>
						))}
					</span>
					More
				</span>
			</div>
		</div>
	);
}
