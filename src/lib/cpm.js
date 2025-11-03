
export const stripSetcps = (txt) =>
    txt.replace(/^\s*setcps\([^)]*\)\s*\n\s*\n?/i, '');

export const makeTune = (cpm, volume, body) => {
    const cps = Math.max(1, Math.round(+cpm || 120));
    const vol = Number.isFinite(+volume) ? Math.min(1, Math.max(0, +volume)) : 1;
    return `setcps(${cps}/240)
all(x => x.gain(${vol}))

${body ?? ''}`;
};