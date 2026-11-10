import * as T from 'three';

export function prepare(api) {
  const { width, height, pixelWidth, pixelHeight, point } = api;
  const cut = point('return');
  const start = point('instrument');
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(pixelWidth, pixelHeight, false);
  renderer.setClearColor(0x000000, 0);
  const world = new T.Scene();
  const aspect = width / height;
  const camera = new T.OrthographicCamera(-2.65 * aspect, 2.65 * aspect, 2.65, -2.65, 0.1, 40);
  camera.position.set(0, 0, 9);
  camera.updateMatrixWorld();
  const instrument = new T.Group();
  instrument.position.set(0.78, -0.03, 0);
  world.add(instrument);
  const enamel = new T.MeshStandardMaterial({ color: '#087884', roughness: 0.43, metalness: 0.23 });
  const blue = new T.MeshStandardMaterial({ color: '#133442', roughness: 0.55, metalness: 0.29 });
  const brass = new T.MeshStandardMaterial({ color: '#d48a51', roughness: 0.39, metalness: 0.48 });
  const pearl = new T.MeshStandardMaterial({ color: '#ffe9b9', roughness: 0.36, emissive: '#6e4e23', emissiveIntensity: 0.8 });

  function add(geometry, material, x = 0, y = 0, z = 0, parent = instrument) {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  add(new T.TorusGeometry(1.05, 0.13, 12, 64), enamel);
  add(new T.TorusGeometry(1.19, 0.027, 8, 64), brass, 0, 0, 0.13);
  add(new T.TorusGeometry(0.83, 0.04, 8, 48), blue, 0, 0, -0.22);
  const bearing = add(new T.CylinderGeometry(0.29, 0.36, 0.35, 32), brass);
  bearing.rotation.x = Math.PI / 2;
  add(new T.SphereGeometry(0.125, 18, 12), pearl, 0, 0, 0.23);
  const arm = new T.Group();
  instrument.add(arm);
  add(new T.BoxGeometry(1.22, 0.17, 0.15), enamel, -0.43, 0, 0.20, arm);
  add(new T.BoxGeometry(0.89, 0.019, 0.019), brass, -0.44, 0.044, 0.285, arm);
  const tip = add(new T.SphereGeometry(0.105, 18, 12), pearl, -1.03, 0, 0.26, arm);
  add(new T.BoxGeometry(0.3, 0.24, 0.17), blue, 0.27, 0, 0.21, arm);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    add(new T.SphereGeometry(i % 3 ? 0.024 : 0.041, 8, 6), brass, Math.cos(angle) * 1.11, Math.sin(angle) * 1.11, 0.13);
  }
  world.add(new T.HemisphereLight('#d6fbff', '#6e2834', 2.25));
  const key = new T.DirectionalLight('#ffd8a3', 3.3);
  key.position.set(-3, 4, 5);
  const rim = new T.DirectionalLight('#59ccfa', 2.7);
  rim.position.set(2, -1, -4);
  world.add(key, rim);

  const projected = new T.Vector3();
  function project(object) {
    object.getWorldPosition(projected).project(camera);
    return [(projected.x / 2 + 0.5) * width, (0.5 - projected.y / 2) * height];
  }

  return {
    evaluate(t) {
      const f = Math.min(t.frame, cut - 1);
      const angle = t.read('steering', 'radian');
      const elapsed = (f - start) / api.fps;
      instrument.rotation.set(0.36 + 0.19 * Math.sin(elapsed * 0.65), -0.32 + 0.16 * Math.sin(elapsed * 0.93), 0.11);
      arm.rotation.z = angle;
      instrument.updateMatrixWorld(true);
      const pivot = project(bearing);
      const contact = project(tip);
      const dx = contact[0] - pivot[0];
      const dy = contact[1] - pivot[1];
      const length = Math.hypot(dx, dy);
      const direction = [dx / length, dy / length];
      t.write('projection', [pivot, contact, [contact[0] + direction[0] * 310, contact[1] + direction[1] * 310]]);
    },
    draw(g, t) {
      if (t.frame >= cut) return;
      renderer.render(world, camera);
      g.drawImage(renderer.domElement, 0, 0, width, height);
    },
  };
}
