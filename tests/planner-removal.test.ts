import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('the public portal removes the planner surface but keeps Study hub access', async () => {
  const [home, chrome, search, plannerRoute] = await Promise.all([
    readFile(new URL('../app/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/components/SiteChrome.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/search-index.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/planner/page.tsx', import.meta.url), 'utf8').catch(() => null),
  ]);

  assert.doesNotMatch(home, /Planner|\/planner/);
  assert.doesNotMatch(chrome, /Planner|\/planner/);
  assert.doesNotMatch(search, /Planner|\/planner/);
  assert.match(chrome, /Study hub/);
  assert.equal(plannerRoute, null);
});
