import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAP_ROWS, ROOMS } from '../src/data/map.js';
import { parseMap, findPath, resolveTap } from '../src/logic/grid.js';

const g = parseMap(MAP_ROWS, ROOMS);

test('všetky riadky majú rovnakú dĺžku', () => {
  assert.equal(new Set(MAP_ROWS.map(r => r.length)).size, 1);
});
test('spawn a 9 dverí', () => {
  assert.deepEqual(g.spawn, { x: 2, y: 16 });
  assert.equal(g.doors.length, 9);
  assert.ok(g.isWalkable(2, 16));
});
test('stena, dvere, skrinka a mimo mapy nie sú priechodné', () => {
  assert.equal(g.isWalkable(0, 0), false);
  assert.equal(g.isWalkable(9, 4), false);
  assert.equal(g.isWalkable(10, 14), false);
  assert.equal(g.isWalkable(-1, 5), false);
  assert.equal(g.isWalkable(99, 99), false);
});
test('do každých dverí sa dá dôjsť zo spawnu', () => {
  for (const d of g.doors) {
    const r = resolveTap(g, g.spawn, d);
    assert.ok(r, `dvere ${d.room.id}`);
    assert.equal(r.door.room.id, d.room.id);
  }
});
test('findPath: rovnaké miesto = [], susedné = 1 krok', () => {
  assert.deepEqual(findPath(g, { x: 2, y: 16 }, { x: 2, y: 16 }), []);
  assert.deepEqual(findPath(g, { x: 2, y: 16 }, { x: 3, y: 16 }), [{ x: 3, y: 16 }]);
});
test('findPath: cieľ v stene = null', () => {
  assert.equal(findPath(g, g.spawn, { x: 0, y: 0 }), null);
});
test('ťuknutie na dvere zborovne stojac pod nimi = okamžitý vstup', () => {
  const r = resolveTap(g, { x: 3, y: 15 }, { x: 3, y: 14 });
  assert.deepEqual(r.path, []);
  assert.equal(r.door.room.id, 'zborovna');
});
test('ťuknutie na stenu tesne pri podlahe → najbližšia podlaha', () => {
  const r = resolveTap(g, g.spawn, { x: 5, y: 16 + 2 }); // (5,18) stena pod chodbou
  assert.ok(r);
  assert.equal(r.door, null);
  assert.deepEqual(r.path.at(-1), { x: 5, y: 17 });
});
test('ťuknutie ďaleko od podlahy → null', () => {
  assert.equal(resolveTap(g, g.spawn, { x: 13, y: 8 }), null);
});
test('cesta do Triedy 4 je súvislá (kroky po 1)', () => {
  const r = resolveTap(g, g.spawn, g.doors.find(d => d.room.id === 'trieda4'));
  let p = g.spawn;
  for (const s of r.path) {
    assert.equal(Math.abs(s.x - p.x) + Math.abs(s.y - p.y), 1);
    assert.ok(g.isWalkable(s.x, s.y));
    p = s;
  }
});
