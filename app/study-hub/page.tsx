'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Arrow, SiteFooter, SiteHeader } from '../components/SiteChrome';
import Reveal from '../components/Reveal';

type Todo = { id: number; text: string; done: boolean };
type Reminder = { id: number; title: string; date: string };
const formatDate = (date: string) => date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date set';
const daysUntil = (date: string) => Math.max(0, Math.ceil((new Date(`${date}T23:59:59`).getTime() - Date.now()) / 86400000));

export default function StudyHubPage() {
  const [activeTool, setActiveTool] = useState<'pomodoro' | 'planner' | 'dates'>('pomodoro');
  const [target, setTarget] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [examDate, setExamDate] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [seconds, setSeconds] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timerRunning, setTimerRunning] = useState(false);
  const storageLoaded = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    try {
      const savedTarget = localStorage.getItem('eez-target');
      const savedTodos = localStorage.getItem('eez-todos');
      const savedDates = localStorage.getItem('eez-dates');
      startTransition(() => {
        if (savedTarget) setTarget(savedTarget);
        if (savedTodos) setTodos(JSON.parse(savedTodos));
        if (savedDates) { const parsed = JSON.parse(savedDates); setExamDate(parsed.examDate || ''); setReminders(parsed.reminders || []); }
        storageLoaded.current = true;
      });
    } catch { /* Browser storage is optional. */ }
  }, []);
  useEffect(() => { if (storageLoaded.current) localStorage.setItem('eez-target', target); }, [target]);
  useEffect(() => { if (storageLoaded.current) localStorage.setItem('eez-todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { if (storageLoaded.current) localStorage.setItem('eez-dates', JSON.stringify({ examDate, reminders })); }, [examDate, reminders]);
  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => setSeconds((value) => { if (value <= 1) { setTimerRunning(false); return 0; } return value - 1; }), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const completed = todos.filter((todo) => todo.done).length;
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;
  const timerMinutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const timerSeconds = String(seconds % 60).padStart(2, '0');
  const sortedReminders = [...reminders].sort((a, b) => a.date.localeCompare(b.date));
  const addTodo = () => { const text = newTodo.trim(); if (!text) return; setTodos((items) => [...items, { id: Date.now(), text, done: false }]); setNewTodo(''); };
  const addReminder = () => { if (!reminderTitle.trim() || !reminderDate) return; setReminders((items) => [...items, { id: Date.now(), title: reminderTitle.trim(), date: reminderDate }]); setReminderTitle(''); setReminderDate(''); };
  const resetTimer = (mode: 'focus' | 'break' = timerMode) => { setTimerMode(mode); setTimerRunning(false); setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60); };

  return (
    <main>
      <SiteHeader active="study-hub" />
      <Reveal className="page-hero-reveal"><section className="page-hero container study-hero"><div className="eyebrow"><span className="eyebrow-line" /> Your personal study space</div><h1>Make today<br /><span>count.</span></h1><p>A small, private dashboard for focused sessions, daily targets, tasks, and important exam dates. Your notes stay in this browser. No account needed.</p><div className="page-hero-actions"><a className="button button-dark" href="/resources">Find a resource <Arrow /></a><span>Built for consistent progress</span></div></section></Reveal>
      <Reveal className="study-dashboard-reveal" delay={0.06}><section className="desk-section study-dashboard"><div className="container"><div className="section-heading desk-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> The study hub</div><h2>One place to <span>focus.</span></h2></div><p>Choose a tool and keep moving. Changes save locally on this device.</p></div><div className="desk-layout"><aside className="desk-nav"><button className={activeTool === 'pomodoro' ? 'active' : ''} onClick={() => setActiveTool('pomodoro')}><span>◷</span>Pomodoro timer</button><button className={activeTool === 'planner' ? 'active' : ''} onClick={() => setActiveTool('planner')}><span>✓</span>Daily target + tasks</button><button className={activeTool === 'dates' ? 'active' : ''} onClick={() => setActiveTool('dates')}><span>□</span>Exam countdowns</button><div className="desk-tip"><span>✦</span><p><b>Small progress is still progress.</b><br />Show up for one focused session today.</p></div></aside>
        <div className="desk-panel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTool}
              className="tool-panel-transition"
              initial={reducedMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, x: -8 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
          {activeTool === 'pomodoro' && <div className="pomodoro-panel"><div className="tool-kicker">Focus mode · 25 + 5</div><div className="timer-ring"><div><strong>{timerMinutes}:{timerSeconds}</strong><span>{timerMode === 'focus' ? 'FOCUS SESSION' : 'SHORT BREAK'}</span></div></div><div className="timer-actions"><button className="button button-dark" onClick={() => setTimerRunning((value) => !value)}>{timerRunning ? 'Pause session' : seconds === 0 ? 'Start again' : 'Start session'} <Arrow /></button><button className="plain-button" onClick={() => resetTimer()}>Reset</button></div><div className="timer-modes"><button className={timerMode === 'focus' ? 'selected' : ''} onClick={() => resetTimer('focus')}>25 min focus</button><button className={timerMode === 'break' ? 'selected' : ''} onClick={() => resetTimer('break')}>5 min break</button></div><p className="tool-note">Choose one small task, put your phone away, and begin. The timer works while this page is open.</p></div>}
          {activeTool === 'planner' && <div className="planner-panel"><div className="tool-kicker">Today’s plan</div><label className="field-label">My target for today<textarea value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Example: Finish Tutorial 3 and revise nodal analysis..." rows={3} /></label><div className="task-heading"><span className="field-label">Daily checklist</span><strong>{progress}% complete</strong></div><div className="progress-bar"><span style={{ width: `${progress}%` }} /></div><div className="todo-list">{todos.map((todo) => <label className={`todo-item ${todo.done ? 'done' : ''}`} key={todo.id}><input type="checkbox" checked={todo.done} onChange={() => setTodos((items) => items.map((item) => item.id === todo.id ? { ...item, done: !item.done } : item))} /><span>{todo.text}</span><button type="button" aria-label={`Remove ${todo.text}`} onClick={() => setTodos((items) => items.filter((item) => item.id !== todo.id))}>×</button></label>)}{todos.length === 0 && <p className="empty-todo">Add one small task to start your list.</p>}</div><div className="add-todo"><input value={newTodo} onChange={(event) => setNewTodo(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addTodo(); }} placeholder="Add a task..." aria-label="New daily task" /><button type="button" onClick={addTodo}>Add <Arrow /></button></div></div>}
          {activeTool === 'dates' && <div className="dates-panel"><div className="tool-kicker">Keep the important dates visible</div><div className="exam-card"><div><span>Final exam countdown</span><strong>{examDate ? daysUntil(examDate) : '—'}</strong><small>{examDate ? `${formatDate(examDate)} · days left` : 'Choose your final exam date below'}</small></div><span className="calendar-symbol">□</span></div><label className="field-label">Final exam date<input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} /></label><div className="reminder-form"><label className="field-label">Reminder title<input value={reminderTitle} onChange={(event) => setReminderTitle(event.target.value)} placeholder="Midsem test / assignment due..." /></label><label className="field-label">Date<input type="date" value={reminderDate} onChange={(event) => setReminderDate(event.target.value)} /></label><button className="button button-dark" type="button" onClick={addReminder}>Add reminder <Arrow /></button></div><div className="reminders"><div className="task-heading"><span className="field-label">Upcoming reminders</span><span>{reminders.length} saved</span></div>{sortedReminders.length === 0 && <p className="empty-todo">Add your next test, quiz, or assignment due date.</p>}{sortedReminders.map((reminder) => <div className="reminder-row" key={reminder.id}><span className="reminder-date">{formatDate(reminder.date)}</span><b>{reminder.title}</b><button type="button" aria-label={`Remove ${reminder.title}`} onClick={() => setReminders((items) => items.filter((item) => item.id !== reminder.id))}>×</button></div>)}</div></div>}
            </motion.div>
          </AnimatePresence>
        </div></div></div></section></Reveal>
      <Reveal className="study-how-reveal" delay={0.08}><section className="how-section"><div className="container"><div className="section-heading how-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> A simple study loop</div><h2>Know what to open <span>next.</span></h2></div><p>Use the library in the same order you learn: understand, practise, then test yourself.</p></div><div className="study-grid"><Reveal className="study-step-reveal" delay={0.04}><article className="study-step"><div className="study-step-top"><span>01</span><i>↳</i></div><h3>Understand</h3><p>Start with the lecture notes or a prompt-assisted chapter overview.</p></article></Reveal><Reveal className="study-step-reveal" delay={0.09}><article className="study-step"><div className="study-step-top"><span>02</span><i>✎</i></div><h3>Practise</h3><p>Use tutorials and solutions to build a repeatable problem-solving method.</p></article></Reveal><Reveal className="study-step-reveal" delay={0.14}><article className="study-step"><div className="study-step-top"><span>03</span><i>◒</i></div><h3>Test yourself</h3><p>Finish with past-year papers under realistic exam conditions.</p></article></Reveal></div></div></section></Reveal>
      <Reveal className="study-callout-reveal" delay={0.1}><section className="prompt-callout container"><div><div className="eyebrow"><span className="eyebrow-line" /> Exam-focused AI help</div><h2>Study smarter with the <span>right prompt.</span></h2><p>Use the AI library to turn your own lecture files into concise explanations, exam maps, cheat sheets, and worked-example breakdowns.</p></div><a className="button button-dark" href="/ai-library">Explore AI library <Arrow /></a></section></Reveal>
      <SiteFooter />
    </main>
  );
}
