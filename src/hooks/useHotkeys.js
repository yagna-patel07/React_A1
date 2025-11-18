import { useEffect } from "react";

// Custom hook for global keyboard shortcuts (play/stop/volume)
export default function useHotkeys({ onPlay, onStop, onVol }) {
    useEffect(() => {
        const h = (e) => {
            // Ignore shortcuts while typing in inputs / textareas
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            // Space = toggle play (parent decides what onPlay does)
            if (e.code === "Space") { e.preventDefault(); onPlay?.(); }
            // S key = stop
            if (e.code === "KeyS") { onStop?.(); }
            // Up / Down arrows = adjust volume by small steps
            if (e.code === "ArrowUp") { onVol?.(+0.05); }
            if (e.code === "ArrowDown") { onVol?.(-0.05); }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onPlay, onStop, onVol]);
}
