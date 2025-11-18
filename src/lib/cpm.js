// Clamp helper: keeps a number between [min, max]
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Remove a leading setcps(...) line from a tune (plus blank line after it)
export const stripSetcps = (txt = "") => {
    const lines = txt.split(/\r?\n/);
    // If the first line starts with "setcps(", drop it
    if (lines[0]?.trim().toLowerCase().startsWith("setcps(")) {
        lines.shift();              
        // Also drop an immediate blank line after setcps, if present
        if (lines[0]?.trim() === "") lines.shift(); 
    }
    return lines.join("\n");
};

// Build the final Strudel tune text with CPS, volume and FX applied
export const makeTune = (cpm, volume, body, opts = {}) => {
    // Convert CPM into a safe integer CPS value
    const cps = Math.max(1, Math.round(+cpm || 120));
    // Master volume clamped between 0–1
    const vol = Number.isFinite(+volume) ? clamp(+volume, 0, 1) : 1;

    // Build FX / routing chain lines, skipping any that are disabled
    const fxLines = [
        `all(x => x.gain(${vol}))`,
        opts.reverb ? `all(x => x.room(${clamp(opts.reverbAmt ?? 0.4, 0, 1)}))` : "",
        opts.delay ? `all(x => x.delay(${clamp(opts.delayAmt ?? 0.25, 0, 2)}))` : "",
        opts.lpf ? `all(x => x.lpf(${clamp(opts.lpfCut ?? 6000, 100, 12000)}))` : "",
        opts.kit ? `all(x => x.bank("${opts.kit}"))` : "",
    ].filter(Boolean).join("\n");

    // Final Strudel source: setcps + FX + body
    return `setcps(${cps}/240)
${fxLines}

${body ?? ''}`;
};