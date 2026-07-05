"use client";

import { type ReactNode, useRef, useState } from "react";

type TerminalWindowProps = {
	children: ReactNode;
};

const TITLE = "lukaadzic — -zsh — 80×24";

export function TerminalWindow({ children }: TerminalWindowProps) {
	const [maximized, setMaximized] = useState(false);
	const [shaking, setShaking] = useState(false);
	const [minimizing, setMinimizing] = useState(false);
	const [showNiceTry, setShowNiceTry] = useState(false);
	const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	function handleClose() {
		setShaking(false);
		// Force a reflow so retriggering the animation class works even if
		// clicked twice in quick succession.
		requestAnimationFrame(() => setShaking(true));
		setShowNiceTry(true);

		if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
		if (toastTimeout.current) clearTimeout(toastTimeout.current);

		shakeTimeout.current = setTimeout(() => setShaking(false), 420);
		toastTimeout.current = setTimeout(() => setShowNiceTry(false), 1400);
	}

	function handleMinimize() {
		if (minimizing) return;
		setMinimizing(true);
	}

	function handleMaximize() {
		setMaximized((prev) => !prev);
	}

	return (
		<div
			className={`terminal-window-in relative mx-auto w-full transition-[max-width] duration-300 ease-out ${
				maximized ? "max-w-[960px]" : "max-w-[720px]"
			} ${shaking ? "terminal-shake" : ""} ${
				minimizing ? "terminal-minimize" : ""
			}`}
			onAnimationEnd={(event) => {
				if (event.animationName === "terminal-minimize") {
					setMinimizing(false);
				}
			}}
		>
			<div className="overflow-hidden rounded-[12px] border border-white/10 bg-[rgba(30,30,32,0.92)] shadow-[0_0_0_0.5px_rgba(0,0,0,0.6),0_20px_50px_rgba(0,0,0,0.55),0_8px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
				<div className="relative flex h-[38px] items-center justify-center bg-gradient-to-b from-white/[0.07] to-black/[0.15] px-3 backdrop-blur-sm">
					<div className="group absolute left-5 flex items-center gap-2">
						<button
							type="button"
							aria-label="Close"
							onClick={handleClose}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none text-[8px] leading-none text-black/60 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								×
							</span>
						</button>
						<button
							type="button"
							aria-label="Minimize"
							onClick={handleMinimize}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none text-[8px] leading-none text-black/60 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								−
							</span>
						</button>
						<button
							type="button"
							aria-label="Zoom"
							onClick={handleMaximize}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none text-[8px] leading-none text-black/60 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								+
							</span>
						</button>
					</div>

					<p className="select-none truncate font-sans text-[13px] font-medium text-white/[0.55]">
						{TITLE}
					</p>

					{showNiceTry && (
						<span
							aria-hidden="true"
							className="terminal-toast absolute left-3 top-full mt-1.5 rounded-md bg-black/80 px-2 py-1 text-[11px] text-white/80"
						>
							nice try 🙂
						</span>
					)}
				</div>

				<div className="p-5 sm:p-6">{children}</div>
			</div>
		</div>
	);
}
