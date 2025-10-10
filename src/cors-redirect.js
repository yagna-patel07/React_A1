// ALERT. GIPPITY GENERATED GARBAGE CODE. DO NOT TRUST
const ORIGIN = 'https://strudel.cc';

const toSameOriginPath = (absoluteUrl) => {
  const path = absoluteUrl.slice(ORIGIN.length);      // e.g. "/tidal-drum-machines.json"
  return path.startsWith('/') ? path : `/${path}`;    // ensure ONE leading slash, no joining with REL_BASE
};

const realFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input?.url;
  if (typeof url === 'string' && url.startsWith(ORIGIN)) {
    const same = toSameOriginPath(url);               // -> "/tidal-drum-machines.json"
    return realFetch(same, {
      ...init,
      headers: { ...(init?.headers || {}), Accept: 'application/json' },
    });
  }
  return realFetch(input, init);
};

