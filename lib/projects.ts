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
		description:
			"Penn's first maritime club — founder & president, 100+ members",
		href: "https://pennmaritime.club/",
	},
	{
		slug: "algorithmic-trading-system-live-pnl",
		description:
			"Live systematic trading system — quantitative trend signals plus NLP sentiment on real capital, 22% realized return in two months.",
		href: "https://github.com/lukaadzic/Live-Algorithmic-Trading-System",
	},
	{
		slug: "fifa-momentum-tracker",
		description:
			"Cracking EAFC/FIFA's dynamic difficulty algorithms through OpenCV and ML-driven pattern recognition.",
		href: "https://github.com/lukaadzic/fifa-momentum-tracker",
	},
];
