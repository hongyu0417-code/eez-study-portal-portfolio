import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('site-wide route transitions use Motion and respect reduced motion', async () => {
  const pageTransition = await readFile(new URL('../app/components/PageTransition.tsx', import.meta.url), 'utf8');

  assert.match(pageTransition, /AnimatePresence/);
  assert.match(pageTransition, /usePathname/);
  assert.match(pageTransition, /useReducedMotion/);
  assert.match(pageTransition, /prefers-reduced-motion|reducedMotion/);
});

test('home and study hub pages use scroll reveals for their major sections', async () => {
  const [home, studyHub] = await Promise.all([
    readFile(new URL('../app/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/study-hub/page.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(home, /Reveal/);
  assert.match(studyHub, /Reveal/);
  assert.match(studyHub, /AnimatePresence/);
});

test('global motion styling includes motivated ambient motion and tactile states', async () => {
  const css = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');

  assert.match(css, /@keyframes eez-hero-float/);
  assert.match(css, /\.page-transition/);
  assert.match(css, /:active/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.reveal-fallback-ready/);
  assert.match(css, /\.reveal-fallback-visible/);
});

test('section reveals are not globally animated on route load', async () => {
  const css = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');

  assert.doesNotMatch(css, /\.page-hero-reveal[^}]*animation:/);
  assert.doesNotMatch(css, /\.home-hero-reveal[^}]*animation:/);
  assert.match(css, /\.reveal-fallback-ready[^}]*transition:/);
});

test('scroll reveals have a fallback when IntersectionObserver is unavailable', async () => {
  const reveal = await readFile(new URL('../app/components/Reveal.tsx', import.meta.url), 'utf8');

  assert.match(reveal, /IntersectionObserver/);
  assert.match(reveal, /fallback/);
  assert.match(reveal, /setFallback\(/);
  assert.match(reveal, /animate=/);
  assert.match(reveal, /requestAnimationFrame/);
  assert.match(reveal, /setTimeout/);
  assert.match(reveal, /addEventListener\('scroll'/);
  assert.match(reveal, /reveal-fallback-ready/);
});
