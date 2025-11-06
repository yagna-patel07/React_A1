
export const stripSetcps = (txt = "") => {
    const lines = txt.split(/\r?\n/);
    if (lines[0]?.trim().toLowerCase().startsWith("setcps(")) {
        lines.shift();                  
        if (lines[0]?.trim() === "") lines.shift(); 
    }
    return lines.join("\n");
};

export const makeTune = (cpm, volume, body) => {
    const cps = Math.max(1, Math.round(+cpm || 120));
    const vol = Number.isFinite(+volume) ? Math.min(1, Math.max(0, +volume)) : 1;
    return `setcps(${cps}/240)
all(x => x.gain(${vol}))

${body ?? ''}`;
};