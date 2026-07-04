import { SITE } from "@/lib/site";

export function WelcomeOutput() {
	return (
		<div className="leading-relaxed">
			<p className="text-foreground">
				Hi, I&apos;m {SITE.name.split(" ")[0]} — Student @ Wharton ·
				Philadelphia.
			</p>
			<p className="text-faint">
				Type a command, or click one below. Try `./everything.sh` to see it all.
			</p>
		</div>
	);
}
