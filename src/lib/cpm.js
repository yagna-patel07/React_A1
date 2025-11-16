
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const stripSetcps = (txt = "") => {
    const lines = txt.split(/\r?\n/);
    if (lines[0]?.trim().toLowerCase().startsWith("setcps(")) {
        lines.shift();                  
        if (lines[0]?.trim() === "") lines.shift(); 
    }
    return lines.join("\n");
};

export const makeTune = (cpm, volume, body,opts = {}) => {
    const cps = Math.max(1, Math.round(+cpm || 120));
    const vol = Number.isFinite(+volume) ? clamp(+volume, 0, 1) : 1;

    const fxLines = [
        `all(x => x.gain(${vol}))`,
        opts.reverb ? `all(x => x.room(${clamp(opts.reverbAmt ?? 0.4, 0, 1)}))` : "",
        opts.delay ? `all(x => x.delay(${clamp(opts.delayAmt ?? 0.25, 0, 2)}))` : "",
        opts.lpf ? `all(x => x.lpf(${clamp(opts.lpfCut ?? 6000, 100, 12000)}))` : "",
        opts.kit ? `all(x => x.bank("${opts.kit}"))` : "",
    ].filter(Boolean).join("\n");

    return `setcps(${cps}/240)
${fxLines}

${body ?? ''}`;
};