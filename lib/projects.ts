export type Project = {
	slug: string;
	description: string;
	href: string;
};

export const PROJECTS: Project[] = [
	{
		slug: "financial-bubble-detection-dashboard",
		description: "Real-time financial bubble detection using options data",
		href: "https://github.com/lukaadzic/financial-bubble-detection-dashboard",
	},
	{
		slug: "maritime-penn-web-app",
		description: "Building tomorrow's maritime leaders at UPenn & Wharton",
		href: "https://pennmaritime.club/",
	},
	{
		slug: "algorithmic-trading-system-live-pnl",
		description:
			"A live systematic trading system combining quantitative trend signals and NLP-driven sentiment analysis to execute and manage a real equity portfolio.",
		href: "https://github.com/lukaadzic/Live-Algorithmic-Trading-System",
	},
	{
		slug: "fifa-momentum-tracker",
		description:
			"Cracking EAFC/FIFA's dynamic difficulty algorithms through OpenCV and ML-driven pattern recognition.",
		href: "https://github.com/lukaadzic/fifa-momentum-tracker",
	},
];
