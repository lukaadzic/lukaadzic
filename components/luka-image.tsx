import Image from "next/image";

export default function LukaImage() {
	return (
		<div className="flex justify-center w-full mb-8">
			<Image
				src="/Luka.jpeg"
				alt="Luka Adzic"
				width={892}
				height={595.33}
				className="rounded-[30px] object-cover shadow-lg border border-foreground/10"
				style={{ maxWidth: "100%", height: "auto" }}
				priority
			/>
		</div>
	);
}
