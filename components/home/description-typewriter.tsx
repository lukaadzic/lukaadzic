"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveAge } from "@/components/home/live-age";
import { ExternalLink } from "@/components/shared/external-link";

type Segment =
	| { type: "text"; text: string }
	| { type: "link"; text: string; href: string }
	| { type: "age"; placeholder: string };

const SEGMENTS: Segment[] = [
	{ type: "age", placeholder: "20.00000000" },
	{ type: "text", text: " years old, studying finance " },
	{ type: "link", text: "@ Wharton", href: "https://www.wharton.upenn.edu/" },
	{ type: "text", text: "." },
];

const TYPE_SPEED_MS = 26;

function segmentLength(segment: Segment): number {
	return segment.type === "age"
		? segment.placeholder.length
		: segment.text.length;
}

const TOTAL_LENGTH = SEGMENTS.reduce(
	(sum, segment) => sum + segmentLength(segment),
	0,
);

function renderSegment(segment: Segment, visibleChars: number, key: number) {
	if (visibleChars <= 0) return null;

	if (segment.type === "age") {
		return <LiveAge key={key} />;
	}

	const text = segment.text.slice(0, visibleChars);

	if (segment.type === "link") {
		return (
			<ExternalLink
				key={key}
				href={segment.href}
				className="text-foreground transition-colors duration-200 hover:text-accent"
			>
				{text}
			</ExternalLink>
		);
	}

	return <span key={key}>{text}</span>;
}

export function DescriptionTypewriter() {
	const [charIndex, setCharIndex] = useState(0);
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		if (charIndex >= TOTAL_LENGTH) {
			setIsComplete(true);
			return;
		}

		const timeout = setTimeout(() => {
			setCharIndex((prev) => prev + 1);
		}, TYPE_SPEED_MS);

		return () => clearTimeout(timeout);
	}, [charIndex]);

	const typedContent = useMemo(() => {
		let remaining = charIndex;

		return SEGMENTS.map((segment, index) => {
			const length = segmentLength(segment);
			const visible = Math.max(0, Math.min(remaining, length));
			remaining -= length;
			return renderSegment(segment, visible, index);
		});
	}, [charIndex]);

	const fullContent = useMemo(
		() =>
			SEGMENTS.map((segment, index) =>
				renderSegment(segment, segmentLength(segment), index),
			),
		[],
	);

	return (
		<p className="relative text-[15px] leading-7 text-foreground/80 sm:text-[16px]">
			{/* Invisible full text reserves the final box height so nothing shifts while typing. */}
			<span aria-hidden="true" className="invisible">
				{fullContent}
			</span>
			<span className="absolute inset-0">
				{typedContent}
				<span
					aria-hidden="true"
					className={`ml-px inline-block w-[1ch] ${
						isComplete ? "typewriter-cursor-done" : "typewriter-cursor"
					}`}
				>
					|
				</span>
			</span>
		</p>
	);
}
