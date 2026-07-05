import { SITE } from "@/lib/site";

export type Social = {
	label: string;
	handle: string;
	url: string;
};

export const SOCIALS: Social[] = [
	{
		label: "GitHub",
		handle: `@${SITE.githubUsername}`,
		url: `https://github.com/${SITE.githubUsername}`,
	},
	{
		label: "Twitter",
		handle: "@lukaadzic7",
		url: "https://twitter.com/lukaadzic7/",
	},
	{
		label: "LinkedIn",
		handle: "@lukaadzic",
		url: "https://linkedin.com/in/lukaadzic/",
	},
	{
		label: "Instagram",
		handle: "@lukaadzic7",
		url: "https://www.instagram.com/lukaadzic7/",
	},
	{
		label: "Facebook",
		handle: "@adzicluka",
		url: "https://www.facebook.com/adzicluka",
	},
];
