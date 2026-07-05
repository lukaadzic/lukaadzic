type LsHomeOutputProps = {
	/** `ls -la` / `ls -a` — also list the dotfiles hiding in the home dir. */
	showHidden?: boolean;
};

/** `ls` — lists the fake home directory. Directories tinted like a real colorized `ls`. */
export function LsHomeOutput({ showHidden = false }: LsHomeOutputProps) {
	return (
		<div className="flex flex-wrap gap-x-6 gap-y-1">
			{showHidden && (
				<>
					<span className="text-faint">.beloved</span>
					<span className="text-faint">.vatreni</span>
				</>
			)}
			<span className="text-foreground">about.txt</span>
			<span className="text-[#6bc7f5]">projects/</span>
			<span className="text-[#6bc7f5]">socials/</span>
			<span className="text-foreground">resume.pdf</span>
			<span className="text-[#5fd75f]">penalty.sh</span>
		</div>
	);
}
