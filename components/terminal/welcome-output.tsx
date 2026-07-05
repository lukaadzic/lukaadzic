import { SITE } from "@/lib/site";

/** Tiny 5-row pixel-font glyphs — just enough letters to spell the name. */
const GLYPHS: Record<string, readonly string[]> = {
	l: ["█    ", "█    ", "█    ", "█    ", "█████"],
	u: ["█   █", "█   █", "█   █", "█   █", " ███ "],
	k: ["█  █ ", "█ █  ", "██   ", "█ █  ", "█  █ "],
	a: [" ███ ", "█   █", "█████", "█   █", "█   █"],
	d: ["████ ", "█   █", "█   █", "█   █", "████ "],
	z: ["█████", "   █ ", "  █  ", " █   ", "█████"],
	i: ["███", " █ ", " █ ", " █ ", "███"],
	c: [" ████", "█    ", "█    ", "█    ", " ████"],
};
const BLANK_GLYPH = ["   ", "   ", "   ", "   ", "   "];

/** Renders `word` as a small block-letter ASCII banner, one row per line. */
function buildBanner(word: string): string {
	const rows = ["", "", "", "", ""];
	const chars = [...word];
	chars.forEach((char, index) => {
		const glyph = GLYPHS[char] ?? BLANK_GLYPH;
		const isLast = index === chars.length - 1;
		for (let row = 0; row < 5; row++) {
			rows[row] += glyph[row] + (isLast ? "" : " ");
		}
	});
	return rows.join("\n");
}

const [FIRST_NAME, LAST_NAME] = SITE.name.split(" ");
const BANNER_FULL = buildBanner(SITE.name.toLowerCase());
const BANNER_FIRST = buildBanner(FIRST_NAME.toLowerCase());
const BANNER_LAST = buildBanner((LAST_NAME ?? "").toLowerCase());

export function WelcomeOutput() {
	return (
		<div className="leading-relaxed">
			{/* Screen-reader text alternative for the decorative banner below. */}
			<span className="sr-only">{SITE.name}</span>

			{/* >=640px: the full name as a single-line pixel-font banner. */}
			<pre
				aria-hidden="true"
				className="hidden select-none whitespace-pre font-mono text-[11px] leading-[1.15] text-[#5fd75f] sm:block md:text-[12px]"
			>
				{BANNER_FULL}
			</pre>

			{/* <640px: same block letters, stacked first/last name so the banner
			    stays large without ever overflowing narrow screens. */}
			<pre
				aria-hidden="true"
				className="select-none whitespace-pre font-mono text-[10px] leading-[1.15] text-[#5fd75f] sm:hidden"
			>
				{BANNER_FIRST}
				{"\n\n"}
				{BANNER_LAST}
			</pre>

			<p className="mt-2 text-foreground">
				Hi, I&apos;m {FIRST_NAME} — {SITE.tagline}.
			</p>
			<p className="text-faint">type a command, or tap one below.</p>
		</div>
	);
}
