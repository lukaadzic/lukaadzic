import { SITE } from "@/lib/site";

export type WorkExperience = {
	role: string;
	org: string;
	href?: string;
	location: string;
	period: string;
	description: string;
};

export const WORK_EXPERIENCE: WorkExperience[] = [
	{
		role: "Software Engineer",
		org: "Community for Rigor",
		href: SITE.workLinks.c4r,
		location: "Philadelphia, PA",
		period: "May 2026 – present",
		description:
			"Building interactive lessons for a research-backed learning platform in React, Next.js, and MongoDB — live across 7+ university partners, plus the D3 charts and peer-response comparisons behind the stats modules.",
	},
	{
		role: "AI Researcher",
		org: "The Wharton School, UPenn",
		href: SITE.workLinks.wharton,
		location: "Philadelphia, PA",
		period: "March 2026 – present",
		description:
			"Engineering agentic systems that automate hypothesis generation and analysis in statistical genetics, using LLMs to synthesize literature and genomic data so the research stays reproducible.",
	},
	{
		role: "Quantitative Researcher",
		org: "University of Sydney",
		href: SITE.workLinks.sydney,
		location: "Sydney, Australia",
		period: "May 2025 – August 2025",
		description:
			"Modeled 26+ S&P 500 companies in Python and MATLAB to catch speculative price bubbles, then ran rolling-window backtests across volatility regimes to stress-test the signals.",
	},
];
