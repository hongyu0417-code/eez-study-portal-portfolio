import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('global search is available across the portal and indexes core student tools', async () => {
  const [chrome, search, index] = await Promise.all([
    readFile(new URL('../app/components/SiteChrome.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/components/GlobalSearch.tsx', import.meta.url), 'utf8').catch(() => ''),
    readFile(new URL('../app/search-index.ts', import.meta.url), 'utf8').catch(() => ''),
  ]);

  assert.match(chrome, /GlobalSearch/);
  assert.match(search, /Open global search/);
  assert.match(search, /Search EEz/);
  assert.match(index, /KIE1003/);
  assert.match(index, /KIE1005/);
  assert.match(index, /\/ai-library/);
});

test('homepage keeps its large card layout and legacy planner code stays type-safe', async () => {
  const [css, planner] = await Promise.all([
    readFile(new URL('../app/globals.css', import.meta.url), 'utf8'),
    readFile(new URL('../app/components/PlannerShell.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(css, /\.path-grid\{[^}]*repeat\(3,1fr\)/);
  assert.match(css, /\.home-path-reveal[^}]*height:auto/);
  assert.match(css, /\.planner-layout-timetable/);
  assert.match(css, /\.planner-zoom-controls/);
  assert.match(css, /\.search-dialog/);
  assert.match(planner, /Calendar zoom/);
  assert.match(planner, /Math\.round\(calendarZoom \* 100\)/);
  assert.match(planner, /planner-layout-timetable/);
});

test('the public portal uses three equal cards after Planner is removed', async () => {
  const [css, home] = await Promise.all([
    readFile(new URL('../app/globals.css', import.meta.url), 'utf8'),
    readFile(new URL('../app/page.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(css, /\.path-grid\{grid-template-columns:repeat\(3,1fr\);align-items:stretch\}/);
  assert.equal((home.match(/title: '(?:Resource library|Study hub|AI library)'/g) ?? []).length, 3);
  assert.match(css, /\.path-card\{display:flex;min-height:260px/);
});

test('scroll reveals expose an explicit visible state for reliable viewport animation', async () => {
  const reveal = await readFile(new URL('../app/components/Reveal.tsx', import.meta.url), 'utf8');

  assert.match(reveal, /IntersectionObserver/);
  assert.match(reveal, /data-reveal-state/);
  assert.match(reveal, /setVisible/);
  assert.match(reveal, /revealAnimate/);
  assert.match(reveal, /revealInitial/);
});
