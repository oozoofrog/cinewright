import * as T from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export function material(color, extra = {}) {
  return new T.MeshStandardMaterial({ color, roughness: 0.83, metalness: 0.04, ...extra });
}

export function mesh(parent, geometry, surface, position = [0, 0, 0]) {
  const object = new T.Mesh(geometry, surface);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

export function box(parent, size, surface, position) {
  const radius = Math.min(...size) * .12;
  return mesh(parent, new RoundedBoxGeometry(...size, 2, radius), surface, position);
}

export function cylinder(parent, top, bottom, length, surface, position, sides = 32) {
  return mesh(parent, new T.CylinderGeometry(top, bottom, length, sides), surface, position);
}

export function rod(parent, a, b, radius, surface) {
  const from = new T.Vector3(...a);
  const to = new T.Vector3(...b);
  const delta = to.clone().sub(from);
  const object = cylinder(parent, radius, radius, delta.length(), surface, from.clone().add(to).multiplyScalar(0.5).toArray(), 8);
  object.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
  return object;
}

export function line(parent, points, color, opacity = 1) {
  const geometry = new T.BufferGeometry().setFromPoints(points.map(p => new T.Vector3(...p)));
  const object = new T.Line(geometry, new T.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
  parent.add(object);
  return object;
}

export function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const g = canvas.getContext('2d');
  const gradient = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#fff6da');
  gradient.addColorStop(0.09, '#ffddaadd');
  gradient.addColorStop(0.30, '#ffbc6630');
  gradient.addColorStop(1, '#ffa64400');
  g.fillStyle = gradient;
  g.fillRect(0, 0, 128, 128);
  return new T.CanvasTexture(canvas);
}

export function glow(parent, texture, position, scale) {
  const object = new T.Sprite(new T.SpriteMaterial({
    map: texture, color: '#ffd6a0', transparent: true, depthWrite: false,
    blending: T.AdditiveBlending
  }));
  object.position.set(...position);
  object.scale.set(scale, scale, 1);
  parent.add(object);
  return object;
}

export const smooth = (a, b, x) => {
  const t = T.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function noise(seed) {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}
