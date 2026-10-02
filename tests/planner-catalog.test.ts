import assert from 'node:assert/strict';
import test from 'node:test';
import { getCourses, parseOfferingText, plannerCourses, validateOffering } from '../app/planner/catalog.ts';

test('planner catalogue contains the nine Year 1 core courses', () => {
  assert.equal(plannerCourses.length, 9);
  assert.deepEqual(plannerCourses.filter((course) => course.semester === 'semester-1').map((course) => course.courseCode), ['KIX1001', 'KIE1003', 'KIE1004', 'KIE1005']);
  assert.deepEqual(plannerCourses.filter((course) => course.semester === 'semester-2').map((course) => course.courseCode), ['KIX1002', 'KIE1001', 'KIE1006', 'KIE1007', 'KIE2006']);
});

test('course search matches code and title without caring about case', () => {
  assert.equal(getCourses('kie1005', 'semester-1')[0].courseName, 'Circuit Analysis I');
  assert.equal(getCourses('electronic physics', 'semester-2')[0].courseCode, 'KIE1006');
  assert.equal(getCourses('', 'semester-2').length, 5);
});

test('offering validation rejects unknown courses and preserves optional details', () => {
  const valid = validateOffering({
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
    location: 'Faculty of Engineering',
    building: 'Engineering Block',
    room: 'B-201',
    lecturer: 'Lecturer name',
  });
  assert.equal(valid?.id, 'KIE1005|2026/2027|October|OCC-01|G2|Monday|09:00');
  assert.equal(valid?.room, 'B-201');
  assert.equal(validateOffering({ courseCode: 'FAKE1000', courseName: 'Made-up class', semester: 'semester-1' }), null);
});

test('offering import supports JSON and reports malformed rows', () => {
  const result = parseOfferingText(JSON.stringify([
    { courseCode: 'KIE1005', courseName: 'Circuit Analysis I', semester: 'semester-1', day: 'Monday', startTime: '09:00', endTime: '11:00', group: 'G2' },
    { courseCode: 'FAKE1000', courseName: 'Nope', semester: 'semester-1' },
  ]), 'verified.json');
  assert.equal(result.offerings.length, 1);
  assert.equal(result.errors.length, 1);
});

test('offering import supports a simple CSV header row', () => {
  const csv = [
    'courseCode,courseName,semester,day,startTime,endTime,group',
    'KIX1001,Engineering Mathematics 1,semester-1,Tuesday,10:00,12:00,G1',
  ].join('\n');
  const result = parseOfferingText(csv, 'verified.csv');
  assert.equal(result.errors.length, 0);
  assert.equal(result.offerings[0].courseCode, 'KIX1001');
  assert.equal(result.offerings[0].group, 'G1');
});
