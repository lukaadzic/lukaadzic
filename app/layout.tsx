import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  title: "Luka Adzic's Portfolio",
  description:
    "Here's some stuff I've built, things I've worked on, and where to find me online.",
  icons: {
    icon: [
      { url: "/icon.jpeg", sizes: "any" },
      { url: "/icon.jpeg", type: "image/jpeg" },
    ],
    apple: "/icon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical routes for ultra fast navigation */}
        <link rel="prefetch" href="/journals" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${jetbrainsMono.variable} antialiased font-jetbrains-mono`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
