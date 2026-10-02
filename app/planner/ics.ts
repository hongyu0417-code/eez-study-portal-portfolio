import type { CourseOffering, PlannerEvent, PlannerState } from './types';

const escapeIcs = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const unescapeIcs = (value: string) => value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
const compactDateTime = (date: string, time: string) => `${date.replaceAll('-', '')}T${time.replace(':', '')}00`;

const dayIndexes: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

const nextDateForDay = (day: string) => {
  const target = dayIndexes[day];
  if (target === undefined) return new Date();
  const date = new Date();
  const delta = (target - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + delta);
  return date;
};

const dateString = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const eventLines = (event: { uid: string; summary: string; date: string; startTime: string; endTime: string; location?: string; notes?: string; recurring?: boolean }) => [
  'BEGIN:VEVENT',
  `UID:${escapeIcs(event.uid)}`,
  `DTSTART:${compactDateTime(event.date, event.startTime)}`,
  `DTEND:${compactDateTime(event.date, event.endTime)}`,
  `SUMMARY:${escapeIcs(event.summary)}`,
  event.location ? `LOCATION:${escapeIcs(event.location)}` : '',
  event.notes ? `DESCRIPTION:${escapeIcs(event.notes)}` : '',
  event.recurring ? 'RRULE:FREQ=WEEKLY' : '',
  'END:VEVENT',
].filter(Boolean);

export function buildIcs(state: PlannerState, offerings: CourseOffering[]): string {
  const selected = offerings.filter((offering) => state.selectedOfferingIds.includes(offering.id));
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EEz//Planner//EN', 'CALSCALE:GREGORIAN'];
  selected.forEach((offering) => {
    const date = dateString(nextDateForDay(offering.day));
    const location = offering.location || [offering.building, offering.room].filter(Boolean).join(', ');
    lines.push(...eventLines({ uid: `eez-${offering.id}`, summary: `${offering.courseName}${offering.group ? ` [${offering.group}]` : ''}`, date, startTime: offering.startTime, endTime: offering.endTime, location, notes: state.offeringNotes[offering.id], recurring: true }));
  });
  state.events.forEach((event) => lines.push(...eventLines({ uid: `eez-${event.id}`, summary: event.title, date: event.date, startTime: event.startTime, endTime: event.endTime, location: event.location, notes: event.notes })));
  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}

const parseDateTime = (value: string) => {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (!match) return null;
  return { date: `${match[1]}-${match[2]}-${match[3]}`, time: `${match[4]}:${match[5]}` };
};

export function parseIcs(text: string): PlannerEvent[] {
  const events: PlannerEvent[] = [];
  const blocks = text.split(/BEGIN:VEVENT\s*/).slice(1);
  blocks.forEach((block, index) => {
    const lines = block.split(/\r?\n/);
    const values = new Map<string, string>();
    lines.forEach((line) => {
      const separator = line.indexOf(':');
      if (separator < 0) return;
      values.set(line.slice(0, separator).split(';')[0], unescapeIcs(line.slice(separator + 1)));
    });
    const start = parseDateTime(values.get('DTSTART') || '');
    const end = parseDateTime(values.get('DTEND') || '');
    const title = values.get('SUMMARY');
    if (!start || !end || !title) return;
    events.push({ id: values.get('UID') || `imported-${index + 1}`, title, date: start.date, startTime: start.time, endTime: end.time, location: values.get('LOCATION') || '', notes: values.get('DESCRIPTION') || '', reminder: '', repeat: 'none', color: 'purple' });
  });
  return events;
}
