export const makeTune = (cpm, body) =>
    `setcps(${Math.max(1, Math.round(+cpm || 120))}/240)\n\n${body}`;

export const stripSetcps = (txt) =>
    txt.replace(/^\s*setcps\([^)]*\)\s*\n\s*\n?/i, '');