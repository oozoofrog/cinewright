import * as T from 'three';
import { material, mesh, box, cylinder, rod, glow } from './forms.mjs';

function hullGeometry() {
  const stations = [
    [-1.9, 0.015], [-1.62, 0.42], [-1.10, 0.65], [-0.35, 0.73],
    [0.55, 0.69], [1.24, 0.54], [1.48, 0.37]
  ];
  const ring = [[-1, 0.42], [-0.94, 0.13], [-0.62, -0.21], [0, -0.33],
    [0.62, -0.21], [0.94, 0.13], [1, 0.42]];
  const vertices = [];
  const colors = [];
  const index = [];
  const red = new T.Color('#a64739');
  const green = new T.Color('#194c50');
  for (const [z, width] of stations) {
    for (const [x, y] of ring) {
      vertices.push(x * width, y, z);
      const color = y < 0.12 ? red : green;
      colors.push(color.r, color.g, color.b);
    }
  }
  for (let s = 0; s < stations.length - 1; s++) {
    for (let j = 0; j < ring.length - 1; j++) {
      const a = s * ring.length + j;
      const b = a + ring.length;
      index.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export function buildVessel(texture) {
  const root = new T.Group();
  const trim = material('#e5cc96');
  const ivory = material('#d7dac4');
  const teal = material('#174348');
  const dark = material('#13242d');
  const wood = material('#987558');
  const rope = material('#d4b98a');
  const glass = material('#a5c0b5', { emissive: '#eca84f', emissiveIntensity: 0.33, roughness: 0.26 });
  mesh(root, hullGeometry(), material('#ffffff', { vertexColors: true, side: T.DoubleSide }));
  const outline = [
    [0, -1.9], [0.42, -1.62], [0.65, -1.1], [0.73, -0.35],
    [0.69, 0.55], [0.54, 1.24], [0.37, 1.48],
    [-0.37, 1.48], [-0.54, 1.24], [-0.69, 0.55],
    [-0.73, -0.35], [-0.65, -1.1], [-0.42, -1.62]
  ];
  const shape = new T.Shape(outline.map(([x, z]) => new T.Vector2(x, -z)));
  const deck = mesh(root, new T.ShapeGeometry(shape), wood, [0, 0.42, 0]);
  deck.rotation.x = -Math.PI / 2;
  for (let i = 0; i < outline.length; i++) {
    const [x, z] = outline[i];
    const next = outline[(i + 1) % outline.length];
    rod(root, [x, 0.46, z], [next[0], 0.46, next[1]], 0.045, trim);
  }
  for (const side of [-1, 1]) {
    for (const z of [-1.15, -0.8, 0.85, 1.22]) {
      const x = side * (z > 1 ? 0.48 : 0.59);
      rod(root, [x, 0.46, z], [x, 0.84, z], 0.017, ivory);
    }
    rod(root, [side * 0.59, 0.84, 0.85], [side * 0.48, 0.84, 1.22], 0.019, ivory);
    rod(root, [side * 0.59, 0.84, -1.15], [side * 0.59, 0.84, -0.8], 0.019, ivory);
    for (const z of [-0.7, 0.8]) {
      const tire = mesh(root, new T.TorusGeometry(0.15, 0.047, 8, 20), dark, [side * 0.72, 0.24, z]);
      tire.rotation.y = Math.PI / 2;
      rod(root, [side * 0.68, 0.47, z], [side * 0.73, 0.32, z], 0.013, rope);
    }
  }
  box(root, [1.05, 0.88, 1.17], ivory, [0, 0.89, -0.02]);
  box(root, [1.21, 0.12, 1.33], teal, [0, 1.38, -0.02]);
  for (const x of [-0.28, 0.28]) {
    box(root, [0.42, 0.38, 0.018], glass, [x, 1.06, -0.615]);
  }
  for (const side of [-1, 1]) {
    box(root, [0.018, 0.37, 0.72], glass, [side * 0.535, 1.07, -0.13]);
    box(root, [0.022, 0.40, 0.033], ivory, [side * 0.55, 1.07, -0.15]);
  }
  box(root, [0.36, 0.60, 0.025], teal, [0.22, 0.77, 0.58]);
  box(root, [0.23, 0.25, 0.028], glass, [0.22, 0.94, 0.60]);
  cylinder(root, 0.105, 0.13, 0.54, dark, [0.26, 1.63, 0.22], 16);
  cylinder(root, 0.14, 0.14, 0.05, trim, [0.26, 1.91, 0.22], 16);
  rod(root, [-0.3, 1.43, -0.3], [-0.3, 2.25, -0.3], 0.025, ivory);
  rod(root, [-0.62, 1.94, -0.3], [0.05, 1.94, -0.3], 0.016, ivory);
  cylinder(root, 0.18, 0.18, 0.13, teal, [0, 0.52, -1.17], 24);
  cylinder(root, 0.04, 0.04, 0.28, trim, [0, 0.61, -1.17], 12);
  box(root, [0.67, 0.30, 0.43], wood, [0, 0.59, 0.98]);
  for (let i = 0; i < 4; i++) box(root, [0.69, 0.02, 0.018], trim, [0, 0.75, 0.81 + i * 0.11]);
  const lampSurface = material('#fff2ca', { emissive: '#ffb45e', emissiveIntensity: 1 });
  cylinder(root, 0.06, 0.06, 0.12, lampSurface, [-0.3, 2.25, -0.3], 16);
  const lampGlow = glow(root, texture, [-0.3, 2.26, -0.3], 0.8);
  const port = material('#932e22', { emissive: '#cf3620', emissiveIntensity: 0.7 });
  const starboard = material('#70bca3', { emissive: '#68b7a1', emissiveIntensity: 0.7 });
  mesh(root, new T.SphereGeometry(0.048, 10, 8), port, [-0.57, 1.44, -0.30]);
  mesh(root, new T.SphereGeometry(0.048, 10, 8), starboard, [0.57, 1.44, -0.30]);
  return { root, lampSurface, lampGlow };
}
