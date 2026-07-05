/** Bare `ls` — lists the fake home directory. Directories tinted like a real colorized `ls`. */
export function LsHomeOutput() {
	return (
		<div className="flex flex-wrap gap-x-6 gap-y-1">
			<span className="text-foreground">about.txt</span>
			<span className="text-[#6bc7f5]">projects/</span>
			<span className="text-[#6bc7f5]">socials/</span>
			<span className="text-foreground">resume.pdf</span>
		</div>
	);
}
