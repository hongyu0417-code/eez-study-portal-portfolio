export type Semester = 'semester-1' | 'semester-2';

export type Course = {
  courseCode: string;
  courseName: string;
  semester: Semester;
};

export type CourseOffering = {
  id: string;
  courseCode: string;
  courseName: string;
  semester: Semester;
  academicSession: string | null;
  intake: string | null;
  occNumber: string | null;
  group: string | null;
  day: string;
  startTime: string;
  endTime: string;
  location: string | null;
  building: string | null;
  room: string | null;
  lecturer: string | null;
};

export type PlannerView = 'today' | 'courses' | 'timetable' | 'calendar';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type PlannerEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  reminder: string;
  repeat: string;
  color: string;
};

export type PlannerState = {
  selectedOfferingIds: string[];
  offeringNotes: Record<string, string>;
  offeringColors: Record<string, string>;
  events: PlannerEvent[];
  bookmarks: string[];
  recentActivity: string[];
  activeView: PlannerView;
  calendarView: CalendarView;
  selectedSemester: Semester;
};
