import { useEffect } from "react";

export default function useHotkeys({ onPlay, onStop, onVol }) {
    useEffect(() => {
        const h = (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.code === "Space") { e.preventDefault(); onPlay?.(); }
            if (e.code === "KeyS") { onStop?.(); }
            if (e.code === "ArrowUp") { onVol?.(+0.05); }
            if (e.code === "ArrowDown") { onVol?.(-0.05); }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onPlay, onStop, onVol]);
}
