import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIcs, parseIcs } from '../app/planner/ics.ts';
import type { CourseOffering } from '../app/planner/types.ts';
import { emptyPlannerState } from '../app/planner/storage.ts';

const offering: CourseOffering = {
  id: 'KIE1005|2026/2027|October|OCC-01|G2|Monday|09:00',
  courseCode: 'KIE1005',
  courseName: 'Circuit Analysis I',
  semester: 'semester-1',
  academicSession: '2026/2027',
  intake: 'October',
  occNumber: 'OCC-01',
  group: 'G2',
  day: 'Monday',
  startTime: '09:00',
  endTime: '11:00',
  location: 'Faculty, Block B',
  building: 'Block B',
  room: 'B-201',
  lecturer: 'Lecturer',
};

test('calendar export includes selected classes and overlapping personal events', () => {
  const state = {
    ...emptyPlannerState(),
    selectedOfferingIds: [offering.id],
    events: [{ id: 'event-1', title: 'Assignment work', date: '2026-09-21', startTime: '10:00', endTime: '12:00', location: 'Library', notes: 'Bring notes', reminder: '', repeat: 'none', color: 'purple' }],
  };
  const ics = buildIcs(state, [offering]);
  assert.match(ics, /SUMMARY:Circuit Analysis I \[G2\]/);
  assert.match(ics, /SUMMARY:Assignment work/);
  assert.match(ics, /DTSTART:20260921T090000/);
  assert.match(ics, /LOCATION:Faculty\\, Block B/);
  assert.match(ics, /DESCRIPTION:Bring notes/);
});

test('calendar import creates personal events and preserves core fields', () => {
  const imported = parseIcs([
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'UID:imported-1',
    'SUMMARY:Midsem test',
    'DTSTART:20261014T140000',
    'DTEND:20261014T160000',
    'LOCATION:Engineering Hall',
    'DESCRIPTION:Bring calculator',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n'));
  assert.equal(imported.length, 1);
  assert.deepEqual(imported[0], { id: 'imported-1', title: 'Midsem test', date: '2026-10-14', startTime: '14:00', endTime: '16:00', location: 'Engineering Hall', notes: 'Bring calculator', reminder: '', repeat: 'none', color: 'purple' });
});
