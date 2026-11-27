import { FINISH, LANES, SECTORS } from './config.js';

export function randomStream(seed) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let n = Math.imul(state ^ state >>> 15, 1 | state);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}

const obstacle = (kind, lane, distance) => ({ kind, lane, distance, x: LANES[lane] });
const cornTrail = (lane, start, heights) => heights.map((y, i) => ({
  ...obstacle('corn', lane, start + i * 2.15), y,
}));

export function generateCourse(seed) {
  const random = randomStream(seed);
  const objects = [obstacle('oven', 1, 20), obstacle('knife', 2, 29),
    ...cornTrail(0, 15.5, [.76, .83, .84, .80, .76]),
    obstacle('oven', 0, 68), obstacle('knife', 2, 75), obstacle('crate', 1, 84),
    ...cornTrail(1, 61, [.75, .95, 1.16]),
    obstacle('oven', 1, 183), obstacle('knife', 2, 189), obstacle('fence', 0, 196),
    ...cornTrail(1, 180.4, [1.35, 2.10, 1.82, 1.23]),
  ];
  const types = ['oven', 'knife', 'crate', 'fence'];
  for (let distance = 41; distance < 477; distance += 10 + random() * 5 - distance / 150) {
    if ((distance > 57 && distance < 90) || (distance > 171 && distance < 205)) continue;
    const open = Math.floor(random() * 3);
    const lane = (open + (random() > .5 ? 1 : 2)) % 3;
    objects.push(obstacle(types[Math.floor(random() * 4)], lane, distance));
    if (distance > 93 && random() < .43 + distance / 1800) {
      objects.push(obstacle(types[Math.floor(random() * 4)], 3 - lane - open, distance + random() * .65));
    }
    if (random() < .78) objects.push(...cornTrail(open, distance - 3.8, [.73, .77, .79]));
  }
  objects.push(...cornTrail(1, 480, [.74, .82, .90, .98, 1.05, 1.1, .98]));
  return objects.sort((a, b) => a.distance - b.distance);
}

export function layoutScenery(seed) {
  const random = randomStream(seed ^ 0xac495);
  const props = [];
  const add = (kind, x, distance, scale = 1, variant = 0) => props.push({ kind, x, distance, scale, variant });
  for (let d = -28; d < FINISH + 108; d += 5.6) {
    for (const side of [-1, 1]) {
      const x = side * (5.25 + random() * .24);
      if (d < 489) add('rail', x, d, 1, (d > 459 && random() > .5) ? 1 : 0);
      if (random() < .56) add(random() < .55 ? 'pumpkins' : 'hay', x + side * random() * 2.4, d + random() * 4, .7 + random() * .65);
      if (random() < .76) add('tree', side * (8 + random() * 20), d + random() * 5, .62 + random() * 1.02, Math.floor(random() * 5));
      if (random() < .75) add('tree', side * (30 + random() * 35), d + random() * 5, .88 + random() * 1.55, Math.floor(random() * 5));
      if (random() < .73) add('grass', x - side * .83, d + random() * 5, .65 + random() * .9);
      if (d > 480 || random() < .27) add('flowers', x - side * 1.02, d + random() * 5, .65 + random() * 1.1, d > 480 ? 1 : 0);
    }
  }
  add('barn', 21, 26, 1.3); add('barn', -24, -11, 1.12, 1);
  add('barn', -21, 104, 1.02, 1); add('barn', 24, 202, 1.05);
  add('silo', 31, 34, 1.24); add('silo', -33, -13, 1.02); add('silo', 34, 215, .94);
  add('tree', 8, -1.5, 1.62, 0); add('tree', -9, 11, 1.28, 2);
  add('tree', -8, 54, 1.38, 0); add('tree', 8.9, 67, 1.48, 2);
  add('tree', -9, 166, 1.28, 0); add('tree', 9.5, 197, 1.36, 1);
  add('tree', -8.5, 493, 1.30, 1); add('tree', 9, 504, 1.47, 0);
  for (const sector of SECTORS) add('marker', -5.1, sector.start + 5, 1, Number(sector.number));
  add('gate', 0, FINISH); add('marker', 6, 495, 1.25, 5);
  return props;
}
