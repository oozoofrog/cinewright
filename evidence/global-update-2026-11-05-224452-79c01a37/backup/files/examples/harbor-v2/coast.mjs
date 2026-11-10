import * as T from 'three';
import { material, mesh, box, cylinder, rod, glow, noise } from './forms.mjs';

export function buildCoast(scene, texture) {
  const basalt = [material('#243a40'), material('#31494c'), material('#405a59'), material('#526564')];
  const chalk = material('#d9cfac');
  const brick = material('#a85c46');
  const metal = material('#233b41');
  const stone = material('#637878');
  const warm = material('#ffd28b', { emissive: '#ffab53', emissiveIntensity: 1 });
  const windows = material('#acb5a0', { emissive: '#ffb65b', emissiveIntensity: 0.02 });

  function rock(x, z, radius, h, seed) {
    const group = new T.Group();
    group.position.set(x, -0.18, z);
    group.rotation.y = noise(seed) * 6;
    scene.add(group);
    const geometry = new T.IcosahedronGeometry(1, 2);
    const attr = geometry.getAttribute('position');
    for (let i = 0; i < attr.count; i++) {
      const x = attr.getX(i), y = attr.getY(i), z = attr.getZ(i);
      const d = 1 + .11 * Math.sin(x * 4 + z * 3 + seed) + .07 * Math.cos(y * 6 - x * 3);
      attr.setXYZ(i, x * radius * d, (y + .55) * h * .64, z * radius * d);
    }
    geometry.computeVertexNormals();
    mesh(group, geometry, basalt[seed % basalt.length]);
    for (let crack = 0; crack < 2; crack++) {
      const slab = mesh(group, new T.DodecahedronGeometry(radius * .35, 0), basalt[(seed + crack + 1) % basalt.length],
        [radius * (.55 - crack), h * .2, radius * .25]);
      slab.scale.y = .45;
      slab.rotation.y = seed;
    }
    return group;
  }
  rock(6, -7.2, 4.2, 1.35, 3);
  rock(8.8, -4.8, 2.5, 1.9, 8);
  rock(9.8, -9.3, 3.3, 1.3, 11);
  rock(-1.5, 1.0, 2.0, 2.0, 5);
  rock(-3.0, -1.3, 1.5, 0.85, 12);
  rock(7.0, 2.5, 2.1, 2.6, 9);
  rock(9.2, 1.5, 1.4, 1.0, 16);
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2;
    rock(6 + Math.cos(a) * 4, -7.2 + Math.sin(a) * 3.6, 0.30 + noise(i) * 0.60, 0.3 + noise(i + 8) * 0.6, i);
  }

  const tower = new T.Group();
  tower.position.set(6.2, 1.08, -5.3);
  scene.add(tower);
  cylinder(tower, 0.91, 1.15, 0.35, stone, [0, 0.18, 0]);
  cylinder(tower, 0.56, 0.83, 4.60, chalk, [0, 2.60, 0], 48);
  cylinder(tower, 0.755, 0.796, 0.68, brick, [0, 1.92, 0], 48);
  cylinder(tower, 0.656, 0.694, 0.65, brick, [0, 3.55, 0], 48);
  cylinder(tower, 0.90, 0.88, 0.20, metal, [0, 4.88, 0]);
  cylinder(tower, 0.70, 0.70, 0.10, chalk, [0, 5.01, 0]);
  const glass = material('#b7ccb9', { transparent: true, opacity: 0.20, roughness: 0.2, depthWrite: false });
  cylinder(tower, 0.59, 0.59, 0.95, glass, [0, 5.53, 0], 24);
  cylinder(tower, 0.08, 0.85, 0.58, metal, [0, 6.28, 0]);
  cylinder(tower, 0.08, 0.08, 0.30, metal, [0, 6.65, 0], 16);
  cylinder(tower, 0.75, 0.75, 0.10, brick, [0, 5.99, 0]);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const x = Math.sin(a), z = Math.cos(a);
    rod(tower, [x * 0.82, 4.96, z * 0.82], [x * 0.82, 5.44, z * 0.82], 0.021, metal);
    if (i % 2 === 0) rod(tower, [x * 0.59, 5.02, z * 0.59], [x * 0.59, 6.0, z * 0.59], 0.023, metal);
  }
  for (const y of [5.25, 5.45]) {
    const ring = mesh(tower, new T.TorusGeometry(0.82, 0.021, 6, 64), metal, [0, y, 0]);
    ring.rotation.x = Math.PI / 2;
  }
  for (const y of [1.05, 2.87, 4.18]) {
    const front = .83 - (y - .3) / 4.6 * .27;
    box(tower, [0.28, 0.49, 0.10], metal, [0, y, front + .04]);
    box(tower, [0.19, 0.37, 0.012], windows, [0, y, front + .092]);
  }
  const lamp = mesh(tower, new T.SphereGeometry(0.20, 20, 12), warm, [0, 5.51, 0]);
  const halo = glow(tower, texture, [0, 5.51, 0], 2.9);

  const houseWindows = [];
  function house(x, z, turn) {
    const group = new T.Group();
    group.position.set(x, 1.5, z);
    group.rotation.y = turn;
    scene.add(group);
    box(group, [2.0, 1.55, 1.65], chalk, [0, 0.77, 0]);
    for (const side of [-1, 1]) {
      const roof = box(group, [2.35, 0.13, 1.28], brick, [0, 1.88, side * .52]);
      roof.rotation.x = side * .52;
    }
    box(group, [0.28, 0.70, 0.34], stone, [0.57, 2.0, 0]);
    for (const wx of [-0.56, 0.56]) {
      box(group, [0.42, 0.60, 0.025], metal, [wx, 0.90, 0.84]);
      houseWindows.push(box(group, [0.30, 0.46, 0.035], windows, [wx, 0.90, 0.86]));
      box(group, [0.035, 0.47, 0.04], chalk, [wx, 0.90, 0.88]);
    }
  }
  house(7.6, -8.3, -0.20);
  house(10.0, -7.8, -0.08);

  const pier = new T.Group();
  scene.add(pier);
  const wood = material('#796d5b');
  for (let i = 0; i < 16; i++) box(pier, [2.6, 0.10, 0.22], wood, [2.8, 0.73, -7.4 - i * 0.24]);
  for (const x of [1.65, 3.95]) {
    for (const z of [-7.6, -8.8, -10.8]) {
      cylinder(pier, 0.11, 0.15, 1.8, wood, [x, 0.18, z], 12);
      cylinder(pier, 0.17, 0.17, 0.10, metal, [x, 1.11, z], 16);
    }
  }
  const dockSignal = material('#6c6a56', { emissive: '#ffb565', emissiveIntensity: .03 });
  rod(pier, [1.65, 1.12, -7.6], [1.65, 1.95, -7.6], .03, metal);
  const dockLamp = mesh(pier, new T.SphereGeometry(.095, 16, 10), dockSignal, [1.65, 1.95, -7.6]);
  const dockHalo = glow(pier, texture, [1.65, 1.95, -7.6], 1.4);
  const buoys = [];
  for (const [x, z] of [[-4.6, 2.9], [3.7, 2.1], [-.6, -3.3]]) {
    const buoy = new T.Group();
    buoy.position.set(x, 0, z);
    scene.add(buoy);
    cylinder(buoy, 0.18, 0.40, 0.33, brick, [0, 0.15, 0], 16);
    rod(buoy, [0, 0.2, 0], [0, 1.1, 0], 0.045, metal);
    const bulb = mesh(buoy, new T.SphereGeometry(0.07, 10, 8), warm.clone(), [0, 1.1, 0]);
    const gleam = glow(buoy, texture, [0, 1.1, 0], 0.85);
    buoys.push({ root: buoy, bulb, gleam });
  }
  return { tower, lamp, halo, windows, buoys, houseWindows, dockLamp, dockHalo };
}
