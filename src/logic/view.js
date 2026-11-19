// Canvas v natívnych pixeloch zariadenia + celočíselný zoom kamery:
// pixel art ostáva ostrý a text sa dá vykresliť hladko.
export function computeView(innerW, innerH, dpr = 1) {
  const width = Math.round(innerW * dpr), height = Math.round(innerH * dpr);
  const zoom = Math.max(1, Math.floor(Math.min(width / 180, height / 320)));
  return { zoom, width, height };
}
