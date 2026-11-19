// Mapa ako mriežka + hľadanie cesty (BFS). Bez závislosti na Phaseri.

const PROPS = { L: 'locker', V: 'vitrina', P: 'portret' };
const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // hore, dole, vľavo, vpravo

export function parseMap(rows, rooms) {
  const height = rows.length, width = rows[0].length;
  const doors = [], props = [];
  let spawn = null;
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === 'S') spawn = { x, y };
    else if (rooms[c]) doors.push({ x, y, room: rooms[c] });
    else if (PROPS[c]) props.push({ x, y, kind: PROPS[c] });
  }));
  const tileAt = (x, y) => rows[y]?.[x] ?? ' ';
  const isWalkable = (x, y) => { const c = tileAt(x, y); return c === '.' || c === 'S'; };
  return { width, height, tileAt, isWalkable, spawn, doors, props };
}

// Vzdialenosti a predchodcovia zo štartu na všetky dostupné dlaždice.
function bfs(grid, from) {
  const key = (x, y) => y * grid.width + x;
  const prev = new Map([[key(from.x, from.y), null]]);
  const queue = [from];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const [dx, dy] of DIRS) {
      const x = p.x + dx, y = p.y + dy, k = key(x, y);
      if (!prev.has(k) && grid.isWalkable(x, y)) { prev.set(k, p); queue.push({ x, y }); }
    }
  }
  return (to) => {
    if (!prev.has(key(to.x, to.y))) return null;
    const path = [];
    for (let p = to; prev.get(key(p.x, p.y)) !== null; p = prev.get(key(p.x, p.y))) path.unshift({ x: p.x, y: p.y });
    return path;
  };
}

export function findPath(grid, from, to) {
  return bfs(grid, from)(to);
}

// Z kandidátov vyber dostupný s najkratšou cestou.
function shortest(pathTo, candidates) {
  let best = null;
  for (const c of candidates) {
    const p = pathTo(c);
    if (p && (!best || p.length < best.length)) best = p;
  }
  return best;
}

export function resolveTap(grid, from, tile) {
  const pathTo = bfs(grid, from);
  const door = grid.doors.find(d => d.x === tile.x && d.y === tile.y) ?? null;
  if (door) {
    const path = shortest(pathTo, DIRS.map(([dx, dy]) => ({ x: tile.x + dx, y: tile.y + dy })));
    return path ? { path, door } : null;
  }
  if (grid.isWalkable(tile.x, tile.y)) {
    const path = pathTo(tile);
    return path ? { path, door: null } : null;
  }
  // Ťuknutie vedľa podlahy: najbližšia dostupná podlaha do vzdialenosti 2.
  for (let r = 1; r <= 2; r++) {
    const ring = [];
    for (let dx = -r; dx <= r; dx++) {
      const dy = r - Math.abs(dx);
      ring.push({ x: tile.x + dx, y: tile.y + dy }, { x: tile.x + dx, y: tile.y - dy });
    }
    const path = shortest(pathTo, ring.filter(c => grid.isWalkable(c.x, c.y)));
    if (path) return { path, door: null };
  }
  return null;
}
