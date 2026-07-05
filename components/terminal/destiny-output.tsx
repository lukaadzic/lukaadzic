"use client";

import Image from "next/image";
import { openDestiny } from "@/components/terminal/destiny-easter-egg";

/** Runs a command through the session, exactly like tapping a suggestion chip. */
function runCommand(command: string) {
	window.dispatchEvent(new CustomEvent("terminal:run", { detail: command }));
}

const TRIGGER_CHIP_CLASS =
	"terminal-chip border-[#f0a6ca]/25 text-[#f0a6ca]/80 hover:border-[#f0a6ca]/45 hover:text-[#f0a6ca]";

/**
 * `destiny` — her own section, easily accessible (chip + help). The three
 * playful reveals are one tap away via the pink trigger chips below (the
 * konami chip fires the sequence directly — phones can't press ↑↑↓↓←→←→ba).
 * Pink (#f0a6ca) is her color, the one deliberate exception to the palette.
 */
export function DestinyOutput() {
	return (
		<div className="leading-relaxed">
			<p className="text-[#f0a6ca]">❤ destiny</p>
			<Image
				src="/images/destiny.jpg"
				alt="Destiny"
				width={180}
				height={240}
				className="mt-2 h-[240px] w-[180px] rounded-md object-cover"
			/>
			<p className="mt-2 text-foreground">my sweet angel girl. the one.</p>
			<p className="text-muted">
				entry is read-only. cannot be edited or deleted.
			</p>
			<p className="mt-3 text-faint">there's more — tap one:</p>
			<div className="mt-1.5 flex flex-wrap gap-2">
				<button
					type="button"
					className={TRIGGER_CHIP_CLASS}
					onClick={(event) => {
						event.stopPropagation();
						runCommand("love");
					}}
				>
					cat /etc/loved-ones
				</button>
				<button
					type="button"
					className={TRIGGER_CHIP_CLASS}
					onClick={(event) => {
						event.stopPropagation();
						runCommand("git log");
					}}
				>
					git log
				</button>
				<button
					type="button"
					className={TRIGGER_CHIP_CLASS}
					aria-label="Trigger the konami code reveal"
					onClick={(event) => {
						event.stopPropagation();
						openDestiny("classified");
					}}
				>
					↑↑↓↓←→←→ba
				</button>
			</div>
		</div>
	);
}
