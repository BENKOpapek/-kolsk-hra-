// Celočíselný zoom, aby pixel art ostal ostrý; hra vyplní celú obrazovku.
export function computeView(innerW, innerH) {
  const zoom = Math.max(1, Math.floor(Math.min(innerW / 180, innerH / 320)));
  return { zoom, width: Math.ceil(innerW / zoom), height: Math.ceil(innerH / zoom) };
}
