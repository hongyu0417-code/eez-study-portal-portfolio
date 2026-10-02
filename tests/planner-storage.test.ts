import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyPlannerState, readPlannerState, writePlannerState } from '../app/planner/storage.ts';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

test('planner storage returns safe defaults and round-trips local data', () => {
  const storage = new MemoryStorage();
  const empty = readPlannerState(storage as unknown as Storage);
  assert.deepEqual(empty.selectedOfferingIds, []);
  assert.deepEqual(empty.events, []);
  const state = { ...emptyPlannerState(), selectedOfferingIds: ['offering-1'], bookmarks: ['/resources/year-1#circuit-analysis'] };
  writePlannerState(storage as unknown as Storage, state);
  assert.deepEqual(readPlannerState(storage as unknown as Storage), state);
});

test('malformed planner storage is ignored instead of breaking the page', () => {
  const storage = new MemoryStorage();
  storage.setItem('eez-planner-v1', '{not valid json');
  assert.deepEqual(readPlannerState(storage as unknown as Storage), emptyPlannerState());
});
