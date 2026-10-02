import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('AI library exposes the approved prompt walkthrough and three-step workflow', async () => {
  const page = await readFile(new URL('../app/ai-library/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /https:\/\/www\.instagram\.com\/reel\/DZtgLGKJjaK\/\?utm_source=ig_web_copy_link/);
  assert.match(page, /Copy a prompt/);
  assert.match(page, /Attach your file/);
  assert.match(page, /Revise the output/);
  assert.match(page, /Reveal/);
});
