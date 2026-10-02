import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('home and resource pages use semester labels instead of year labels', async () => {
  const files = await Promise.all([
    readFile(new URL('../app/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/resources/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/resources/year-2/page.tsx', import.meta.url), 'utf8'),
  ]);
  const source = files.join('\n');

  assert.match(source, /Semester 1/);
  assert.match(source, /Semester 2/);
  assert.doesNotMatch(source, /Year 1/);
  assert.doesNotMatch(source, /Year 2/);
});

test('brand icon is a purple tile with a white lightning mark', async () => {
  const icon = await readFile(new URL('../app/icon.svg', import.meta.url), 'utf8');

  assert.match(icon, /#6D28D9/i);
  assert.match(icon, /#FFFFFF/i);
  assert.match(icon, /electric|lightning|bolt/i);
});

test('footer keeps the creator links without the Rednote line', async () => {
  const chrome = await readFile(new URL('../app/components/SiteChrome.tsx', import.meta.url), 'utf8');

  assert.match(chrome, /Instagram · hongyu814__/);
  assert.match(chrome, /TikTok · hongyu814__/);
  assert.doesNotMatch(chrome, /Rednote|青春专辑/);
});
