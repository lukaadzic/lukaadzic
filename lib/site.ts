export const SITE = {
	name: "Luka Adzic",
	url: "https://lukaadzic.dev",
	title: "Luka Adzic's Portfolio",
	description:
		"Here's some stuff I've built, things I've worked on, and where to find me online.",
	keywords: [
		"Luka Adzic",
		"Luka Adzic Portfolio",
		"Luka Adzic Investment banking",
		"Luka Adzic Quant Trading",
		"Luka Adzic Projects",
		"Luka Adzic Startup",
		"Startup founder Luka Adzic",
		"Portfolio",
		"Programmer Luka Adzic",
		"Software Engineer Luka Adzic",
		"University of Pennsylvania Luka Adzic",
		"Luka Adzic GitHub",
		"Luka Adzic Twitter",
		"Luka Adzic Instagram",
		"Luka Adzic Facebook",
		"Luka Adzic Wharton",
		"Luka Adzic LinkedIn",
		"Personal Website",
		"Contact Luka Adzic",
	],
	email: "lukaadz@wharton.upenn.edu",
	// Matches `new Date(2005, 11, 7)` from the LiveAge calculation in app/page.tsx.
	// `month` is 0-indexed (JS Date constructor convention), so 11 = December.
	birthDate: {
		year: 2005,
		month: 11,
		day: 7,
	},
	githubUsername: "lukaadzic",
	resumePath: "/ADZIC_LUKA_RESUME.pdf",
} as const;

export type Site = typeof SITE;
