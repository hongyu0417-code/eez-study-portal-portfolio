import type { PlannerState } from './types';

export const plannerStorageKey = 'eez-planner-v1';

export function emptyPlannerState(): PlannerState {
  return {
    selectedOfferingIds: [],
    offeringNotes: {},
    offeringColors: {},
    events: [],
    bookmarks: [],
    recentActivity: [],
    activeView: 'timetable',
    calendarView: 'week',
    selectedSemester: 'semester-1',
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function readPlannerState(storage?: Storage): PlannerState {
  if (!storage) return emptyPlannerState();
  try {
    const raw = storage.getItem(plannerStorageKey);
    if (!raw) return emptyPlannerState();
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return emptyPlannerState();
    const defaults = emptyPlannerState();
    return {
      ...defaults,
      ...parsed,
      selectedOfferingIds: Array.isArray(parsed.selectedOfferingIds) ? parsed.selectedOfferingIds.filter((value): value is string => typeof value === 'string') : defaults.selectedOfferingIds,
      events: Array.isArray(parsed.events) ? parsed.events.filter(isRecord) as PlannerState['events'] : defaults.events,
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks.filter((value): value is string => typeof value === 'string') : defaults.bookmarks,
      recentActivity: Array.isArray(parsed.recentActivity) ? parsed.recentActivity.filter((value): value is string => typeof value === 'string') : defaults.recentActivity,
      offeringNotes: isRecord(parsed.offeringNotes) ? parsed.offeringNotes as Record<string, string> : defaults.offeringNotes,
      offeringColors: isRecord(parsed.offeringColors) ? parsed.offeringColors as Record<string, string> : defaults.offeringColors,
    };
  } catch {
    return emptyPlannerState();
  }
}

export function writePlannerState(storage: Storage | undefined, state: PlannerState): void {
  if (!storage) return;
  try {
    storage.setItem(plannerStorageKey, JSON.stringify(state));
  } catch {
    // Storage is optional and may be unavailable in private browsing.
  }
}
