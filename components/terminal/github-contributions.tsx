"use client";

import { useEffect, useRef, useState } from "react";
import {
	type ContributionDay,
	generateFallbackContributions,
} from "@/lib/github-contributions";

interface GitHubContributionsProps {
	username: string;
}

interface GitHubContributionsResponse {
	contributions: ContributionDay[];
	totalContributions: number;
	isFallback?: boolean;
}

// Unicode block sparkline — the most terminal-native way to print a year of
// activity, and it always fits the content width with zero horizontal scroll.
const SPARK_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;

/**
 * Parses a YYYY-MM-DD string as a LOCAL calendar date. `new Date("2026-07-04")`
 * parses as UTC midnight, so `.getDay()` shifts the weekday for every visitor
 * in a timezone behind UTC.
 */
function parseLocalDate(dateStr: string): Date {
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function getWeeksInYear(contributions: ContributionDay[]): ContributionDay[][] {
	const weeks: ContributionDay[][] = [];
	let currentWeek: ContributionDay[] = [];
	let placeholderIndex = 0;

	contributions.forEach((day, index) => {
		const dayOfWeek = parseLocalDate(day.date).getDay();

		if (index === 0) {
			for (let i = 0; i < dayOfWeek; i++) {
				currentWeek.push({
					date: `placeholder-start-${placeholderIndex++}`,
					count: 0,
					level: 0,
				});
			}
		}

		currentWeek.push(day);

		if (dayOfWeek === 6 || index === contributions.length - 1) {
			while (currentWeek.length < 7) {
				currentWeek.push({
					date: `placeholder-end-${placeholderIndex++}`,
					count: 0,
					level: 0,
				});
			}
			weeks.push(currentWeek);
			currentWeek = [];
		}
	});

	return weeks;
}

type SparkBucket = {
	key: string;
	total: number;
	startDate: string;
};

/** Sums each group of `weeksPerBucket` weeks into one sparkline glyph. */
function buildBuckets(
	weeks: ContributionDay[][],
	weeksPerBucket: number,
): SparkBucket[] {
	const buckets: SparkBucket[] = [];

	for (let i = 0; i < weeks.length; i += weeksPerBucket) {
		const group = weeks.slice(i, i + weeksPerBucket);
		const days = group.flat();
		const firstRealDay = days.find(
			(day) => !day.date.startsWith("placeholder"),
		);

		buckets.push({
			key: firstRealDay?.date ?? `bucket-${i}`,
			total: days.reduce((sum, day) => sum + day.count, 0),
			startDate: firstRealDay?.date ?? "",
		});
	}

	return buckets;
}

// sqrt scaling keeps typical weeks visible instead of letting a couple of
// spike-weeks flatten everything else; any activity renders at least level 1.
function sparkLevel(total: number, max: number): number {
	if (max === 0 || total === 0) return 0;
	return Math.min(
		SPARK_CHARS.length - 1,
		Math.max(1, Math.round(Math.sqrt(total / max) * (SPARK_CHARS.length - 1))),
	);
}

const LEVEL_OPACITY = [0.15, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1] as const;

/**
 * Occupies the *exact* final height of the real content below (sparkline
 * row + summary line) so the crossfade from skeleton to data never shifts
 * the layout. That means matching structure, not just guessing pixel
 * heights: each bar is an inline-block spanning the same font-size/
 * line-height context (`leading-relaxed`, inherited `text-[13px]
 * sm:text-[14px]`) as its real counterpart, with a non-breaking space to
 * generate a real line box — a background-color on an inline element
 * paints across that whole line box, so the bar's rendered height is
 * pixel-identical to the text row it's standing in for, at every
 * breakpoint, without hardcoding em/px values that could drift out of sync.
 * Exported so `github-contributions-lazy.tsx` can reuse the identical
 * markup as its `loading` fallback instead of a second hand-maintained copy.
 */
export function ContributionsSkeleton() {
	return (
		<div aria-hidden="true" className="leading-relaxed">
			<span className="inline-block w-full max-w-[420px] animate-pulse rounded-[2px] bg-white/[0.06] text-[13px] sm:text-[14px] motion-reduce:animate-none">
				&nbsp;
			</span>
			<p className="mt-1">
				<span className="inline-block w-56 animate-pulse rounded-[2px] bg-white/[0.04] text-[13px] sm:text-[14px] motion-reduce:animate-none">
					&nbsp;
				</span>
			</p>
		</div>
	);
}

export function GitHubContributions({ username }: GitHubContributionsProps) {
	const [contributions, setContributions] = useState<ContributionDay[]>([]);
	const [loading, setLoading] = useState(true);
	const [isFallback, setIsFallback] = useState(false);
	const [totalContributions, setTotalContributions] = useState(0);
	// How many glyphs fit the row. Glyph advance depends on which font
	// supplies the block elements, so a hidden probe glyph is measured and
	// the bucket count derived from it; flex-1 cells then stretch the row
	// to the full content width.
	const [bucketCount, setBucketCount] = useState(26);
	const containerRef = useRef<HTMLDivElement>(null);
	const probeRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		// Refs only exist once the skeleton is replaced by real content.
		if (loading) return;
		const measure = () => {
			const container = containerRef.current;
			const probe = probeRef.current;
			if (!container || !probe) return;
			const glyphWidth = probe.getBoundingClientRect().width;
			const rowWidth = container.clientWidth;
			if (glyphWidth > 0 && rowWidth > 0) {
				setBucketCount(Math.max(8, Math.floor(rowWidth / glyphWidth)));
			}
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [loading]);

	useEffect(() => {
		let cancelled = false;

		async function fetchContributions() {
			try {
				setLoading(true);
				setIsFallback(false);

				const response = await fetch(
					`/api/github-contributions?username=${encodeURIComponent(username)}`,
				);

				if (!response.ok) {
					throw new Error(`Failed to fetch contributions: ${response.status}`);
				}

				const data: GitHubContributionsResponse = await response.json();
				if (cancelled) return;

				if (data.isFallback) {
					setIsFallback(true);
				}

				setContributions(data.contributions);
				setTotalContributions(data.totalContributions);
			} catch {
				if (cancelled) return;

				setIsFallback(true);
				const fallback = generateFallbackContributions();
				setContributions(fallback.contributions);
				setTotalContributions(fallback.totalContributions);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		if (username) {
			fetchContributions();
		} else {
			setIsFallback(true);
			const fallback = generateFallbackContributions();
			setContributions(fallback.contributions);
			setTotalContributions(fallback.totalContributions);
			setLoading(false);
		}

		return () => {
			cancelled = true;
		};
	}, [username]);

	if (loading) {
		return <ContributionsSkeleton />;
	}

	const weeks = contributions.length > 0 ? getWeeksInYear(contributions) : [];
	const weeksPerBucket = Math.max(1, Math.ceil(weeks.length / bucketCount));
	const buckets = buildBuckets(weeks, weeksPerBucket);
	const max = buckets.reduce((acc, bucket) => Math.max(acc, bucket.total), 0);

	return (
		<div
			ref={containerRef}
			className="github-contributions-in relative leading-relaxed"
		>
			<span
				ref={probeRef}
				aria-hidden="true"
				className="invisible absolute text-[13px] sm:text-[14px]"
			>
				█
			</span>
			<div
				aria-hidden="true"
				className="flex w-full text-[13px] text-foreground sm:text-[14px]"
			>
				{buckets.map((bucket) => {
					const level = sparkLevel(bucket.total, max);
					return (
						<span
							key={bucket.key}
							className="min-w-0 flex-1 text-center"
							style={{ opacity: LEVEL_OPACITY[level] }}
							title={
								bucket.startDate
									? `${bucket.total} contribution${bucket.total === 1 ? "" : "s"} · week of ${bucket.startDate}`
									: undefined
							}
						>
							{SPARK_CHARS[level]}
						</span>
					);
				})}
			</div>
			<p className="mt-1 text-muted">
				{totalContributions} contribution
				{totalContributions === 1 ? "" : "s"} in the last year
				{isFallback ? " · sample data" : ""}
			</p>
		</div>
	);
}
