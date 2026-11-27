import { newRun } from './game.js';

export function stageShot(name, course) {
  if (name === 'title') return { run: newRun(course), phase: .86 };
  const run = newRun(course, 'play');
  if (name === 'chase') {
    Object.assign(run, { distance: 62, score: 674, points: 550, corn: 14, gap: 4.65, camera: 'chase', time: 4.72 });
    return { run, phase: .82 };
  }
  if (name === 'near') {
    Object.assign(run, { distance: 182.55, y: 1.45, vy: .68, score: 1564, points: 1200,
      lives: 1, gap: 2.55, corn: 27, camera: 'near', time: 13.1 });
    return { run, phase: 1.00 };
  }
  if (name === 'end') {
    Object.assign(run, { mode: 'escaped', distance: 500, score: 4175, points: 2875, lives: 2, gap: 6.2, corn: 48, time: 31.6 });
    return { run, phase: .64 };
  }
  return null;
}
