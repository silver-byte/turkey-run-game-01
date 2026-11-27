import * as T from '../vendor/three.module.min.js';
import { FINISH, PALETTE, ROAD_EDGE } from './config.js';
import { ball, group, paint } from './mesh.js';
import { buildProp, makeCaughtPot } from './scenery.js';
import { makeFarmer, makeObstacle, makeTurkey, poseFarmer, poseTurkey } from './turkey.js';
import { randomStream } from './world.js';

const SUN = new T.Vector3(-.53, .25, -.81).normalize();
const v = (x, y, z) => new T.Vector3(x, y, z);

function makeSky(scene) {
  const sky = new T.Mesh(new T.SphereGeometry(240, 48, 28), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, uniforms: { sun: { value: SUN } },
    vertexShader: `varying vec3 ray;
      void main(){ ray = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `varying vec3 ray; uniform vec3 sun;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(157.3,63.8)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y); }
      void main(){
        vec3 d=normalize(ray); float h=max(d.y,0.); float a=max(dot(d,sun),0.);
        vec3 c=mix(vec3(1.,.49,.24), vec3(.28,.39,.56), smoothstep(-.025,.60,h));
        c=mix(c, vec3(.89,.40,.29), exp(-pow((h-.135)*9.,2.))*.44);
        c+=vec3(.80,.37,.10)*pow(a,9.)+vec3(.85,.52,.20)*pow(a,80.);
        c+=vec3(3.0,1.94,.88)*smoothstep(.99942,.99962,a);
        vec2 uv=vec2(d.x/(.27+h),d.z/(.27+h))*1.35;
        float wisps=noise(uv*vec2(2.,7.))+noise(uv*vec2(5.,25.))*.23;
        float veil=smoothstep(.63,.77,wisps)*smoothstep(.02,.13,h)*(.79-.5*h);
        c=mix(c,vec3(.84,.47,.42)+vec3(.46,.28,.09)*pow(a,4.),veil);
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  sky.renderOrder = -10;
  scene.add(sky);
  return sky;
}

function groundColor(color, contrast, stretch) {
  const material = paint(color, { roughness: 1 });
  material.onBeforeCompile = shader => {
    shader.vertexShader = `varying vec3 groundPoint;\n${shader.vertexShader}`.replace('#include <begin_vertex>',
      '#include <begin_vertex>\ngroundPoint = (modelMatrix * vec4(position, 1.)).xyz;');
    shader.fragmentShader = `varying vec3 groundPoint;
      float bob(vec2 p){return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453);}
      float grain(vec2 p){vec2 x=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(bob(x),bob(x+vec2(1.,0.)),f.x),mix(bob(x+vec2(0.,1.)),bob(x+1.),f.x),f.y);}
      ${shader.fragmentShader}`.replace('#include <color_fragment>', `#include <color_fragment>
      vec2 mark=groundPoint.xz*vec2(${stretch.toFixed(3)},.55);
      float detail=grain(mark*3.)*.48+grain(mark*.61)*.40+grain(mark*16.)*.12;
      diffuseColor.rgb *= 1.+(detail-.50)*${contrast.toFixed(3)};`);
  };
  material.customProgramCacheKey = () => `${color}/${contrast}/${stretch}`;
  return material;
}

function ribbon(scene, low, high, height, material) {
  const positions = [], indices = [];
  for (let i = 0; i < 201; i++) {
    const z = 48 - i * 3.5;
    const weave = .075 * Math.sin(z * .38) + .10 * Math.sin(z * .14);
    positions.push(low + weave, height, z, high + weave, height, z);
    if (i) { const j = i * 2; indices.push(j - 2, j - 1, j, j - 1, j + 1, j); }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices); geo.computeVertexNormals();
  const mesh = new T.Mesh(geo, material);
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function makeTerrain(scene, seed) {
  ribbon(scene, -235, 235, -.083, groundColor('#a3984b', 1.55, .6));
  ribbon(scene, -ROAD_EDGE - .48, ROAD_EDGE + .48, -.059, groundColor('#ba884f', 1.28, .88));
  ribbon(scene, -ROAD_EDGE, ROAD_EDGE, -.045, groundColor(PALETTE.road, 1.06, 1.65));
  for (const x of [-3.6, -.96, 1.73, 3.70]) ribbon(scene, x - .20, x + .20, -.037, groundColor('#b5724d', .97, 1.7));
  const random = randomStream(seed ^ 9928);
  const stoneGeo = new T.IcosahedronGeometry(1);
  const colors = ['#e3a66c', '#9d6147', '#b98252', '#dd9959'];
  for (const color of colors) {
    const rocks = new T.InstancedMesh(stoneGeo, paint(color), 465);
    const dummy = new T.Object3D();
    for (let i = 0; i < rocks.count; i++) {
      const x = (random() - .5) * 10.46;
      const size = .026 + random() ** 3 * .15;
      dummy.position.set(x, -.033 + size * .14, 26 - random() * 598);
      dummy.rotation.set(random(), random() * 6, random());
      dummy.scale.set(size * 1.4, size * .38, size * .74);
      dummy.updateMatrix(); rocks.setMatrixAt(i, dummy.matrix);
    }
    rocks.receiveShadow = true;
    scene.add(rocks);
  }
  const hills = group(scene);
  for (let d = -38; d < 705; d += 32) {
    for (const side of [-1, 1]) {
      const x = (25 + random() * 30) * side;
      const hill = ball(hills, ['#ad9a54', '#b79852', '#9c8d54', '#aba15a'][Math.floor(random() * 4)],
        x, -4.7, -d, 10 + random() * 15, 4.9 + random() * 3.6, 16 + random() * 21);
      hill.castShadow = false;
    }
  }
  return hills;
}

function distantRanges(scene) {
  const root = group(scene);
  const random = randomStream(94531);
  const styles = [
    { depth: 162, colors: ['#ba8888', '#c89b98', '#b1848a'], scale: 1.3 },
    { depth: 114, colors: ['#a87878', '#ab817d', '#a37270'], scale: 1 },
  ];
  for (const { depth, colors, scale } of styles) {
    const count = 30;
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2;
      const z = Math.cos(angle) * depth, x = Math.sin(angle) * depth;
      const height = (6 + random() * 18) * scale, width = (12 + random() * 12) * scale;
      const outline = [x - width, -3, z + 8, x - width * .42, height * .52, z + 3,
        x + width * .12, height, z - 7, x + width * .58, height * .57, z + 2, x + width, -3, z + 8,
        x - width * .025, height * .32, z + 9, x + width * .21, -3, z + 13];
      const facets = [[0, 5, 1, 1, 5, 2, 0, 6, 5], [2, 5, 3, 3, 5, 6], [3, 6, 4]];
      for (let f = 0; f < facets.length; f++) {
        const geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(outline, 3));
        geo.setIndex(facets[f]); geo.computeVertexNormals();
        const mat = new T.MeshBasicMaterial({ color: colors[(i + f) % colors.length], side: T.DoubleSide, fog: false });
        root.add(new T.Mesh(geo, mat));
      }
    }
  }
  return root;
}

function batchByMaterial(parent, roots) {
  const batches = new Map();
  for (const root of roots) {
    root.updateMatrixWorld(true);
    root.traverse(mesh => {
      if (!mesh.isMesh) return;
      const id = `${mesh.geometry.id}:${mesh.material.id}:${Number(mesh.castShadow)}`;
      if (!batches.has(id)) batches.set(id, { mesh, matrices: [] });
      batches.get(id).matrices.push(mesh.matrixWorld.clone());
    });
  }
  for (const { mesh, matrices } of batches.values()) {
    const batch = new T.InstancedMesh(mesh.geometry, mesh.material, matrices.length);
    matrices.forEach((matrix, i) => batch.setMatrixAt(i, matrix));
    batch.castShadow = mesh.castShadow;
    batch.receiveShadow = mesh.receiveShadow;
    parent.add(batch);
  }
}

function installScenery(scene, props) {
  const sources = new Map();
  const regions = new Map();
  for (const prop of props) {
    const key = `${prop.kind}/${prop.variant}`;
    if (!sources.has(key)) sources.set(key, buildProp(prop));
    const clone = sources.get(key).clone(true);
    clone.position.set(prop.x, 0, -prop.distance);
    clone.scale.setScalar(prop.scale);
    if (prop.kind === 'tree') clone.rotation.y = prop.distance * .723 + prop.x;
    const block = Math.floor(prop.distance / 29);
    if (!regions.has(block)) regions.set(block, []);
    regions.get(block).push(clone);
  }
  return [...regions].map(([block, roots]) => {
    const tile = group(scene);
    batchByMaterial(tile, roots);
    return { tile, start: block * 29, end: (block + 1) * 29 };
  });
}

function compactActor(actor) {
  for (const node of [...actor.children]) {
    if (!node.isMesh) continue;
    actor.remove(node);
    const bin = actor.userData.staticParts ??= [];
    bin.push(node);
  }
  if (actor.userData.staticParts) {
    batchByMaterial(actor, actor.userData.staticParts);
    delete actor.userData.staticParts;
  }
  for (const node of actor.children) if (node.isGroup) compactActor(node);
}

function setCamera(camera, run, elapsed, follow) {
  const d = run.distance, x = run.x;
  let pos, target, fov = 49;
  if (run.mode === 'title') {
    pos = v(4.75, 2.84, -5.43 - d); target = v(1.47, 1.91, 1.74 - d); fov = 39;
  } else if (run.mode === 'escaped') {
    pos = v(4.93, 2.98, -9.58 - d); target = v(1.09, 2.64, -.83 - d); fov = 46;
  } else if (run.mode === 'caught') {
    pos = v(4.48, 2.85, -5.72 - d); target = v(1.38, 1.99, 1.43 - d); fov = 43;
  } else if (run.camera === 'near') {
    pos = v(x + 5.7, 4.03, 5.8 - d); target = v(x - .15, 1.98, -5.4 - d); fov = 52;
  } else if (run.camera === 'chase') {
    pos = v(x + 5.4, 3.77, 7.42 - d); target = v(x + .05, 1.55, -5.7 - d); fov = 50;
  } else {
    const slide = run.slide > 0 ? .26 : 0;
    pos = v(follow + 3.56, 3.77 - slide + run.y * .21, 8.2 + run.gap * .36 - d);
    target = v(follow * .57 + .06, 1.54 + run.y * .17, -8.1 - d);
    if (run.stumble) pos.y += Math.sin(elapsed * 52) * run.stumble * .15;
  }
  camera.position.copy(pos); camera.lookAt(target);
  if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
}

export function createFarmView(canvas, course, scenery, seed) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.19;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.fog = new T.FogExp2(PALETTE.fog, .0151);
  const camera = new T.PerspectiveCamera(49, 1, .08, 247);
  const sky = makeSky(scene);
  const backdrop = distantRanges(scene);
  const hills = makeTerrain(scene, seed);
  const regions = installScenery(scene, scenery);
  scene.add(new T.HemisphereLight('#ffe6cc', '#a76f63', 2.17));
  const key = new T.DirectionalLight('#ffd295', 3.05);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: .5, far: 57 });
  key.shadow.normalBias = .028;
  key.shadow.bias = -.0002;
  key.shadow.intensity = .78;
  scene.add(key, key.target);
  const fill = new T.DirectionalLight('#dfb5dc', .52);
  fill.position.set(6, 4, 8); scene.add(fill);

  const turkey = makeTurkey(scene);
  const farmer = makeFarmer(scene);
  const pot = makeCaughtPot(scene);
  const objects = course.map(item => {
    const model = makeObstacle(scene, item);
    const swing = model.userData.swing;
    compactActor(model);
    return { item, model, swing };
  });
  compactActor(turkey.root);
  compactActor(farmer.root);
  let follow = 0, width = 0, height = 0;
  function fit() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    if (w === width && h === height) return;
    width = w; height = h;
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  function draw(run, elapsed, dt = 0) {
    fit();
    const d = run.distance;
    const chase = run.mode === 'play';
    follow = dt && chase ? T.MathUtils.damp(follow, run.x, 7, dt) : run.x;
    setCamera(camera, run, elapsed, follow);
    sky.position.copy(camera.position);
    backdrop.position.z = -d;
    key.target.position.set(0, 0, -d - (chase ? 4 : 0));
    key.position.copy(key.target.position).add(v(-17, 23, -13));
    for (const { tile, start, end } of regions) tile.visible = end > d - (chase ? 24 : 91) && start < d + 105;
    hills.children.forEach(hill => { hill.visible = Math.abs(d + hill.position.z) < 160; });
    for (const { item, model, swing } of objects) {
      const delta = item.distance - d;
      model.visible = chase && delta > -7 && delta < 75 && (item.kind !== 'corn' || !run.seen.has(item));
      if (!model.visible) continue;
      if (item.kind === 'corn') {
        model.rotation.y = elapsed * 2.5 + delta * .29;
        model.position.y = item.y + Math.sin(elapsed * 4.8 + item.distance) * .10;
      }
      if (swing) swing.rotation.x = Math.sin(elapsed * 4.3 + item.distance * .35) * .51;
    }
    poseTurkey(turkey, chase ? run : { ...run, x: .33, slide: 0,
      distance: d + (run.mode === 'escaped' ? 2.25 : 0), y: run.mode === 'caught' ? .81 : 0 }, elapsed, !chase);
    turkey.root.rotation.y = chase ? -.24 : run.mode === 'escaped' ? -1.04 : -.52;
    if (run.mode === 'caught') turkey.rig.scale.setScalar(.79);
    farmer.root.visible = chase;
    if (chase) poseFarmer(farmer, run, elapsed);
    pot.visible = run.mode === 'caught';
    pot.position.set(.33, 0, -d + .035);
    renderer.render(scene, camera);
  }
  return { draw };
}
