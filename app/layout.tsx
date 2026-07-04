import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SITE } from "@/lib/site";
import { SOCIALS } from "@/lib/socials";

const geistSans = Geist({
	subsets: ["latin"],
	weight: "variable",
	display: "swap",
	variable: "--font-geist-sans",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	style: ["normal", "italic"],
	display: "swap",
	variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE.url),
	title: SITE.title,
	description: SITE.description,
	keywords: [...SITE.keywords],
	icons: {
		icon: [
			{ url: "/icon.ico", sizes: "any" },
			{ url: "/icon.ico", type: "image/x-icon" },
		],
		apple: "/icon.ico",
	},
	openGraph: {
		title: SITE.title,
		description: SITE.description,
		url: SITE.url,
		siteName: "Luka Adzic Portfolio",
		images: [
			{
				url: "/icon.ico",
				width: 800,
				height: 800,
				alt: SITE.name,
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: SITE.title,
		description: SITE.description,
		images: ["/icon.ico"],
	},
	alternates: {
		canonical: SITE.url,
	},
	authors: [{ name: SITE.name, url: SITE.url }],
	robots: {
		index: true,
		follow: true,
		nocache: false,
	},
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

const personSchema = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: SITE.name,
	url: SITE.url,
	sameAs: [
		`https://github.com/${SITE.githubUsername}`,
		...SOCIALS.map((social) => social.url),
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content.
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
					}}
				/>
			</head>
			<body
				className={`${geistSans.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground antialiased`}
			>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
