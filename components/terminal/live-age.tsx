"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

const BIRTH_TIMESTAMP = new Date(
	SITE.birthDate.year,
	SITE.birthDate.month,
	SITE.birthDate.day,
).getTime();

// Placeholder shown until the client mounts, sized to match the final
// "XX.XXXXXXXX" format so nothing shifts once the real value lands.
const PLACEHOLDER = "20.00000000";

function calculateAge(): number {
	return (Date.now() - BIRTH_TIMESTAMP) / MS_PER_YEAR;
}

export function LiveAge() {
	const [age, setAge] = useState<number | null>(null);

	useEffect(() => {
		setAge(calculateAge());

		const interval = setInterval(() => {
			setAge(calculateAge());
		}, 50);

		return () => clearInterval(interval);
	}, []);

	return (
		<span
			className="font-mono tabular-nums text-accent"
			suppressHydrationWarning
		>
			{age === null ? PLACEHOLDER : age.toFixed(8)}
		</span>
	);
}
