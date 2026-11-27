import * as T from '../vendor/three.module.min.js';
import { ball, beam, box, group, paint, piece } from './mesh.js';

function plumage(parent, i, angle) {
  const colors = ['#902f49', '#c64641', '#e36b43', '#d99547', '#eac279', '#f6ddaa'];
  const feather = group(parent, 0, 0, .12 + Math.cos(angle) * .12);
  feather.rotation.z = -angle;
  feather.rotation.x = -.13 - Math.abs(angle) * .06;
  const size = 1 - .14 * Math.abs(angle);
  feather.scale.setScalar(size);
  ball(feather, '#4e2635', 0, 1.06, 0, .285, 1.18, .125);
  ball(feather, colors[(i + 2) % 5], 0, 1.12, .064, .255, 1.102, .095);
  ball(feather, '#f3ac5c', 0, 1.63, .12, .237, .53, .058);
  ball(feather, '#622b40', 0, 1.69, .151, .226, .163, .052);
  ball(feather, colors[5], 0, 1.93, .149, .162, .135, .043);
  ball(feather, '#f7cc83', 0, 1.09, .165, .018, .79, .019);
  ball(feather, colors[(i + 2) % 5], 0, 1.18, -.081, .235, 1.014, .060);
  ball(feather, '#f4c277', 0, 1.82, -.099, .199, .265, .048);
}

export function makeTurkey(parent) {
  const root = group(parent);
  const rig = group(root);
  const tail = group(rig, 0, 1.22, .53);
  for (let i = 0; i < 11; i++) plumage(tail, i, (i - 5) * .208);
  for (let i = 0; i < 7; i++) {
    const plume = group(tail, 0, .06, .30);
    plume.rotation.z = (i - 3) * .28;
    ball(plume, i % 2 ? '#7d3742' : '#aa5141', 0, .61, 0, .234, .71, .091);
    ball(plume, '#db8c52', 0, .99, .043, .158, .215, .066);
  }
  ball(rig, '#683735', 0, 1.21, 0, .84, .76, 1.0);
  ball(rig, '#d78c55', 0, 1.14, -.47, .71, .64, .62);
  ball(rig, '#f1bc7c', 0, 1.09, -.72, .60, .58, .39);
  for (let i = 0; i < 9; i++) {
    const x = (i % 3 - 1) * .21 + ((Math.floor(i / 3) % 2) * .1 - .05);
    const y = 1.00 + Math.floor(i / 3) * .18;
    const z = -1.066 + (x * x + (y - 1.1) ** 2) * .55;
    ball(rig, i % 2 ? '#ffdb94' : '#e6aa69', x, y, z, .096, .065, .035).rotation.z = -.16 + i * .024;
  }
  const wings = [-1, 1].map(side => {
    const wing = group(rig, side * .61, 1.42, -.22);
    ball(wing, '#643540', side * .19, -.06, .29, .255, .32, .65).rotation.x = .16;
    for (let i = 0; i < 5; i++) {
      ball(wing, i % 2 ? '#aa6348' : '#c27750', side * (.28 + i * .016), .10 - i * .085,
        .38 - i * .046, .17, .095, .49).rotation.x = -.19 + .13 * i;
      ball(wing, '#f1c282', side * (.348 + i * .014), .08 - i * .077, .62 - i * .048, .122, .063, .189);
    }
    return wing;
  });
  const head = group(rig, 0, 1.63, -.74);
  ball(head, '#b84c52', 0, .266, -.041, .218, .57, .239).rotation.x = -.24;
  ball(head, '#e27a70', 0, .665, -.194, .365, .332, .356);
  ball(head, '#f59a7b', 0, .755, -.256, .303, .231, .277);
  ball(head, '#a92945', 0, .275, -.334, .161, .322, .129).rotation.z = -.2;
  ball(head, '#da3c48', -.03, .356, -.427, .094, .244, .079);
  ball(head, '#d24d45', -.047, .602, -.542, .073, .172, .083).rotation.z = -.24;
  const beak = piece(head, 'cone', '#fcb343', 0, .578, -.536, .186, .37, .144);
  beak.rotation.x = -Math.PI / 2;
  ball(head, '#ab5c31', 0, .51, -.553, .136, .035, .142);
  for (const side of [-1, 1]) {
    ball(head, '#805876', side * .273, .692, -.314, .11, .129, .141);
    ball(head, '#fff1cd', side * .296, .705, -.352, .103, .11, .113);
    ball(head, '#30232d', side * .347, .702, -.401, .058, .072, .061);
    ball(head, '#fff7dc', side * .374, .733, -.433, .022, .026, .022);
    ball(head, '#d25d58', side * .271, .549, -.232, .084, .077, .125);
  }
  const legs = [-1, 1].map(side => {
    const thigh = group(rig, side * .36, .74, .06);
    ball(thigh, '#9b5943', 0, -.10, 0, .176, .26, .17);
    beam(thigh, '#e49344', [0, -.13, 0], [.018, -.49, -.07], .073);
    const foot = group(thigh, .018, -.57, -.04);
    for (let i = -1; i <= 1; i++) {
      beam(foot, '#ee9d49', [0, .013, 0], [i * .13, 0, -.27 + Math.abs(i) * .068], .039);
      ball(foot, '#ffe1a0', i * .138, -.009, -.278 + Math.abs(i) * .068, .035, .024, .055);
    }
    return thigh;
  });
  return { root, rig, tail, wings, head, legs };
}

export function poseTurkey(turkey, run, phase, idle = false) {
  const stride = phase * (idle ? 4.2 : 14);
  const crouch = run.slide > 0 && run.y < .3;
  turkey.root.position.set(run.x, run.y, -run.distance);
  turkey.rig.position.y = crouch ? .025 : Math.sin(stride * 2) * (idle ? .026 : .059);
  turkey.rig.scale.set(1, crouch ? .46 : 1, crouch ? 1.23 : 1);
  turkey.rig.rotation.set(crouch ? -.11 : .06 + Math.min(.18, run.y * .12), 0,
    run.stumble * Math.sin(stride) * .39);
  turkey.tail.rotation.z = Math.sin(stride) * (idle ? .033 : .085);
  turkey.tail.rotation.x = crouch ? .56 : .06 + Math.sin(stride + .2) * .047;
  turkey.head.rotation.y = idle ? Math.sin(phase * 1.3) * .22 : Math.sin(stride) * .09;
  turkey.wings.forEach((wing, i) => {
    wing.rotation.z = (i ? 1 : -1) * (run.y > .28 ? .58 + .30 * Math.sin(stride) : .09 + .11 * Math.sin(stride));
    wing.rotation.x = Math.sin(stride + i * Math.PI) * .15;
  });
  turkey.legs.forEach((leg, i) => {
    leg.rotation.x = idle ? .13 - i * .28 : run.y ? -.43 + i * .65 : Math.sin(stride + i * Math.PI) * .71;
  });
}

export function makeFarmer(parent) {
  const root = group(parent), ribs = group(root, 0, 1.12, 0);
  const denim = '#365572', seam = '#7a91a0', shirt = '#ba5548', skin = '#e2a175';
  ball(ribs, shirt, 0, .44, 0, .48, .58, .30);
  ball(ribs, denim, 0, .08, 0, .42, .30, .32);
  box(ribs, denim, 0, .35, -.239, .58, .53, .14);
  box(ribs, seam, 0, .36, -.32, .27, .17, .025);
  for (const side of [-1, 1]) {
    box(ribs, denim, side * .24, .65, -.205, .11, .46, .073).rotation.z = side * -.14;
    ball(ribs, '#eac377', side * .22, .52, -.294, .042, .042, .027);
  }
  ball(ribs, skin, 0, 1.01, 0, .233, .265, .22);
  ball(ribs, '#9b5436', 0, .94, -.138, .201, .095, .12);
  ball(ribs, skin, 0, 1.017, -.234, .071, .071, .087);
  for (const side of [-1, 1]) {
    ball(ribs, '#2d2427', side * .088, 1.075, -.202, .036, .03, .023);
    box(ribs, '#703c33', side * .09, 1.111, -.204, .091, .023, .021).rotation.z = side * .23;
  }
  const brim = piece(ribs, 'cylinder', '#ce9551', 0, 1.22, .017, .463, .061, .363);
  brim.rotation.z = .13;
  const crown = piece(ribs, 'cylinder', '#e5ac59', 0, 1.31, .017, .279, .212, .247);
  crown.rotation.z = .15;
  const ribbon = piece(ribs, 'cylinder', '#884336', 0, 1.245, .017, .286, .052, .253);
  ribbon.rotation.z = .15;
  const legs = [-1, 1].map(side => {
    const hip = group(root, side * .22, 1.08, 0);
    beam(hip, denim, [0, .09, 0], [side * .045, -.54, -.09], .167);
    const shin = group(hip, side * .045, -.51, -.09);
    beam(shin, denim, [0, .05, 0], [-side * .05, -.44, .02], .138);
    ball(shin, '#55343a', -.015, -.463, -.088, .151, .103, .255);
    return { hip, shin };
  });
  const arms = [-1, 1].map(side => {
    const arm = group(ribs, side * .40, .67, 0);
    beam(arm, shirt, [0, 0, 0], [side * .22, -.30, .03], .149);
    beam(arm, skin, [side * .22, -.27, .03], [side * .26, -.41, -.33], .097);
    ball(arm, skin, side * .26, -.41, -.34, .12, .106, .111);
    if (side === 1) {
      beam(arm, '#793e2d', [.27, -.97, -.41], [.27, 1.04, -.10], .047);
      const net = group(arm, .27, 1.24, -.056);
      net.rotation.x = .32;
      piece(net, 'torus', '#fcdb8f', 0, 0, 0, .32, .40, .32);
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        beam(net, '#d8b387', [.32 * Math.cos(a), .40 * Math.sin(a), 0],
          [.145 * Math.sin(a), -.19 + .10 * Math.cos(a), .37], .012);
      }
      piece(net, 'torus', '#d8b387', 0, -.105, .245, .23, .24, .055);
    }
    return arm;
  });
  return { root, ribs, arms, legs };
}

export function poseFarmer(farmer, run, phase) {
  const stride = phase * 11;
  const offset = run.camera === 'near' ? 1.93 : run.camera === 'chase' ? 2.13 : 1.75;
  farmer.root.position.set(run.x + offset + .22 * Math.sin(phase * 1.62), .06 + .05 * Math.sin(stride * 2), -run.distance + run.gap);
  farmer.ribs.rotation.x = -.22;
  farmer.ribs.rotation.z = Math.sin(stride) * .10;
  farmer.legs.forEach(({ hip, shin }, i) => {
    const swing = Math.sin(stride + i * Math.PI);
    hip.rotation.x = swing * .77;
    shin.rotation.x = -.19 - Math.max(0, swing) * .65;
    farmer.arms[i].rotation.x = (i ? -.32 : -.52) - swing * .57;
  });
}

export function pumpkin(parent, x, y, z, radius, variant = 0) {
  const root = group(parent, x, y, z);
  root.scale.setScalar(radius);
  const colors = variant ? ['#e87929', '#ee9137'] : ['#e76728', '#f18428'];
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    ball(root, colors[i % 2], .28 * Math.sin(a), .49, .28 * Math.cos(a), .37, .47, .37);
  }
  beam(root, '#637240', [0, .83, 0], [.13, 1.14, .03], .084);
  return root;
}

const glowing = paint('#ff873d', { emissive: '#ff5820', emissiveIntensity: 1.35 });
const steel = paint('#d9e9ed', { metalness: .62, roughness: .23 });
const brightSteel = paint('#fff3d3', { metalness: .28, roughness: .26 });

export function makeObstacle(parent, item) {
  const root = group(parent, item.x, item.y ?? 0, -item.distance);
  if (item.kind === 'oven') {
    box(root, '#242430', 0, .62, 0, 1.67, 1.04, 1.20);
    box(root, '#575351', 0, 1.128, 0, 1.77, .113, 1.27);
    box(root, '#7c4a41', 0, 1.00, .622, 1.58, .18, .07);
    for (const x of [-.56, -.28, 0, .28, .56]) ball(root, '#efcc94', x, 1.005, .689, .063, .063, .042);
    for (const side of [-1, 1]) {
      box(root, '#383038', side * .67, .105, 0, .185, .21, .99);
      for (const z of [-.33, .27]) {
        const ring = piece(root, 'torus', '#201e29', side * .40, 1.194, z, .225, .225, .225);
        ring.rotation.x = -Math.PI / 2;
      }
    }
    for (const face of [-1, 1]) {
      box(root, '#bc6343', 0, .53, face * .606, 1.38, .69, .066);
      box(root, '#64342e', 0, .54, face * .65, 1.20, .54, .061);
      box(root, glowing, 0, .532, face * .69, 1.07, .34, .036);
      for (const y of [.43, .52, .61]) box(root, '#632e32', 0, y, face * .718, 1.10, .019, .018);
      beam(root, '#ffcc8b', [-.55, .827, face * .728], [.55, .827, face * .728], .049);
    }
  } else if (item.kind === 'knife') {
    for (const x of [-1.07, 1.07]) {
      box(root, '#be833e', x, .33, 0, .43, .66, .64);
      for (const y of [.19, .51]) box(root, '#ecc372', x, y, .324, .46, .052, .021);
      box(root, '#603c3a', x, 1.56, 0, .156, 2.22, .18);
      box(root, '#d79357', x, 2.66, 0, .241, .18, .22);
    }
    box(root, '#71463d', 0, 2.46, 0, 2.28, .24, .24);
    const swing = group(root, 0, 2.35, 0);
    root.userData.swing = swing;
    for (const x of [-.64, 0, .64]) {
      const knife = group(swing, x, 0, 0);
      knife.rotation.z = x * .21;
      box(knife, '#3a2b36', 0, -.11, 0, .12, .28, .14);
      for (const y of [-.07, -.17]) ball(knife, '#eac379', 0, y, .078, .026, .026, .016);
      const outline = new T.Shape();
      outline.moveTo(-.105, -.24); outline.lineTo(.15, -.235); outline.lineTo(.20, -.37);
      outline.quadraticCurveTo(.12, -.75, -.24, -.90); outline.lineTo(-.14, -.65); outline.closePath();
      const blade = new T.ExtrudeGeometry(outline, { depth: .038, bevelEnabled: true,
        bevelSegments: 1, bevelSize: .016, bevelThickness: .014, curveSegments: 4 });
      piece(knife, blade, steel, 0, 0, -.018, 1, 1, 1);
      beam(knife, brightSteel, [-.237, -.887, .028], [.122, -.647, .028], .017);
    }
  } else if (item.kind === 'fence') {
    for (const x of [-.94, .94]) {
      box(root, '#774838', x, .52, 0, .17, 1.045, .23);
      piece(root, 'cone', '#dc9557', x, 1.064, 0, .13, .16, .15);
    }
    for (const y of [.29, .66]) box(root, '#c37c50', 0, y, .05, 1.95, .18, .16);
    beam(root, '#e5a765', [-.72, .26, .139], [.76, .75, .139], .105, true);
    box(root, '#f7c482', 0, .67, .144, .45, .139, .018);
  } else if (item.kind === 'crate') {
    box(root, '#926044', 0, .27, 0, 1.74, .52, .85);
    for (const face of [-1, 1]) {
      for (const y of [.16, .405]) box(root, '#d19150', 0, y, face * .449, 1.78, .16, .058);
      for (const x of [-.73, .73]) box(root, '#f1b775', x, .29, face * .494, .15, .54, .057);
    }
    for (let i = -1; i <= 1; i++) pumpkin(root, i * .48, .44, 0, i === 0 ? .39 : .35);
  } else if (item.kind === 'corn') {
    const cob = group(root);
    cob.rotation.z = -.29;
    ball(cob, paint('#ffbe32', { emissive: '#f69e21', emissiveIntensity: .26 }), 0, 0, 0, .166, .322, .164);
    for (let y = 0; y < 5; y++) {
      for (let j = 0; j < 7; j++) {
        const a = (j + y * .47) * Math.PI * 2 / 7;
        const r = .152 - Math.abs(y - 2) * .013;
        ball(cob, j % 3 ? '#ffcf45' : '#ffe18f', Math.cos(a) * r, (y - 2) * .101, Math.sin(a) * r, .051, .061, .051);
      }
    }
    ball(cob, '#8e993f', .097, -.155, .025, .086, .225, .099).rotation.z = -.49;
    ball(cob, '#b2aa47', -.106, -.178, .036, .068, .194, .089).rotation.z = .44;
  }
  return root;
}
