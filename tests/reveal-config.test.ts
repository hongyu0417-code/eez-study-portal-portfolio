import assert from 'node:assert/strict';
import test from 'node:test';
import { getRevealTransition, revealAnimate, revealInitial, revealViewport } from '../app/components/reveal-config.ts';

test('reveal configuration starts slightly below the final position', () => {
  assert.equal(revealInitial.opacity, 0);
  assert.equal(revealInitial.y, 46);
  assert.equal(revealInitial.scale, 0.965);
  assert.equal(revealAnimate.opacity, 1);
  assert.equal(revealAnimate.y, 0);
  assert.equal(revealAnimate.scale, 1);
});

test('reveal configuration uses one-time in-view playback and bounded transition timing', () => {
  assert.equal(revealViewport.once, true);
  assert.equal(revealViewport.amount, 0.2);
  assert.equal(revealViewport.margin, '0px 0px -10% 0px');
  assert.equal(getRevealTransition(0.12).delay, 0.12);
  assert.equal(getRevealTransition(0.12).duration, 0.9);
});
