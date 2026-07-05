import { VATRENI } from "@/lib/easter-eggs";

const CHECKER_ROWS = 5;
const CHECKER_COLS = 8;

/** Classic šahovnica red, toned slightly for a dark background. */
function squareClass(row: number, col: number): string {
	return (row + col) % 2 === 0 ? "text-[#e63946]" : "text-foreground";
}

/** Precomputed once at module scope — the grid is static, so cells carry a
 * stable id independent of render-time array indices. */
const CHECKER_CELLS = Array.from(
	{ length: CHECKER_ROWS * CHECKER_COLS },
	(_, i) => {
		const row = Math.floor(i / CHECKER_COLS);
		const col = i % CHECKER_COLS;
		return { id: `${row}-${col}`, row, col };
	},
);

/** `vatreni` / `hrvatska` / `croatia` — a compact šahovnica + Modrić-era stats. */
export function VatreniOutput() {
	return (
		<div className="leading-relaxed">
			<div
				aria-hidden="true"
				className="grid select-none gap-0 font-mono text-[11px] leading-[1.15] sm:text-[12px]"
				style={{ gridTemplateColumns: `repeat(${CHECKER_COLS}, 1ch)` }}
			>
				{CHECKER_CELLS.map((cell) => (
					<span key={cell.id} className={squareClass(cell.row, cell.col)}>
						█
					</span>
				))}
			</div>
			<span className="sr-only">Croatian checkerboard, the šahovnica</span>
			<p className="mt-2 text-foreground">{VATRENI.heading}</p>
			<p className="text-muted">{VATRENI.summary}</p>
			<p className="text-faint">{VATRENI.closer}</p>
			<p className="mt-2 text-faint">
				4 straight world cup shootout wins ('18, '22) — try `penalty`
			</p>
		</div>
	);
}
