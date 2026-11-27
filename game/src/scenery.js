import * as T from '../vendor/three.module.min.js';
import { PALETTE } from './config.js';
import { ball, beam, box, group, paint, piece } from './mesh.js';
import { pumpkin } from './turkey.js';
import { randomStream } from './world.js';

const bark = '#77463b', wood = '#a16549', dark = '#744838', gold = '#dca765';

function autumnTree(root, variant) {
  const random = randomStream(657 + variant * 44);
  const colors = [PALETTE.canopy[variant], ['#e65238', '#f99441', '#ffd065', '#ec9d3e', '#f5cc71'][variant],
    ['#813340', '#b54533', '#c2762c', '#ad532d', '#ce812d'][variant]];
  beam(root, bark, [0, 0, 0], [.19, 3.23, .04], .26);
  beam(root, '#9c5e40', [-.13, .15, .10], [.05, 2.63, .20], .071);
  for (let i = 0; i < 12; i++) {
    const angle = i * 2.4;
    const bias = i < 8 ? 1 : .47;
    const x = Math.sin(angle) * (1 + random() * .88) * bias;
    const z = Math.cos(angle) * (1 + random() * .84) * bias;
    const y = 3.04 + random() * .72 + (i >= 8 ? .99 : .07);
    if (i < 8) beam(root, bark, [.10, 1.58 + random(), .03], [x, y, z], .092);
    const r = .71 + random() * .49;
    const tuft = piece(root, 'low', colors[i % 3], x, y, z, r * 1.17, r * .90, r);
    tuft.rotation.set(random() * 2, angle, .17);
    if (i % 2 === 0) piece(root, 'low', colors[1], x + .18, y + r * .55, z + .27, r * .68, r * .56, r * .64);
  }
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26;
    beam(root, bark, [0, .25, 0], [Math.cos(a) * .58, .027, Math.sin(a) * .57], .073);
  }
}

function rail(root, broken) {
  box(root, dark, 0, .67, 0, .245, 1.34, .245);
  piece(root, 'cone', gold, 0, 1.38, 0, .173, .21, .173).rotation.y = .38;
  for (const y of [.42, .93]) {
    const plank = box(root, y > .5 ? wood : '#86533e', 0, y, broken ? -1.34 : -2.8, .129, .164, broken ? 2.7 : 5.7);
    if (broken) plank.rotation.x = .20;
    ball(root, '#503337', -.076, y, -.045, .035, .037, .036);
    ball(root, '#503337', .076, y, -.045, .035, .037, .036);
  }
}

function barn(root, variant) {
  root.rotation.y = variant ? -.37 : .36;
  const red = PALETTE.barn, trim = '#f1cb97', roof = '#57353f';
  box(root, red, 0, 2.60, 0, 8.9, 5.2, 9.30);
  for (let i = -14; i <= 14; i++) {
    const x = i * .304;
    box(root, i % 3 ? '#bc5144' : '#87333b', x, 2.63, 4.664, .044, 5.12, .045);
  }
  for (const x of [-4.39, 4.39]) {
    box(root, trim, x, 2.62, 4.69, .19, 5.24, .15);
    for (let i = -14; i <= 14; i++) box(root, '#8c353c', x * 1.017, 2.58, i * .317, .038, 5.14, .036);
  }
  const gable = new T.Shape();
  gable.moveTo(-4.46, 5.13); gable.lineTo(-3.13, 7.07); gable.lineTo(0, 8.30);
  gable.lineTo(3.13, 7.07); gable.lineTo(4.46, 5.13); gable.closePath();
  piece(root, new T.ExtrudeGeometry(gable, { depth: 9.28, bevelEnabled: false }), '#9e4041', 0, 0, -4.63, 1, 1, 1);
  for (const side of [-1, 1]) {
    const covers = [[[side * 4.81, 5.00], [side * 3.18, 7.14]], [[side * 3.18, 7.14], [0, 8.44]]];
    for (const [[x0, y0], [x1, y1]] of covers) {
      const panel = box(root, roof, (x0 + x1) / 2, (y0 + y1) / 2, 0, Math.hypot(x1 - x0, y1 - y0) + .12, .24, 10.04);
      panel.rotation.z = Math.atan2(y1 - y0, x1 - x0);
      for (let i = -7; i <= 7; i++) beam(root, '#795057', [x0, y0 + .11, i * .66], [x1, y1 + .11, i * .66], .035);
      beam(root, trim, [x0, y0, 5.05], [x1, y1, 5.05], .18, true);
    }
  }
  box(root, trim, 0, 1.83, 4.744, 3.41, 3.62, .14);
  box(root, '#794342', 0, 1.73, 4.83, 3.11, 3.39, .06);
  for (const x of [-.78, .78]) {
    box(root, '#9b423e', x, 1.68, 4.89, 1.43, 3.20, .044);
    for (const slash of [-1, 1]) beam(root, trim, [x - .62, 1.66 - slash * 1.47, 4.94], [x + .62, 1.66 + slash * 1.47, 4.94], .13, true);
  }
  for (const [x, y] of [[-.01, 6.28], [-3.19, 3.13], [3.19, 3.13]]) {
    box(root, trim, x, y, 4.77, 1.12, 1.12, .20);
    box(root, '#553b43', x, y, 4.89, .88, .88, .071);
    box(root, trim, x, y, 4.94, .068, .92, .05);
    box(root, trim, x, y, 4.94, .92, .068, .05);
  }
}

function silo(root) {
  piece(root, 'cylinder', '#b49b90', 0, 3.85, 0, 1.66, 7.70, 1.66);
  ball(root, '#77545b', 0, 7.71, 0, 1.74, 1.26, 1.74);
  for (let i = 0; i < 13; i++) {
    const ring = piece(root, 'torus', i % 3 ? '#d6b5a1' : '#94736d', 0, .32 + i * .58, 0, 1.65, 1.65, .29);
    ring.rotation.x = Math.PI / 2;
  }
  for (const x of [-.26, .26]) box(root, '#834e42', x, 3.70, 1.70, .073, 7.17, .064);
  for (let i = 0; i < 16; i++) box(root, '#b37a59', 0, .45 + i * .417, 1.72, .56, .056, .08);
  piece(root, 'cylinder', '#eabd98', 0, 9.02, 0, .088, .35, .087);
}

function haystack(root) {
  for (const [x, y, s] of [[-.52, .46, .51], [.51, .46, .51], [-.09, 1.14, .47]]) {
    const bale = piece(root, 'cylinder', '#d2a25c', x, y, 0, s, 1.04, s);
    bale.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      piece(root, 'torus', i % 2 ? '#e9c17e' : '#9a673d', x, y, .534, .105 + i * .145, .105 + i * .145, .164);
    }
    for (const z of [-.35, .36]) {
      const ring = piece(root, 'torus', '#986342', x, y, z, s * .99, s * .99, .155);
      ring.rotation.z = .35;
    }
  }
}

export function signFace(text, sub, foreground = '#f9d58e', background = '#58352e') {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 192;
  const pen = canvas.getContext('2d');
  pen.fillStyle = background; pen.fillRect(0, 0, 512, 192);
  pen.strokeStyle = foreground; pen.lineWidth = 4; pen.strokeRect(12, 12, 488, 168);
  pen.strokeStyle = '#976040'; pen.lineWidth = 2;
  for (const y of [48, 95, 143]) { pen.beginPath(); pen.moveTo(15, y); pen.lineTo(497, y); pen.stroke(); }
  pen.fillStyle = foreground; pen.textAlign = 'center';
  pen.font = '900 68px Georgia'; pen.fillText(text, 256, 105, 436);
  pen.font = 'bold 24px sans-serif'; pen.fillText(sub, 256, 146, 430);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return paint('#ffffff', { map: texture, roughness: .92 });
}

function signboard(root, heading, subtitle, width, height, y, reverse = false) {
  box(root, '#603c38', 0, y, 0, width + .18, height + .15, .27);
  const board = signFace(heading, subtitle);
  piece(root, new T.PlaneGeometry(width, height), board, 0, y, .143, 1, 1, 1);
  if (reverse) piece(root, new T.PlaneGeometry(width, height), board, 0, y, -.143, 1, 1, 1).rotation.y = Math.PI;
  for (const x of [-width * .46, width * .46]) ball(root, '#edbd87', x, y, .169, .066, .066, .029);
}

function wildGate(root) {
  for (const side of [-1, 1]) {
    const x = side * 4.54;
    box(root, '#574035', x, 2.58, 0, .49, 5.16, .59);
    box(root, '#865a44', x, 3.11, .28, .35, 3.91, .085);
    box(root, '#c28655', x, 5.17, 0, .68, .22, .72);
    beam(root, '#8b5842', [x, 3.60, 0], [x - side * 1.25, 4.89, 0], .245, true);
    const door = group(root, x - side * .15, 0, .10);
    door.rotation.y = side * 1.12;
    for (const y of [.47, 1.07, 1.71]) {
      const extent = y > 1.6 ? 3.35 : 3.89;
      box(door, y > 1 ? '#a66a4b' : '#85583e', -side * extent / 2, y, 0, extent, .175, .17);
      piece(door, 'cone', '#d9a064', -side * extent, y, 0, .138, .22, .134).rotation.z = side * Math.PI / 2;
    }
    beam(door, '#cc8d59', [-side * .14, .42, .087], [-side * 3.0, 1.73, .087], .133, true);
    piece(root, 'gem', '#e1a85c', x, 5.38, 0, .28, .28, .28);
  }
  box(root, '#825140', 0, 4.94, 0, 9.83, .32, .50);
  signboard(root, 'THE WILD', 'EST.  •  500 M FROM SUPPER', 4.60, 1.73, 5.14, true);
}

function meadowTuft(root, blooms, wild) {
  const random = randomStream(wild ? 354 : 840);
  for (let i = 0; i < (blooms ? 8 : 7); i++) {
    const x = (random() - .5) * 1.20, z = (random() - .5) * 1.77;
    const y = .17 + random() * .47;
    beam(root, i % 2 ? '#948939' : '#848243', [x, 0, z], [x + .12, y, z - .07], .019);
    if (blooms) {
      const flower = group(root, x + .11, y, z - .07);
      for (let j = 0; j < 5; j++) {
        const a = j * 1.257;
        piece(flower, 'gem', wild ? (i % 2 ? '#f7ca6b' : '#e4969d') : '#ddb760',
          .068 * Math.cos(a), .012, .068 * Math.sin(a), .063, .034, .061);
      }
      piece(flower, 'gem', '#853e42', 0, .027, 0, .047, .031, .047);
    } else {
      piece(root, 'gem', '#b0a746', x + .09, y * .58, z, .033, y * .28, .052).rotation.z = -.59;
    }
  }
}

export function buildProp(prop) {
  const root = group(null);
  switch (prop.kind) {
    case 'tree': autumnTree(root, prop.variant); break;
    case 'rail': rail(root, prop.variant); break;
    case 'barn': barn(root, prop.variant); break;
    case 'silo': silo(root); break;
    case 'hay': haystack(root); break;
    case 'pumpkins':
      pumpkin(root, -.29, 0, .2, .65); pumpkin(root, .36, 0, -.20, .46, 1);
      pumpkin(root, .46, 0, .54, .34); break;
    case 'grass': meadowTuft(root, false, false); break;
    case 'flowers': meadowTuft(root, true, prop.variant); break;
    case 'gate': wildGate(root); break;
    case 'marker': {
      root.rotation.y = prop.x > 0 ? -.32 : .28;
      box(root, bark, 0, .92, -.10, .19, 1.84, .23);
      const name = ['BARNYARD', 'CIDER HOLLOW', 'BLACKBERRY RIDGE', 'WILD GATE', 'NO SUPPER'][prop.variant - 1];
      signboard(root, name, prop.variant === 5 ? 'WILDLIFE CROSSING' : `SECTOR   /   0${prop.variant}`, 1.90, .73, 1.71);
      break;
    }
  }
  return root;
}

export function makeCaughtPot(parent) {
  const root = group(parent);
  const kettle = paint('#332932', { roughness: .42, metalness: .24 });
  ball(root, kettle, 0, .99, 0, 1.71, .90, 1.32);
  piece(root, 'cylinder', kettle, 0, 1.37, 0, 1.67, .49, 1.28);
  const lip = piece(root, 'torus', '#956656', 0, 1.64, 0, 1.67, 1.27, .77);
  lip.rotation.x = -Math.PI / 2;
  for (const x of [-1.65, 1.65]) {
    piece(root, 'torus', '#9c6451', x, 1.47, 0, .41, .26, .49).rotation.y = Math.PI / 2;
    box(root, '#513039', x * .64, .16, 0, .43, .20, .49);
  }
  for (let i = 0; i < 11; i++) {
    const steam = ball(root, paint('#ffca92', { transparent: true, opacity: .22, depthWrite: false }),
      (i % 3 - 1) * .49, 1.77 + i * .117, -.12, .15 + i * .021, .14, .16 + i * .023);
    steam.castShadow = false;
  }
  return root;
}
