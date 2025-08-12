import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const username = searchParams.get("username");

	if (!username) {
		return NextResponse.json(
			{ error: "Username is required" },
			{ status: 400 },
		);
	}

	try {
		const token = process.env.GITHUB_TOKEN;

		if (!token) {
			// Without token, return fallback data
			const fallbackData = generateFallbackContributions();
			return NextResponse.json({
				...fallbackData,
				hasPrivateAccess: false,
				reposChecked: 0,
				error: "No GitHub token provided - showing sample data",
			});
		}

		// Use GitHub GraphQL API for accurate contribution data
		const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
          repositories(first: 100) {
            totalCount
          }
        }
      }
    `;

		const response = await fetch("https://api.github.com/graphql", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				"User-Agent": "GitHub-Contributions-Chart",
			},
			body: JSON.stringify({
				query,
				variables: { username },
			}),
		});

		if (!response.ok) {
			throw new Error(`GitHub GraphQL API error: ${response.status}`);
		}

		const data = await response.json();

		if (data.errors) {
			console.error("GraphQL errors:", data.errors);
			throw new Error(
				`GraphQL error: ${data.errors[0]?.message || "Unknown error"}`,
			);
		}

		// Define proper types for the GraphQL response
		interface ContributionDay {
			date: string;
			contributionCount: number;
		}

		interface Week {
			contributionDays: ContributionDay[];
		}

		interface ContributionCalendar {
			weeks: Week[];
			totalContributions: number;
		}

		interface User {
			contributionsCollection: {
				contributionCalendar: ContributionCalendar;
			};
			repositories: {
				totalCount: number;
			};
		}

		interface GraphQLResponse {
			data: {
				user: User;
			};
		}

		const typedData = data as GraphQLResponse;
		const { user } = typedData.data;
		const contributionCalendar =
			user.contributionsCollection.contributionCalendar;

		// Transform GitHub's contribution data
		const contributions = contributionCalendar.weeks
			.flatMap((week: Week) => week.contributionDays)
			.map((day: ContributionDay) => ({
				date: day.date,
				count: day.contributionCount,
				level: getContributionLevel(day.contributionCount),
			}));

		return NextResponse.json({
			contributions,
			totalContributions: contributionCalendar.totalContributions,
			reposChecked: user.repositories.totalCount,
			hasPrivateAccess: true,
		});
	} catch (error) {
		console.error("Error fetching GitHub contributions:", error);

		// Fallback to generating realistic mock data
		const mockData = generateFallbackContributions();
		return NextResponse.json({
			...mockData,
			hasPrivateAccess: false,
			reposChecked: 0,
			error: `API Error: ${error instanceof Error ? error.message : "Unknown error"}`,
		});
	}
}

function getContributionLevel(count: number): number {
	if (count === 0) return 0;
	if (count < 3) return 1;
	if (count < 6) return 2;
	if (count < 10) return 3;
	return 4;
}

function generateFallbackContributions(): {
	contributions: Array<{ date: string; count: number; level: number }>;
	totalContributions: number;
} {
	// Generate realistic fallback data
	const contributions: Array<{ date: string; count: number; level: number }> =
		[];
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
