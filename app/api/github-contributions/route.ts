import { type NextRequest, NextResponse } from "next/server";
import {
	generateFallbackContributions,
	getContributionLevel,
} from "@/lib/github-contributions";
import { SITE } from "@/lib/site";

const GITHUB_USERNAME_REGEX =
	/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

const SUCCESS_CACHE_CONTROL =
	"public, s-maxage=3600, stale-while-revalidate=86400";

function fallbackResponse() {
	const fallbackData = generateFallbackContributions();
	return NextResponse.json(
		{
			...fallbackData,
			isFallback: true,
		},
		{
			status: 200,
			headers: { "Cache-Control": SUCCESS_CACHE_CONTROL },
		},
	);
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const username = searchParams.get("username");

	if (
		!username ||
		!GITHUB_USERNAME_REGEX.test(username) ||
		username !== SITE.githubUsername
	) {
		return NextResponse.json(
			{ error: "Invalid username" },
			{ status: 400, headers: { "Cache-Control": "no-store" } },
		);
	}

	try {
		const token = process.env.GITHUB_TOKEN;

		if (!token) {
			console.error("github-contributions: GITHUB_TOKEN is not configured");
			return fallbackResponse();
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
			next: { revalidate: 3600 },
		});

		if (!response.ok) {
			console.error(
				`github-contributions: GitHub GraphQL API error: ${response.status}`,
			);
			return fallbackResponse();
		}

		const data = await response.json();

		if (data.errors) {
			console.error(
				"github-contributions: GraphQL error",
				data.errors[0]?.message || "Unknown error",
			);
			return fallbackResponse();
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

		return NextResponse.json(
			{
				contributions,
				totalContributions: contributionCalendar.totalContributions,
			},
			{ headers: { "Cache-Control": SUCCESS_CACHE_CONTROL } },
		);
	} catch (error) {
		console.error(
			"github-contributions: unexpected error",
			error instanceof Error ? error.message : error,
		);
		return fallbackResponse();
	}
}
