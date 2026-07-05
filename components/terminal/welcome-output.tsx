import { ExternalLink } from "@/components/shared/external-link";
import { SITE, TAGLINE_PARTS } from "@/lib/site";

/** Subtle by design — foreground text, a faint underline, and only the
 * hover state hints these are links, so they don't compete with the
 * greeting for attention. */
const TAGLINE_LINK_CLASS =
	"text-foreground underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-accent";

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
				className="welcome-line welcome-line-2 hidden select-none whitespace-pre font-mono text-[11px] leading-[1.15] text-[#5fd75f] sm:block md:text-[12px]"
			>
				{BANNER_FULL}
			</pre>

			{/* <640px: same block letters, stacked first/last name so the banner
			    stays large without ever overflowing narrow screens. */}
			<pre
				aria-hidden="true"
				className="welcome-line welcome-line-2 select-none whitespace-pre font-mono text-[10px] leading-[1.15] text-[#5fd75f] sm:hidden"
			>
				{BANNER_FIRST}
				{"\n\n"}
				{BANNER_LAST}
			</pre>

			<p className="welcome-line welcome-line-3 mt-2 text-foreground">
				Hi, I&apos;m {FIRST_NAME} —{" "}
				{TAGLINE_PARTS.map((part, index) =>
					part.href ? (
						<ExternalLink
							key={`${part.text}-${index}`}
							href={part.href}
							className={TAGLINE_LINK_CLASS}
						>
							{part.text}
						</ExternalLink>
					) : (
						<span key={`${part.text}-${index}`}>{part.text}</span>
					),
				)}
				.
			</p>
			<p className="welcome-line welcome-line-4 text-faint">
				type a command, or tap one below.
			</p>
		</div>
	);
}
