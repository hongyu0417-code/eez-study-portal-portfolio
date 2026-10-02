export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  category: string;
};

export const searchEntries: SearchEntry[] = [
  { title: 'Resource library', description: 'Browse every semester resource in one place.', href: '/resources', category: 'Portal' },
  { title: 'Semester 1 resources', description: 'Circuit Analysis, Engineering Mathematics 1, Digital System, and Programming 1.', href: '/resources/year-1', category: 'Resources' },
  { title: 'Semester 2 resources', description: 'Engineering Mathematics 2, Signal and System, Electronic Physics, Electronic Circuit 1, and Lab 1.', href: '/resources/year-2', category: 'Resources' },
  { title: 'Circuit Analysis · KIE1005', description: 'Semester 1 lecture notes, tutorials, and past-year materials.', href: '/resources/year-1#circuit-analysis', category: 'Course' },
  { title: 'Engineering Mathematics 1 · KIX1001', description: 'Semester 1 weekly lecture notes and revision materials.', href: '/resources/year-1#engineering-mathematics-1', category: 'Course' },
  { title: 'Digital System · KIE1003', description: 'Semester 1 weekly lectures, tutorials, and solutions.', href: '/resources/year-1#digital-system', category: 'Course' },
  { title: 'Programming 1 · KIE1004', description: 'Semester 1 weekly lectures, tutorials, and practice materials.', href: '/resources/year-1#programming-1', category: 'Course' },
  { title: 'Electronic Circuit 1', description: 'Semester 2 circuit analysis resources, including MOSFET and op-amp topics.', href: '/resources/year-2#electronic-circuit-1', category: 'Course' },
  { title: 'Study hub', description: 'Pomodoro timer, targets, daily checklist, countdowns, and reminders.', href: '/study-hub', category: 'Tool' },
  { title: 'AI library', description: 'Exam-focused prompts with practical examples for your own lecture files.', href: '/ai-library', category: 'AI study' },
  { title: 'Pomodoro timer', description: 'Start a focused study session in the Study hub.', href: '/study-hub', category: 'Study' },
  { title: 'Exam countdown', description: 'Keep your final exam date visible while you study.', href: '/study-hub', category: 'Study' },
];
