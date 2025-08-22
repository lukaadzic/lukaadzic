import Image from "next/image";

export default function LukaImage() {
	return (
		<div className="relative flex justify-center w-full mb-8">
			<Image
				src="/Luka.jpeg"
				alt="Luka Adzic"
				width={892}
				height={595.33}
				className="rounded-[30px] object-cover shadow-lg border border-foreground/10"
				style={{ maxWidth: "100%", height: "auto" }}
				priority
			/>
			{/* Signature overlay */}
			<div
				className="absolute"
				style={{
					right: "2.5%",
					bottom: "2.5%",
					pointerEvents: "none",
					zIndex: 2,
				}}
			>
				<Image
					src="/signature.svg"
					alt="Signature"
					width={180}
					height={60}
					className="drop-shadow-lg invert"
					style={{
						maxWidth: "30vw",
						minWidth: 80,
						height: "auto",
						opacity: 0.85,
					}}
					draggable={false}
					priority={false}
				/>
			</div>
		</div>
	);
}
