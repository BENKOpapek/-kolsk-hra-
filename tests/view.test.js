import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeView } from '../src/logic/view.js';

test('typický mobil 390x844', () => {
  assert.deepEqual(computeView(390, 844), { zoom: 2, width: 195, height: 422 });
});
test('presne 360x640', () => {
  assert.deepEqual(computeView(360, 640), { zoom: 2, width: 180, height: 320 });
});
test('desktop 1280x720 nemá extrémny zoom', () => {
  assert.deepEqual(computeView(1280, 720), { zoom: 2, width: 640, height: 360 });
});
test('malé okno → zoom aspoň 1', () => {
  assert.equal(computeView(100, 100).zoom, 1);
});
