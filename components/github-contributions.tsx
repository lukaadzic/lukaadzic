"use client";
import { useCallback, useEffect, useState } from "react";

interface ContributionDay {
	date: string;
	count: number;
	level: number;
}

interface GitHubContributionsProps {
	username: string;
}

export function GitHubContributions({ username }: GitHubContributionsProps) {
	const [contributions, setContributions] = useState<ContributionDay[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalContributions, setTotalContributions] = useState(0);

	const generateRealisticContributions = useCallback((): ContributionDay[] => {
		const contributions: ContributionDay[] = [];
		const today = new Date();
		const yearAgo = new Date(today);
		yearAgo.setFullYear(today.getFullYear() - 1);

		for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
			const dayOfWeek = d.getDay();
			let count = 0;

			// More realistic pattern: less on weekends, more during work days
			if (dayOfWeek >= 1 && dayOfWeek <= 5) {
				// Weekdays: higher chance of contributions
				count = Math.random() < 0.8 ? Math.floor(Math.random() * 8) + 1 : 0;
			} else {
				// Weekends: lower chance
				count = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
			}

			contributions.push({
				date: d.toISOString().split("T")[0],
				count,
				level:
					count === 0
						? 0
						: count <= 2
							? 1
							: count <= 4
								? 2
								: count <= 7
									? 3
									: 4,
			});
		}

		return contributions;
	}, []);

	useEffect(() => {
		const fetchContributions = async () => {
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

				if (data.error) {
					setError(data.error);
				}

				setContributions(data.contributions);
				setTotalContributions(data.totalContributions);
			} catch (err) {
				console.error("Error fetching contributions:", err);
				setError("Failed to load contributions");

				// Fallback to mock data if API fails
				const mockContributions = generateRealisticContributions();
				setContributions(mockContributions);
				setTotalContributions(
					mockContributions.reduce((sum, day) => sum + day.count, 0),
				);
			} finally {
				setLoading(false);
			}
		};

		if (username) {
			fetchContributions();
		}
	}, [username, generateRealisticContributions]);

	const getContributionColor = (level: number): string => {
		switch (level) {
			case 0:
				return "#161b22"; // GitHub's background color for no contributions
			case 1:
				return "#0e4429"; // Light green
			case 2:
				return "#006d32"; // Medium green
			case 3:
				return "#26a641"; // Darker green
			case 4:
				return "#39d353"; // Darkest green
			default:
				return "#161b22";
		}
	};

	const getWeeksInYear = (
		contributions: ContributionDay[],
	): ContributionDay[][] => {
		const weeks: ContributionDay[][] = [];
		let currentWeek: ContributionDay[] = [];

		contributions.forEach((day, index) => {
			const dayOfWeek = new Date(day.date).getDay();

			if (index === 0) {
				// Fill empty days at the start of the first week
				for (let i = 0; i < dayOfWeek; i++) {
					currentWeek.push({
						date: "",
						count: 0,
						level: 0,
					});
				}
			}

			currentWeek.push(day);

			if (dayOfWeek === 6 || index === contributions.length - 1) {
				// End of week (Saturday) or end of data
				while (currentWeek.length < 7) {
					currentWeek.push({
						date: "",
						count: 0,
						level: 0,
					});
				}
				weeks.push(currentWeek);
				currentWeek = [];
			}
		});

		return weeks;
	};

	const weeks = contributions.length > 0 ? getWeeksInYear(contributions) : [];

	if (loading) {
		return (
			<div className="font-mono">
				<div className="flex items-start gap-3 py-3">
					<span className="text-green-400 text-sm mt-0.5 select-none font-bold">
						❯
					</span>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-3">
							<span className="text-cyan-400 text-sm font-medium">
								~/github/
							</span>
							<span className="text-foreground text-sm">contributions</span>
							<span className="text-yellow-400 text-xs animate-pulse">●</span>
						</div>
						<div className="contributions-scroll overflow-x-auto">
							<div
								className="inline-grid grid-flow-col gap-1"
								style={{
									gridTemplateRows: "repeat(7, 1fr)",
									minWidth: "700px",
								}}
							>
								{Array.from({ length: 371 }).map((_, i) => {
									const week = Math.floor(i / 7);
									const day = i % 7;
									return (
										<div
											key={`loading-week-${week}-day-${day}`}
											className="w-3 h-3 rounded-sm animate-pulse"
											style={{ backgroundColor: "oklch(0.20 0.02 240)" }}
										/>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="font-mono">
			<div className="flex items-start gap-3 py-3">
				<span className="text-green-400 text-sm mt-0.5 select-none font-bold">
					❯
				</span>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-3">
						<span className="text-cyan-400 text-sm font-medium">~/github/</span>
						<span className="text-foreground text-sm">contributions</span>
						<span className="text-green-400 text-xs">●</span>
						<span className="text-foreground/60 text-xs">
							{totalContributions} contributions
						</span>
					</div>
					{error && <p className="text-yellow-400 text-xs mb-3">{error}</p>}
					{/* Contributions Grid */}
					<div className="mb-4 relative">
						<div className="overflow-x-auto no-scrollbar">
							{/* Day labels - positioned exactly next to Mon, Wed, Fri squares */}
							<div
								className="absolute left-0 text-xs text-foreground/60 font-mono hidden md:block"
								style={{ top: "4px" }}
							>
								<div className="h-4"></div> {/* Sun - 1st square */}
								<div className="h-4 flex items-center justify-end pr-1">
									Mon
								</div>{" "}
								{/* Mon - 2nd square */}
								<div className="h-4"></div> {/* Tue - 3rd square */}
								<div className="h-4 flex items-center justify-end pr-1">
									Wed
								</div>{" "}
								{/* Wed - 4th square */}
								<div className="h-4"></div> {/* Thu - 5th square */}
								<div className="h-4 flex items-center justify-end pr-1">
									Fri
								</div>{" "}
								{/* Fri - 6th square */}
								<div className="h-4"></div> {/* Sat - 7th square */}
							</div>

							{/* Grid - GitHub style with proper gaps */}
							<div
								className="md:ml-7 inline-grid grid-flow-col gap-1"
								style={{
									gridTemplateRows: "repeat(7, 12px)",
									minWidth: "700px",
								}}
							>
								{weeks.map((week) =>
									week.map((day, dayIndex) => {
										const dayNames = [
											"Sun",
											"Mon",
											"Tue",
											"Wed",
											"Thu",
											"Fri",
											"Sat",
										];
										return (
											<div
												key={day.date}
												className="w-3 h-3 rounded-sm cursor-pointer relative"
												style={{
													backgroundColor: getContributionColor(day.level),
												}}
											/>
										);
									}),
								)}
							</div>
						</div>
					</div>{" "}
					{/* Legend */}
					<div className="flex items-center gap-2 text-xs text-foreground/60 mb-3">
						<span>Less</span>
						<div className="flex gap-1">
							{[0, 1, 2, 3, 4].map((level) => (
								<div
									key={level}
									className="w-3 h-3 rounded-sm"
									style={{ backgroundColor: getContributionColor(level) }}
								/>
							))}
						</div>
						<span>More</span>
					</div>
				</div>
			</div>
		</div>
	);
}
