import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  // Load only the weights actually used to reduce critical requests
  weight: ["400", "600"],
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
  // Defer font loading to avoid blocking LCP
  preload: false,
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
        {/* Keep <head> lean to avoid extra connection setup during LCP */}
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
