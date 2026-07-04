export type ContributionDay = {
	date: string;
	count: number;
	level: number;
};

export type ContributionsData = {
	contributions: ContributionDay[];
	totalContributions: number;
};

export function getContributionLevel(count: number): number {
	if (count === 0) return 0;
	if (count < 3) return 1;
	if (count < 6) return 2;
	if (count < 10) return 3;
	return 4;
}

export function generateFallbackContributions(): ContributionsData {
	// Generate realistic fallback data
	const contributions: ContributionDay[] = [];
	const today = new Date();
	const yearAgo = new Date(today);
	yearAgo.setFullYear(today.getFullYear() - 1);

	let totalContributions = 0;

	for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
		const dayOfWeek = d.getDay();
		let count = 0;

		// More realistic pattern: more activity on weekdays
		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			count = Math.random() < 0.7 ? Math.floor(Math.random() * 8) + 1 : 0;
		} else {
			count = Math.random() < 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
		}

		// Add some periods of higher/lower activity
		const weekOfYear = Math.floor(
			(d.getTime() - yearAgo.getTime()) / (7 * 24 * 60 * 60 * 1000),
		);
		if (weekOfYear % 8 === 0) count = Math.floor(count * 0.3); // Low activity periods
		if (weekOfYear % 12 === 0) count = Math.min(count * 2, 15); // High activity periods

		totalContributions += count;

		contributions.push({
			date: d.toISOString().split("T")[0],
			count,
			level: getContributionLevel(count),
		});
	}

	return { contributions, totalContributions };
}
