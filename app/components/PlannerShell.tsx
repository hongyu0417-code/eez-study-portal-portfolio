'use client';

import { startTransition, useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { buildIcs, parseIcs } from '../planner/ics';
import { getCourses, validateOffering } from '../planner/catalog';
import { emptyPlannerState, readPlannerState, writePlannerState } from '../planner/storage';
import type { Course, CourseOffering, PlannerEvent, PlannerState, PlannerView, Semester } from '../planner/types';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const colorOptions = ['purple', 'blue', 'orange', 'green'];
const offeringStorageKey = 'eez-offerings-v1';
const plannerViewMigrationKey = 'eez-planner-timetable-first-v1';

const todayIso = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const dateFromIso = (value: string) => new Date(`${value}T00:00:00`);
const isoFromDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (value: string, amount: number) => { const date = dateFromIso(value); date.setDate(date.getDate() + amount); return isoFromDate(date); };
const startOfWeek = (value: string) => { const date = dateFromIso(value); const shift = date.getDay() === 0 ? -6 : 1 - date.getDay(); date.setDate(date.getDate() + shift); return isoFromDate(date); };
const formatLongDate = (value: string) => dateFromIso(value).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatShortDate = (value: string) => dateFromIso(value).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
const emptyEvent = (): PlannerEvent => ({ id: '', title: '', date: todayIso(), startTime: '09:00', endTime: '10:00', location: '', notes: '', reminder: '', repeat: 'none', color: 'purple' });
type ManualBlockDraft = { occNumber: string; group: string; day: string; startTime: string; endTime: string; location: string; building: string; room: string; lecturer: string };
const emptyManualBlock = (): ManualBlockDraft => ({ occNumber: '', group: '', day: 'Monday', startTime: '09:00', endTime: '10:00', location: '', building: '', room: '', lecturer: '' });
const timeToMinutes = (value: string) => { const [hours, minutes] = value.split(':').map(Number); return (hours * 60) + minutes; };
const hasBrowserStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const downloadText = (fileName: string, text: string, type: string) => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

function Entry({
  entry,
  color,
  onRemove,
  onEdit,
  onDuplicate,
}: {
  entry: { type: 'class' | 'event'; title: string; time: string; detail?: string; id: string };
  color: string;
  onRemove?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
}) {
  return <div className={`planner-entry planner-entry-${entry.type} planner-tone-${color}`}>
    <span className="planner-entry-time">{entry.time}</span>
    <strong>{entry.title}</strong>
    {entry.detail && <small>{entry.detail}</small>}
    <div className="planner-entry-actions">
      {onEdit && <button type="button" onClick={onEdit}>Edit</button>}
      {onDuplicate && <button type="button" onClick={onDuplicate}>Duplicate</button>}
      {onRemove && <button type="button" onClick={onRemove}>Remove</button>}
    </div>
  </div>;
}

export default function PlannerShell() {
  const [state, setState] = useState<PlannerState>(() => emptyPlannerState());
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [courseQuery, setCourseQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [weekStart, setWeekStart] = useState(startOfWeek(todayIso()));
  const [monthCursor, setMonthCursor] = useState(todayIso().slice(0, 7));
  const [eventDraft, setEventDraft] = useState<PlannerEvent>(() => emptyEvent());
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [manualCourseCode, setManualCourseCode] = useState<string | null>(null);
  const [manualDraft, setManualDraft] = useState<ManualBlockDraft>(() => emptyManualBlock());
  const [calendarZoom, setCalendarZoom] = useState(1);
  const calendarFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storage = hasBrowserStorage() ? window.localStorage : undefined;
      const savedOfferings = storage?.getItem(offeringStorageKey);
      const savedPlannerState = readPlannerState(storage);
      if (storage && !storage.getItem(plannerViewMigrationKey)) {
        savedPlannerState.activeView = 'timetable';
        storage.setItem(plannerViewMigrationKey, 'done');
      }
      startTransition(() => {
        setState(savedPlannerState);
        if (savedOfferings) {
          const parsed = JSON.parse(savedOfferings) as unknown;
          if (Array.isArray(parsed)) setOfferings(parsed.map(validateOffering).filter((value): value is CourseOffering => Boolean(value)));
        }
        setLoaded(true);
      });
    } catch {
      startTransition(() => {
        setState(emptyPlannerState());
        setLoaded(true);
      });
    }
  }, []);

  useEffect(() => { if (loaded && hasBrowserStorage()) writePlannerState(window.localStorage, state); }, [loaded, state]);
  useEffect(() => { if (loaded && hasBrowserStorage()) window.localStorage.setItem(offeringStorageKey, JSON.stringify(offerings)); }, [loaded, offerings]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2800); return () => window.clearTimeout(timer); }, [notice]);

  const selectedOfferings = useMemo(() => offerings.filter((offering) => state.selectedOfferingIds.includes(offering.id)), [offerings, state.selectedOfferingIds]);
  const courseResults = useMemo(() => getCourses(courseQuery, state.selectedSemester), [courseQuery, state.selectedSemester]);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const monthDays = useMemo(() => {
    const [year, month] = monthCursor.split('-').map(Number);
    const first = new Date(year, month - 1, 1);
    const offset = first.getDay();
    const total = new Date(year, month, 0).getDate();
    return Array.from({ length: Math.ceil((offset + total) / 7) * 7 }, (_, index) => {
      const day = index - offset + 1;
      return day < 1 || day > total ? null : isoFromDate(new Date(year, month - 1, day));
    });
  }, [monthCursor]);

  const updateState = (updater: (current: PlannerState) => PlannerState) => setState((current) => updater(current));
  const setActiveView = (activeView: PlannerView) => updateState((current) => ({ ...current, activeView }));
  const setSemester = (selectedSemester: Semester) => updateState((current) => ({ ...current, selectedSemester }));
  const entriesForDate = (date: string) => {
    const day = dayNames[dateFromIso(date).getDay()];
    const classes = selectedOfferings.filter((offering) => offering.day === day).map((offering) => ({ type: 'class' as const, id: offering.id, title: `${offering.courseCode} · ${offering.courseName}`, time: `${offering.startTime}–${offering.endTime}`, detail: [offering.group && `Group ${offering.group}`, offering.location || offering.room].filter(Boolean).join(' · ') }));
    const events = state.events.filter((event) => event.date === date).map((event) => ({ type: 'event' as const, id: event.id, title: event.title, time: `${event.startTime}–${event.endTime}`, detail: event.location || event.notes }));
    return [...classes, ...events].sort((a, b) => a.time.localeCompare(b.time));
  };

  const removeOffering = (id: string) => updateState((current) => ({ ...current, selectedOfferingIds: current.selectedOfferingIds.filter((value) => value !== id) }));
  const selectOffering = (offering: CourseOffering) => {
    updateState((current) => ({ ...current, selectedOfferingIds: current.selectedOfferingIds.includes(offering.id) ? current.selectedOfferingIds : [...current.selectedOfferingIds, offering.id] }));
    setNotice(`Added ${offering.courseCode} ${offering.courseName}${offering.group ? ` — ${offering.group}` : ''}.`);
  };
  const openManualBlock = (courseCode: string) => { setManualCourseCode(courseCode); setManualDraft(emptyManualBlock()); };
  const closeManualBlock = () => { setManualCourseCode(null); setManualDraft(emptyManualBlock()); };
  const saveManualOffering = (course: Course) => {
    if (timeToMinutes(manualDraft.endTime) <= timeToMinutes(manualDraft.startTime)) {
      setNotice('Choose an end time after the start time.');
      return;
    }
    const offering = validateOffering({ ...manualDraft, courseCode: course.courseCode, courseName: course.courseName, semester: course.semester });
    if (!offering) {
      setNotice('Add a valid day and time for this course.');
      return;
    }
    setOfferings((current) => current.some((item) => item.id === offering.id) ? current : [...current, offering]);
    selectOffering(offering);
    closeManualBlock();
    setActiveView('timetable');
    setNotice(`${course.courseCode} course banner added to your timetable.`);
  };
  const changeOffering = (offering: CourseOffering) => { setSemester(offering.semester); setCourseQuery(offering.courseCode); setActiveView('courses'); };
  const saveEvent = () => {
    if (!eventDraft.title.trim() || !eventDraft.date || !eventDraft.startTime || !eventDraft.endTime) return;
    const saved = { ...eventDraft, id: editingEventId || `event-${Date.now()}`, title: eventDraft.title.trim() };
    updateState((current) => ({ ...current, events: editingEventId ? current.events.map((event) => event.id === editingEventId ? saved : event) : [...current.events, saved] }));
    setEventDraft(emptyEvent());
    setEditingEventId(null);
    setNotice(editingEventId ? 'Event updated.' : 'Event added. Overlapping events are allowed.');
  };
  const editEvent = (event: PlannerEvent) => { setEventDraft(event); setEditingEventId(event.id); setActiveView('calendar'); };
  const removeEvent = (id: string) => updateState((current) => ({ ...current, events: current.events.filter((event) => event.id !== id) }));
  const duplicateEvent = (event: PlannerEvent) => updateState((current) => ({ ...current, events: [...current.events, { ...event, id: `event-${Date.now()}`, title: `${event.title} copy` }] }));
  const handleCalendarImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imported = parseIcs(await file.text());
    if (imported.length) updateState((current) => ({ ...current, events: [...current.events, ...imported] }));
    setNotice(imported.length ? `${imported.length} calendar event${imported.length === 1 ? '' : 's'} imported.` : 'No calendar events were found in that file.');
    event.target.value = '';
  };
  const exportCalendar = () => { downloadText('eez-planner.ics', buildIcs(state, offerings), 'text/calendar;charset=utf-8'); setNotice('Calendar exported.'); };

  const renderClassEntry = (entry: { type: 'class' | 'event'; id: string; title: string; time: string; detail?: string }) => {
    const offering = selectedOfferings.find((item) => item.id === entry.id);
    return <Entry key={`${entry.type}-${entry.id}`} entry={entry} color={offering ? state.offeringColors[offering.id] || 'purple' : state.events.find((item) => item.id === entry.id)?.color || 'purple'} onRemove={offering ? () => removeOffering(offering.id) : undefined} onEdit={offering ? () => changeOffering(offering) : () => { const event = state.events.find((item) => item.id === entry.id); if (event) editEvent(event); }} onDuplicate={!offering ? () => { const event = state.events.find((item) => item.id === entry.id); if (event) duplicateEvent(event); } : undefined} />;
  };

  const renderZoomControls = () => <div className="planner-zoom-controls" aria-label="Calendar zoom"><span>Calendar size</span><button type="button" aria-label="Zoom calendar out" onClick={() => setCalendarZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(2))))}>−</button><strong>{Math.round(calendarZoom * 100)}%</strong><button type="button" aria-label="Zoom calendar in" onClick={() => setCalendarZoom((value) => Math.min(1.5, Number((value + 0.1).toFixed(2))))}>+</button></div>;

  const renderTimeGrid = (dates: string[]) => {
    const calendarStart = 8 * 60;
    const calendarEnd = 20 * 60;
    const calendarLength = calendarEnd - calendarStart;
    const hours = Array.from({ length: 13 }, (_, index) => calendarStart + (index * 60));
    return <div className="planner-timegrid-viewport"><div className="planner-timegrid" style={{ '--planner-zoom': calendarZoom } as CSSProperties} aria-label={(dates.length === 1 ? 'Daily' : 'Weekly') + ' calendar'}>
      <div className="planner-timegrid-header"><span className="planner-timegrid-time-label">Time</span>{dates.map((date) => <div className={['planner-timegrid-day-label', date === todayIso() ? 'is-today' : ''].filter(Boolean).join(' ')} key={date}><b>{dayNames[dateFromIso(date).getDay()].slice(0, 3)}</b><span>{formatShortDate(date)}</span></div>)}</div>
      <div className="planner-timegrid-body"><div className="planner-time-labels">{hours.map((minutes) => <span key={minutes}>{String(Math.floor(minutes / 60)).padStart(2, '0') + ':00'}</span>)}</div><div className="planner-time-columns">{dates.map((date) => <div className={['planner-time-column', date === todayIso() ? 'is-today' : ''].filter(Boolean).join(' ')} key={date}><div className="planner-time-lines" aria-hidden="true">{hours.map((minutes) => <i key={minutes} />)}</div><div className="planner-time-blocks">{entriesForDate(date).map((entry) => { const [start, end] = entry.time.split('–'); const startMinutes = Math.max(calendarStart, timeToMinutes(start)); const endMinutes = Math.min(calendarEnd, timeToMinutes(end)); const top = ((startMinutes - calendarStart) / calendarLength) * 100; const height = Math.max(5.5, ((Math.max(startMinutes + 30, endMinutes) - startMinutes) / calendarLength) * 100); return <div className="planner-time-block" key={entry.type + '-' + entry.id} style={{ top: top + '%', height: height + '%' }}>{renderClassEntry(entry)}</div>; })}</div></div>)}</div></div>
    </div></div>;
  };

  const renderToday = () => {
    const today = todayIso();
    const entries = entriesForDate(today);
    return <div className="planner-view planner-today-view">
      <div className="planner-view-heading"><div><span className="planner-kicker">Today</span><h2>{formatLongDate(today)}</h2></div><button className="button button-dark" type="button" onClick={() => setActiveView('courses')}>Choose your courses <span className="arrow">↗</span></button></div>
      <div className="planner-today-grid">
        <section className="planner-summary-card"><span className="planner-kicker">Today’s schedule</span><h3>{entries.length ? `${entries.length} thing${entries.length === 1 ? '' : 's'} on your calendar` : 'A clear day to start well.'}</h3>{entries.length ? entries.map(renderClassEntry) : <p>No classes or personal events yet. Add your first calendar event when you have something to remember.</p>}</section>
        <section className="planner-summary-card planner-summary-accent"><span className="planner-kicker">Keep moving</span><h3>{selectedOfferings.length ? 'Your timetable is taking shape.' : 'Choose your courses to build your timetable.'}</h3><p>{state.events.length ? `${state.events.length} personal event${state.events.length === 1 ? '' : 's'} saved on this device.` : 'Your guest data stays in this browser. You can export it whenever you want.'}</p><div className="planner-summary-actions"><button className="plain-button" type="button" onClick={() => setActiveView('calendar')}>Add your first calendar event</button><a className="plain-button" href="/study-hub">Open Pomodoro</a></div></section>
      </div>
      <section className="planner-summary-card planner-recent-card"><div><span className="planner-kicker">Continue</span><h3>Pick up where you left off.</h3></div><div className="planner-recent-links"><a href="/resources/year-1">Open Semester 1 resources ↗</a><a href="/ai-library">Open AI library ↗</a><a href="/study-hub">Open Study Hub ↗</a></div></section>
    </div>;
  };

  const updateManualDraft = (field: keyof ManualBlockDraft, value: string) => setManualDraft((current) => ({ ...current, [field]: value }));
  const renderManualBlockForm = (course: Course) => manualCourseCode !== course.courseCode ? null : <form className="planner-manual-block-form" onSubmit={(event) => { event.preventDefault(); saveManualOffering(course); }}>
    <div className="planner-manual-block-heading"><div><span className="planner-kicker">Course banner</span><h4>{course.courseCode} · {course.courseName}</h4></div><button className="plain-button" type="button" onClick={closeManualBlock}>Close</button></div>
    <p>Set the time you know. OCC number, group, room, and lecturer are optional.</p>
    <div className="planner-form-grid"><label>OCC number (optional)<input value={manualDraft.occNumber} onChange={(event) => updateManualDraft('occNumber', event.target.value)} placeholder="e.g. OCC 01" /></label><label>Group / section (optional)<input value={manualDraft.group} onChange={(event) => updateManualDraft('group', event.target.value)} placeholder="e.g. Group A" /></label><label>Day<select value={manualDraft.day} onChange={(event) => updateManualDraft('day', event.target.value)}>{dayNames.slice(1).map((day) => <option key={day} value={day}>{day}</option>)}</select></label><label>Start time<input required type="time" value={manualDraft.startTime} onChange={(event) => updateManualDraft('startTime', event.target.value)} /></label><label>End time<input required type="time" value={manualDraft.endTime} onChange={(event) => updateManualDraft('endTime', event.target.value)} /></label><label>Location (optional)<input value={manualDraft.location} onChange={(event) => updateManualDraft('location', event.target.value)} placeholder="e.g. Online" /></label><label>Building (optional)<input value={manualDraft.building} onChange={(event) => updateManualDraft('building', event.target.value)} placeholder="e.g. Engineering" /></label><label>Room (optional)<input value={manualDraft.room} onChange={(event) => updateManualDraft('room', event.target.value)} placeholder="e.g. BK12" /></label><label>Lecturer (optional)<input value={manualDraft.lecturer} onChange={(event) => updateManualDraft('lecturer', event.target.value)} placeholder="Optional" /></label></div>
    <button className="button button-dark" type="submit">Add course banner <span className="arrow">↗</span></button>
  </form>;

  const renderCourses = () => <div className="planner-view">
    <div className="planner-view-heading"><div><span className="planner-kicker">Course selection</span><h2>Choose your courses</h2><p>Search the catalogue, then add a course banner with the day and time you know. You do not need an OCC number.</p></div><button className="button button-light" type="button" onClick={() => setActiveView('timetable')}>View timetable <span className="arrow">↗</span></button></div>
    <div className="planner-filter-row"><div className="planner-segmented" role="tablist" aria-label="Semester"><button type="button" className={state.selectedSemester === 'semester-1' ? 'selected' : ''} onClick={() => setSemester('semester-1')}>Semester 1</button><button type="button" className={state.selectedSemester === 'semester-2' ? 'selected' : ''} onClick={() => setSemester('semester-2')}>Semester 2</button></div><label className="planner-search-field">Search course code or name<input value={courseQuery} onChange={(event) => setCourseQuery(event.target.value)} placeholder="Try KIE1005 or Circuit Analysis" /></label></div>
    <div className='planner-course-list'>{courseResults.map((course) => { const options = offerings.filter((offering) => offering.courseCode === course.courseCode); return <article className='planner-course-card' key={course.courseCode}><div className='planner-course-card-heading'><div><span className='subject-meta'>{course.courseCode}</span><h3>{course.courseName}</h3></div><span className='planner-course-count'>{options.length ? options.length + ' saved block' + (options.length === 1 ? '' : 's') : 'Ready to set up'}</span></div>{options.length ? <div className='planner-offering-list'>{options.map((offering) => <div className='planner-offering-row' key={offering.id}><div><b>{offering.occNumber || offering.group || 'Personal course block'}</b><span>{offering.day} · {offering.startTime}–{offering.endTime}</span><small>{[offering.location, offering.building, offering.room, offering.lecturer].filter(Boolean).join(' · ') || 'Add details later if you need them'}</small></div><button className='button button-dark' type='button' onClick={() => selectOffering(offering)}>{state.selectedOfferingIds.includes(offering.id) ? 'Added' : 'Add to timetable'}</button></div>)}</div> : <div className='planner-empty'><strong>No saved class block yet.</strong><span>Build a Course banner for this subject. OCC number and group are optional.</span><button className='button button-dark' type='button' onClick={() => openManualBlock(course.courseCode)}>Add a time block <span className='arrow'>↗</span></button></div>}{options.length > 0 && <button className='plain-button planner-add-another' type='button' onClick={() => openManualBlock(course.courseCode)}>Add another time block</button>}{renderManualBlockForm(course)}</article>; })}</div>
    {!courseResults.length && <div className="planner-empty planner-empty-large"><strong>No course matches that search.</strong><span>Try the course code or the first words of the course name.</span></div>}
  </div>;

  const renderTimetable = () => <div className="planner-view">
    <div className="planner-view-heading"><div><span className="planner-kicker">Personal timetable</span><h2>Your week, clearly.</h2><p>Selected classes appear automatically. Personal events can overlap classes and still be saved.</p></div><div className="planner-heading-actions"><button className="plain-button" type="button" onClick={() => setWeekStart(addDays(weekStart, -7))}>← Previous</button><button className="plain-button" type="button" onClick={() => setWeekStart(startOfWeek(todayIso()))}>Today</button><button className="plain-button" type="button" onClick={() => setWeekStart(addDays(weekStart, 7))}>Next →</button>{renderZoomControls()}</div></div>
    <div className="planner-timetable-note">{selectedOfferings.length ? `${selectedOfferings.length} selected class option${selectedOfferings.length === 1 ? '' : 's'}.` : 'No classes selected yet. Choose a course and add a time block to build this calendar.'}<span>Current week · {formatShortDate(weekDates[0])}–{formatShortDate(weekDates[6])}</span></div>
    {renderTimeGrid(weekDates)}
    <div className="planner-selected-list"><div className="planner-subheading"><h3>Selected courses</h3><button className="plain-button" type="button" onClick={() => setActiveView('courses')}>Change courses</button></div>{selectedOfferings.length ? selectedOfferings.map((offering) => <article className="planner-selected-row" key={offering.id}><div><b>{offering.courseCode} · {offering.courseName}</b><span>{offering.day} · {offering.startTime}–{offering.endTime} · {offering.group || offering.occNumber || 'Group not labelled'}</span></div><div className="planner-row-actions"><select aria-label={`Colour for ${offering.courseName}`} value={state.offeringColors[offering.id] || 'purple'} onChange={(event) => updateState((current) => ({ ...current, offeringColors: { ...current.offeringColors, [offering.id]: event.target.value } }))}>{colorOptions.map((color) => <option key={color} value={color}>{color}</option>)}</select><button className="plain-button" type="button" onClick={() => changeOffering(offering)}>Change</button><button className="plain-button" type="button" onClick={() => removeOffering(offering.id)}>Remove</button></div></article>) : <p className="planner-muted">Your selected class options will appear here.</p>}</div>
  </div>;

  const renderEventForm = () => <form className="planner-event-form" onSubmit={(event) => { event.preventDefault(); saveEvent(); }}><div className="planner-form-heading"><div><span className="planner-kicker">{editingEventId ? 'Edit event' : 'Personal calendar'}</span><h3>{editingEventId ? 'Update your event' : 'Add event'}</h3></div>{editingEventId && <button className="plain-button" type="button" onClick={() => { setEditingEventId(null); setEventDraft(emptyEvent()); }}>Cancel</button>}</div><label>Event title<input required value={eventDraft.title} onChange={(event) => setEventDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Assignment work, meeting, revision..." /></label><div className="planner-form-grid"><label>Date<input required type="date" value={eventDraft.date} onChange={(event) => setEventDraft((current) => ({ ...current, date: event.target.value }))} /></label><label>Start time<input required type="time" value={eventDraft.startTime} onChange={(event) => setEventDraft((current) => ({ ...current, startTime: event.target.value }))} /></label><label>End time<input required type="time" value={eventDraft.endTime} onChange={(event) => setEventDraft((current) => ({ ...current, endTime: event.target.value }))} /></label></div><label>Location<input value={eventDraft.location} onChange={(event) => setEventDraft((current) => ({ ...current, location: event.target.value }))} placeholder="Optional" /></label><label>Notes<textarea value={eventDraft.notes} onChange={(event) => setEventDraft((current) => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Optional details" /></label><div className="planner-form-grid"><label>Reminder<select value={eventDraft.reminder} onChange={(event) => setEventDraft((current) => ({ ...current, reminder: event.target.value }))}><option value="">No reminder</option><option value="10">10 minutes before</option><option value="30">30 minutes before</option><option value="60">1 hour before</option></select></label><label>Repeat<select value={eventDraft.repeat} onChange={(event) => setEventDraft((current) => ({ ...current, repeat: event.target.value }))}><option value="none">Does not repeat</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select></label></div><label>Colour<select value={eventDraft.color} onChange={(event) => setEventDraft((current) => ({ ...current, color: event.target.value }))}>{colorOptions.map((color) => <option key={color} value={color}>{color}</option>)}</select></label><button className="button button-dark" type="submit">{editingEventId ? 'Save changes' : 'Add event'} <span className="arrow">↗</span></button><small className="planner-form-note">Overlapping events are allowed. EEz will save whatever you enter.</small></form>;

  const renderAgenda = () => <div className="planner-agenda-list">{state.events.length ? [...state.events].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)).map((event) => <article className="planner-agenda-row" key={event.id}><div><span>{formatLongDate(event.date)} · {event.startTime}–{event.endTime}</span><h4>{event.title}</h4><small>{event.location || event.notes || 'Personal event'}</small></div><div className="planner-row-actions"><button className="plain-button" type="button" onClick={() => editEvent(event)}>Edit</button><button className="plain-button" type="button" onClick={() => duplicateEvent(event)}>Duplicate</button><button className="plain-button" type="button" onClick={() => removeEvent(event.id)}>Delete</button></div></article>) : <div className="planner-empty planner-empty-large"><strong>No personal events yet.</strong><span>Add your first calendar event. It can overlap anything already on your timetable.</span></div>}</div>;

  const renderCalendar = () => <div className="planner-view">
    <div className="planner-view-heading"><div><span className="planner-kicker">Personal calendar</span><h2>Add what matters.</h2><p>Use month, week, day, or agenda view. Events can overlap classes, tutorials, or one another.</p></div><div className="planner-heading-actions"><button className="button button-dark" type="button" onClick={() => { setEditingEventId(null); setEventDraft(emptyEvent()); }}>Add event</button><button className="button button-light" type="button" onClick={exportCalendar}>Export calendar</button><button className="button button-light" type="button" onClick={() => calendarFileRef.current?.click()}>Import calendar</button></div></div>
    <input ref={calendarFileRef} className="planner-hidden-file" type="file" accept=".ics,text/calendar" onChange={handleCalendarImport} />
    <div className="planner-calendar-zoom-bar">{renderZoomControls()}</div>
    <div className="planner-calendar-layout"><div className="planner-calendar-main"><div className="planner-calendar-toolbar"><div className="planner-segmented" role="tablist" aria-label="Calendar view"><button type="button" className={state.calendarView === 'month' ? 'selected' : ''} onClick={() => updateState((current) => ({ ...current, calendarView: 'month' }))}>Month</button><button type="button" className={state.calendarView === 'week' ? 'selected' : ''} onClick={() => updateState((current) => ({ ...current, calendarView: 'week' }))}>Week</button><button type="button" className={state.calendarView === 'day' ? 'selected' : ''} onClick={() => updateState((current) => ({ ...current, calendarView: 'day' }))}>Day</button><button type="button" className={state.calendarView === 'agenda' ? 'selected' : ''} onClick={() => updateState((current) => ({ ...current, calendarView: 'agenda' }))}>Agenda</button></div><button className="plain-button" type="button" onClick={() => { setWeekStart(startOfWeek(todayIso())); setMonthCursor(todayIso().slice(0, 7)); }}>Today</button></div>{state.calendarView === 'month' && <div className="planner-month-grid">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <b className="planner-month-label" key={day}>{day}</b>)}{monthDays.map((date, index) => <div className={`planner-month-cell ${date === todayIso() ? 'is-today' : ''}`} key={`${date || 'blank'}-${index}`}>{date && <><span>{dateFromIso(date).getDate()}</span>{entriesForDate(date).slice(0, 2).map(renderClassEntry)}{entriesForDate(date).length > 2 && <small>+ {entriesForDate(date).length - 2} more</small>}</>}</div>)}</div>}{state.calendarView === 'week' && renderTimeGrid(weekDates)}{state.calendarView === 'day' && <div className="planner-day-view"><div className="planner-day-view-heading"><button className="plain-button" type="button" onClick={() => setWeekStart(addDays(weekStart, -1))}>←</button><h3>{formatLongDate(weekDates[0])}</h3><button className="plain-button" type="button" onClick={() => setWeekStart(addDays(weekStart, 1))}>→</button></div>{renderTimeGrid([weekDates[0]])}</div>}{state.calendarView === 'agenda' && renderAgenda()}</div><aside>{renderEventForm()}</aside></div>
  </div>;

  const view = state.activeView === 'courses' ? renderCourses() : state.activeView === 'timetable' ? renderTimetable() : state.activeView === 'calendar' ? renderCalendar() : renderToday();
  return <section className={['planner-shell container', state.activeView === 'timetable' ? 'planner-layout-timetable' : state.activeView === 'calendar' ? 'planner-layout-calendar' : ''].filter(Boolean).join(' ')}>
    <div className="planner-topbar"><div><span className="planner-kicker">Private on this device</span><p>Guest mode is ready. No account is required for planning.</p></div>{notice && <div className="planner-notice" role="status">{notice}</div>}</div>
    <div className="planner-layout"><aside className="planner-nav"><button className={state.activeView === 'today' ? 'active' : ''} type="button" onClick={() => setActiveView('today')}><span>01</span>Today</button><button className={state.activeView === 'courses' ? 'active' : ''} type="button" onClick={() => setActiveView('courses')}><span>02</span>Choose courses</button><button className={state.activeView === 'timetable' ? 'active' : ''} type="button" onClick={() => setActiveView('timetable')}><span>03</span>Timetable</button><button className={state.activeView === 'calendar' ? 'active' : ''} type="button" onClick={() => setActiveView('calendar')}><span>04</span>Calendar</button><div className="planner-nav-note"><strong>Build it your way.</strong><span>Classes come from verified offerings. Personal events are always yours to add.</span></div></aside><div className="planner-panel">{view}</div></div>
  </section>;
}
