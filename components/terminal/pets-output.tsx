import { PETS } from "@/lib/easter-eggs";

/** Cell size for the pixel grid — small enough to read as a portrait, large
 * enough that individual cells (paws, eyes) stay legible. */
const CELL_PX = 8;

function PetPortrait({ pet }: { pet: (typeof PETS)[number] }) {
	const cols = pet.grid[0]?.length ?? 0;

	return (
		<div className="flex flex-col items-center gap-2">
			<div
				aria-hidden="true"
				className="grid select-none gap-[1px]"
				style={{
					gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)`,
					gridAutoRows: `${CELL_PX}px`,
				}}
			>
				{pet.grid.flatMap((row, rowIndex) =>
					[...row].map((char, colIndex) => {
						const color = pet.palette[char] ?? "transparent";
						return (
							<span
								key={`${pet.id}-${rowIndex}-${colIndex}`}
								className="rounded-[1px]"
								style={{
									backgroundColor: color === "transparent" ? undefined : color,
								}}
							/>
						);
					}),
				)}
			</div>
			<div className="text-center">
				<p className="font-medium" style={{ color: pet.nameColor }}>
					{pet.name}
				</p>
				<p className="mt-0.5 font-mono text-[11px] text-faint">{pet.species}</p>
				<p className="mt-0.5 max-w-[9.5rem] text-[11px] text-faint">
					{pet.caption}
				</p>
				{pet.bornLine ? (
					<p className="mt-0.5 text-[10px] text-faint/70">{pet.bornLine}</p>
				) : null}
			</div>
		</div>
	);
}

/** `pets` — pixel-art portraits of the household, same colored-cell-grid
 * technique as the `vatreni` šahovnica. Content lives in `lib/easter-eggs.ts`
 * (single source of truth); this component only renders it. */
export function PetsOutput() {
	return (
		<div className="leading-relaxed">
			<p className="text-muted">the pets:</p>
			<div className="pets-portrait-row mt-3 flex flex-wrap justify-center gap-x-8 gap-y-6 sm:justify-start">
				{PETS.map((pet) => (
					<PetPortrait key={pet.id} pet={pet} />
				))}
			</div>
			<span className="sr-only">
				Pixel-art portraits of Modro and Vida, kittens born April 13, 2026, and
				Baby, the beagle.
			</span>
		</div>
	);
}
