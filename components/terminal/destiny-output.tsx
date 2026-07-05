import Image from "next/image";

/**
 * `destiny` — her own section, easily accessible (chip + help), unlike the
 * three hidden triggers that open the modal reveals. Pink (#f0a6ca) is her
 * color, the one deliberate exception to the palette.
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
			<p className="mt-1 text-faint">
				psst — try `cat /etc/loved-ones`, `git log --oneline`, or the konami
				code.
			</p>
		</div>
	);
}
