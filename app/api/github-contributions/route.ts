import { type NextRequest, NextResponse } from "next/server";
import {
	generateFallbackContributions,
	getContributionLevel,
} from "@/lib/github-contributions";

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
