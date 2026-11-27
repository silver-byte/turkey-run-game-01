import * as T from '../vendor/three.module.min.js';

const geometry = {
  ball: new T.SphereGeometry(1, 24, 16), box: new T.BoxGeometry(1, 1, 1),
  low: new T.IcosahedronGeometry(1, 1), gem: new T.IcosahedronGeometry(1),
  cylinder: new T.CylinderGeometry(1, 1, 1, 12), cone: new T.ConeGeometry(1, 1, 12),
  torus: new T.TorusGeometry(1, .105, 9, 24),
};
const materials = new Map();

export function paint(color, settings = null) {
  if (settings) return new T.MeshStandardMaterial({ color, roughness: .72, ...settings });
  if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, roughness: .73 }));
  return materials.get(color);
}

export function piece(parent, shape, color, x, y, z, sx, sy, sz) {
  const mesh = new T.Mesh(geometry[shape] || shape, typeof color === 'string' ? paint(color) : color);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export const ball = (p, c, x, y, z, sx, sy, sz) => piece(p, 'ball', c, x, y, z, sx, sy, sz);
export const box = (p, c, x, y, z, sx, sy, sz) => piece(p, 'box', c, x, y, z, sx, sy, sz);
export function group(parent, x = 0, y = 0, z = 0) {
  const node = new T.Group();
  node.position.set(x, y, z);
  parent?.add(node);
  return node;
}

export function beam(parent, color, start, end, radius, square = false) {
  const a = new T.Vector3(...start), b = new T.Vector3(...end);
  const direction = b.clone().sub(a), middle = a.addScaledVector(direction, .5);
  const mesh = piece(parent, square ? 'box' : 'cylinder', color,
    middle.x, middle.y, middle.z, radius, direction.length(), radius);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}
