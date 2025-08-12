"use client";

import { Analytics } from "@vercel/analytics/next";

export default function ConditionalAnalytics() {
	// Only render on Vercel production deployments
	if (
		typeof window !== "undefined" &&
		process.env.VERCEL_ENV === "production"
	) {
		return <Analytics />;
	}

	return null;
}
