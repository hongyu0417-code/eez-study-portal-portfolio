import type { Course, CourseOffering, Semester } from './types';

export const plannerCourses: Course[] = [
  { courseCode: 'KIX1001', courseName: 'Engineering Mathematics 1', semester: 'semester-1' },
  { courseCode: 'KIE1003', courseName: 'Digital System', semester: 'semester-1' },
  { courseCode: 'KIE1004', courseName: 'Programming I', semester: 'semester-1' },
  { courseCode: 'KIE1005', courseName: 'Circuit Analysis I', semester: 'semester-1' },
  { courseCode: 'KIX1002', courseName: 'Engineering Mathematics 2', semester: 'semester-2' },
  { courseCode: 'KIE1001', courseName: 'Laboratory 1', semester: 'semester-2' },
  { courseCode: 'KIE1006', courseName: 'Electronic Physics', semester: 'semester-2' },
  { courseCode: 'KIE1007', courseName: 'Electronic Circuit I', semester: 'semester-2' },
  { courseCode: 'KIE2006', courseName: 'Signal and System', semester: 'semester-2' },
];

const courseByCode = new Map(plannerCourses.map((course) => [course.courseCode, course]));
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalText = (value: unknown) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
};

const requiredText = (value: unknown) => typeof value === 'string' ? value.trim() : '';

const makeOfferingId = (offering: Omit<CourseOffering, 'id'>) => [
  offering.courseCode,
  offering.academicSession || '',
  offering.intake || '',
  offering.occNumber || '',
  offering.group || '',
  offering.day,
  offering.startTime,
].join('|');

export function getCourses(query: string, semester: Semester): Course[] {
  const normalized = query.trim().toLowerCase();
  return plannerCourses.filter((course) => course.semester === semester && (
    !normalized || course.courseCode.toLowerCase().includes(normalized) || course.courseName.toLowerCase().includes(normalized)
  ));
}

export function validateOffering(input: unknown): CourseOffering | null {
  if (!input || typeof input !== 'object') return null;
  const row = input as Record<string, unknown>;
  const courseCode = requiredText(row.courseCode).toUpperCase();
  const course = courseByCode.get(courseCode);
  const courseName = requiredText(row.courseName);
  const semester = row.semester === 'semester-1' || row.semester === 'semester-2' ? row.semester : null;
  const day = requiredText(row.day);
  const startTime = requiredText(row.startTime);
  const endTime = requiredText(row.endTime);
  if (!course || courseName !== course.courseName || !semester || semester !== course.semester || !day || !timePattern.test(startTime) || !timePattern.test(endTime)) return null;

  const offering: Omit<CourseOffering, 'id'> = {
    courseCode,
    courseName,
    semester,
    academicSession: optionalText(row.academicSession),
    intake: optionalText(row.intake),
    occNumber: optionalText(row.occNumber),
    group: optionalText(row.group),
    day,
    startTime,
    endTime,
    location: optionalText(row.location),
    building: optionalText(row.building),
    room: optionalText(row.room),
    lecturer: optionalText(row.lecturer),
  };

  return { ...offering, id: makeOfferingId(offering) };
}

const splitCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }
  values.push(current.trim());
  return values;
};

const parseCsv = (text: string) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return { rows: [], errors: ['CSV needs a header row and at least one data row.'] };
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return { rows: lines.slice(1).map((line) => Object.fromEntries(splitCsvLine(line).map((value, index) => [headers[index], value]))), errors: [] };
};

export function parseOfferingText(text: string, fileName: string): { offerings: CourseOffering[]; errors: string[] } {
  let rows: unknown[] = [];
  const errors: string[] = [];
  try {
    if (fileName.toLowerCase().endsWith('.json')) {
      const parsed = JSON.parse(text) as unknown;
      rows = Array.isArray(parsed) ? parsed : [];
      if (!Array.isArray(parsed)) errors.push('JSON must contain an array of offering rows.');
    } else {
      const csv = parseCsv(text);
      rows = csv.rows;
      errors.push(...csv.errors);
    }
  } catch {
    errors.push(`Could not read ${fileName || 'the timetable file'}.`);
  }

  const offerings: CourseOffering[] = [];
  rows.forEach((row, index) => {
    const offering = validateOffering(row);
    if (offering) offerings.push(offering);
    else errors.push(`Row ${index + 1} is missing a verified course or class time.`);
  });
  return { offerings, errors };
}

