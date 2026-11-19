import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeView } from '../src/logic/view.js';

// Canvas má natívne pixely zariadenia; zoom je celé číslo, takže pixel art ostáva ostrý.
test('typický mobil 390x844 @3x', () => {
  assert.deepEqual(computeView(390, 844, 3), { zoom: 6, width: 1170, height: 2532 });
});
test('presne 360x640 @1x', () => {
  assert.deepEqual(computeView(360, 640, 1), { zoom: 2, width: 360, height: 640 });
});
test('Android s neceločíselným dpr 2.625', () => {
  assert.deepEqual(computeView(412, 915, 2.625), { zoom: 6, width: 1082, height: 2402 });
});
test('desktop 1280x720 nemá extrémny zoom', () => {
  assert.equal(computeView(1280, 720, 1).zoom, 2);
});
test('malé okno → zoom aspoň 1', () => {
  assert.equal(computeView(100, 100, 1).zoom, 1);
});
test('viditeľný svet je aspoň 180 px široký', () => {
  const v = computeView(390, 844, 3);
  assert.ok(v.width / v.zoom >= 180);
});
