import { SITE } from "@/lib/site";

/** Tiny 5-row pixel-font glyphs — just enough letters to spell the name. */
const GLYPHS: Record<string, readonly string[]> = {
	l: ["█    ", "█    ", "█    ", "█    ", "█████"],
	u: ["█   █", "█   █", "█   █", "█   █", " ███ "],
	k: ["█  █ ", "█ █  ", "██   ", "█ █  ", "█  █ "],
	a: [" ███ ", "█   █", "█████", "█   █", "█   █"],
};
const BLANK_GLYPH = ["     ", "     ", "     ", "     ", "     "];

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

const FIRST_NAME = SITE.name.split(" ")[0];
const BANNER = buildBanner(FIRST_NAME.toLowerCase());

export function WelcomeOutput() {
	return (
		<div className="leading-relaxed">
			{/* Screen-reader text alternative for the decorative banner below. */}
			<span className="sr-only">{FIRST_NAME}</span>

			{/* >=480px: the full pixel-font banner. Narrow enough (23 columns)
			    to never wrap or overflow at any supported width. */}
			<pre
				aria-hidden="true"
				className="hidden select-none whitespace-pre font-mono text-[10px] leading-[1.15] text-[#5fd75f] min-[480px]:block sm:text-[12px]"
			>
				{BANNER}
			</pre>

			{/* <480px: styled name text instead of the banner — guarantees zero
			    horizontal overflow on the smallest screens. */}
			<p
				aria-hidden="true"
				className="font-bold text-[#5fd75f] text-sm tracking-[0.3em] min-[480px]:hidden"
			>
				{FIRST_NAME.toLowerCase()}
			</p>

			<p className="mt-2 text-foreground">
				Hi, I&apos;m {FIRST_NAME} — Student @ Wharton · Philadelphia.
			</p>
			<p className="text-faint">
				Type a command, or click one below. Try `./everything.sh` to see it all.
			</p>
		</div>
	);
}
