import assert from 'node:assert/strict';
import test from 'node:test';
import { subjects } from '../app/data.ts';

const expected = {
  'engineering-mathematics': {
    folder: 'https://drive.google.com/drive/folders/1jHdl6mrcoqJZkJ-Xj0naVGfGijNeYHNs',
    labels: [
      'Week 1 Notes.pdf', 'Week 1 Lecture.pdf', 'Week 2 Notes.pdf', 'Week 2 Lecture.pdf',
      'Week 3 - 5 Notes.pdf', 'Week 6 - 7 Notes.pdf', 'Week 8_Integration.pdf',
      'Week 8 - 9 Notes.pdf', 'Week 9_Engineering Application Of Integrals.pdf',
      'Week 10_Multiple Integrals.pdf', 'Week 11_Multiple Integrals In Polar Coordinate.pdf',
      'Week 12_Line Integrals.pdf', 'W13_Surface Integrals.pdf', 'W14_Stokes Theorem.pdf',
    ],
  },
  'digital-system': {
    folder: 'https://drive.google.com/drive/u/0/folders/1oWv1BmxjrM9BKAx7pve8h9wTIbAbOT0r',
    labels: [
      'W1 Number Systems.pdf', 'W2 KIE1003 Binary Arithmetic Operations and Coding Systems.pdf',
      'W2 Logic Gates - Boolean Algebra.pdf', 'W3 Logic Gates - Boolean Algebra.pdf',
      'W3 Circuit Optimization - Karnaugh Map.pdf', 'W4 Circuit Optimization - Karnaugh Map.pdf',
      'W5 Combinational Logic.pdf', 'W6 Decoder - Encoder.pdf',
      'W6 KIE1003 Decoder and Encoder.pdf', 'W7 KIE1003 Applications of Decoder and Encoder.pdf',
      'W8_9 Mux and Demux.pdf', 'W10_11 Adders_Substractors_Arithmetic.pdf',
      'W12 Sequential Circuits_Latches and Flip flops.pdf',
      'W13 State Table  Diagram, Timing Diagrams and.pdf', 'W14_Finite State Machine.pdf',
    ],
  },
  programming: {
    folder: 'https://drive.google.com/drive/u/0/folders/1FPcj7a-Zqta31Z4DiyTvOdgylMvi6dqM',
    labels: [
      'W1 Intro to Computer.pdf', 'W2 Basic Concepts 1.pdf', 'W3_Basic Concepts 2.pdf',
      'W4 Control Statements 1.pdf', 'W5_Control Statements 2.pdf', 'W6_Problem Solving.pdf',
      'W7_Functions 1.pdf', 'W8_Functions 2.pdf', 'W9_Arrays.pdf',
      'W10_Multidimensional Arrays.pdf', 'W11_Searching and Sorting.pdf',
      'W12_Pointers- Declaration and Initialization.pdf', 'W13_Pointers- Pass by Reference.pdf',
    ],
  },
} as const;

for (const [id, source] of Object.entries(expected)) {
  test(`${id} uses the approved Drive source and direct PDF links`, () => {
    const subject = subjects.find((item) => item.id === id);
    assert.ok(subject, `Missing subject ${id}`);
    assert.equal(subject.folderUrl, source.folder);
    const lectureNotes = subject.groups.find((group) => group.label === 'Lecture notes');
    assert.ok(lectureNotes, `Missing lecture notes group for ${id}`);
    assert.deepEqual(lectureNotes.links.map((item) => item.label).sort(), [...source.labels].sort());
    assert.ok(lectureNotes.links.every((item) => item.url.startsWith('https://drive.google.com/file/d/')));
  });
}
