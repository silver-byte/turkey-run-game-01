import { FINISH, HAZARDS, LANES, MAX_LIVES, clamp, pace } from './config.js';

export function newRun(course, mode = 'title') {
  return {
    mode, course, distance: 0, time: 0, lane: 1, x: 0, y: 0, vy: 0, slide: 0,
    lives: MAX_LIVES, gap: 8.8, corn: 0, streak: 0, points: 0, score: 0,
    invulnerable: 0, stumble: 0, notice: '', noticeTime: 0, seen: new Set(), next: 0,
    camera: null, events: [],
  };
}

export function finishGrade(run) {
  if (run.lives === 3 && run.corn >= 35) return 'S';
  if (run.lives === 3 || run.corn >= 35) return 'A';
  if (run.lives === 2) return 'B';
  return 'C';
}

function announce(run, text) {
  run.notice = text;
  run.noticeTime = 1.3;
}

function takeHit(run) {
  run.lives--;
  run.gap -= 2.85;
  run.invulnerable = 1.03;
  run.stumble = .53;
  run.streak = 0;
  run.events.push('hit');
  announce(run, run.lives === 1 ? 'LAST FEATHER!' : 'FEATHERS RUFFLED!');
  if (run.lives <= 0 || run.gap < 1.35) {
    run.mode = 'caught';
    run.events.push('caught');
  }
}

function collect(run, item) {
  run.seen.add(item);
  run.corn++;
  run.streak++;
  const bonus = Math.min(3, Math.ceil(run.streak / 4));
  run.points += 25 * bonus;
  run.events.push('corn');
  announce(run, bonus === 1 ? '+25  /  SWEET CORN' : `+${25 * bonus}  /  CORN STREAK ×${bonus}`);
}

export function stepRun(run, controls, dt) {
  if (run.mode !== 'play') return;
  run.time += dt;
  run.invulnerable = Math.max(0, run.invulnerable - dt);
  run.stumble = Math.max(0, run.stumble - dt);
  run.noticeTime = Math.max(0, run.noticeTime - dt);
  run.slide = Math.max(0, run.slide - dt);
  run.lane = clamp(run.lane + Number(Boolean(controls.right)) - Number(Boolean(controls.left)), 0, 2);
  run.x += (LANES[run.lane] - run.x) * (1 - Math.exp(-15 * dt));
  if (controls.jump && !run.y && run.slide < .04) {
    run.vy = 8.9;
    run.events.push('jump');
  }
  if (controls.duck) {
    run.slide = .66;
    if (run.y > 0) run.vy = Math.min(run.vy, -10);
    run.events.push('slide');
  }
  if (run.y || run.vy > 0) {
    run.vy -= 22 * dt;
    run.y = Math.max(0, run.y + run.vy * dt);
    if (!run.y) run.vy = 0;
  }
  run.distance = Math.min(FINISH, run.distance + pace(run.distance) * (run.stumble ? .74 : 1) * dt);
  run.gap = clamp(run.gap + (run.stumble ? -1.35 : .52) * dt, .8, 9.4);

  while (run.next < run.course.length && run.course[run.next].distance < run.distance - 1.55) run.next++;
  for (let i = run.next; i < run.course.length; i++) {
    const item = run.course[i];
    const delta = item.distance - run.distance;
    if (delta > 1.3) break;
    if (run.seen.has(item)) continue;
    const across = Math.abs(run.x - item.x);
    if (item.kind === 'corn') {
      if (Math.abs(delta) < 1.19 && across < .84 && Math.abs(run.y + .74 - item.y) < .73) collect(run, item);
      continue;
    }
    const hazard = HAZARDS[item.kind];
    if (delta >= -.85 && delta <= .92 && across < hazard.width + .18 && !run.invulnerable) {
      const clear = item.kind === 'knife' ? run.slide > 0 && run.y < .24 : run.y > hazard.height;
      if (!clear) {
        run.seen.add(item);
        takeHit(run);
        if (run.mode !== 'play') break;
      }
    }
  }
  run.score = Math.floor(run.distance) * 2 + run.points;
  if (run.mode === 'play' && run.distance >= FINISH) {
    run.mode = 'escaped';
    run.score += run.lives * 150;
    run.events.push('escaped');
  }
}
