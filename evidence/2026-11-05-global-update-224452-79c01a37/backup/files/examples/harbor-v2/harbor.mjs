import * as T from 'three';
import { glowTexture, smooth } from './forms.mjs';
import { buildVessel } from './vessel.mjs';
import { buildCoast } from './coast.mjs';
import { buildSea, buildWake, waterHeight } from './sea.mjs';

const route = new T.CatmullRomCurve3([
  new T.Vector3(-8, 0, 10), new T.Vector3(-5, 0, 6),
  new T.Vector3(0.8, 0, 3.9), new T.Vector3(2.8, 0, -0.3),
  new T.Vector3(1.4, 0, -4.3), new T.Vector3(0.3, 0, -8.7)
], false, 'catmullrom', .35);

export function routeAt(seconds) {
  const u = T.MathUtils.clamp((seconds - 19) / 4, 0, 1);
  const progress = seconds <= 19 ? seconds / 24 : 19 / 24 + 5 / 24 * (-1.2 * u * u * u + 1.4 * u * u + .8 * u);
  return route.getPointAt(Math.min(1, Math.max(0, progress)));
}

export function prepare(api) {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setSize(api.pixelWidth, api.pixelHeight, false);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color('#0d2435');
  scene.fog = new T.FogExp2('#183541', .016);
  const sky = new T.Mesh(new T.SphereGeometry(190, 32, 16), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 p; void main(){p=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `varying vec3 p; void main(){
      float h=normalize(p).y;
      vec3 color=mix(vec3(.15,.25,.28),vec3(.018,.045,.09),smoothstep(-.03,.5,h));
      gl_FragColor=vec4(color,1.);
      #include <colorspace_fragment>
    }`
  }));
  scene.add(sky);
  const camera = new T.PerspectiveCamera(40, api.width / api.height, .1, 220);
  const texture = glowTexture();
  const vessel = buildVessel(texture);
  scene.add(vessel.root);
  const coast = buildCoast(scene, texture);
  const sea = buildSea(scene);
  const updateWake = buildWake(scene, routeAt);
  scene.add(new T.HemisphereLight('#a8d1d8', '#132a35', 1.25));
  const moon = new T.DirectionalLight('#a8d4dd', 2.5);
  moon.position.set(-12, 22, 10);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  Object.assign(moon.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: .5, far: 70 });
  moon.shadow.bias = -.001;
  moon.shadow.normalBias = .04;
  scene.add(moon);
  const fill = new T.DirectionalLight('#6faaa8', .6);
  fill.position.set(15, 8, -10);
  scene.add(fill);
  const lampPosition = new T.Vector3(6.2, 6.59, -5.3);
  const spotlight = new T.SpotLight('#ffc67c', 115, 40, .27, .8, 1.0);
  spotlight.position.copy(lampPosition);
  scene.add(spotlight, spotlight.target);
  const harborLight = new T.PointLight('#ffbd72', 20, 13, 1.4);
  harborLight.position.set(6.8, 4.0, -7);
  scene.add(harborLight);

  const coneGeometry = new T.ConeGeometry(4.5, 27, 48, 1, true);
  coneGeometry.translate(0, -13.5, 0);
  coneGeometry.rotateX(-Math.PI / 2);
  const beamMaterial = new T.ShaderMaterial({
    transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending,
    uniforms: { opacity: { value: .04 } },
    vertexShader: `varying float along; varying vec3 normalView; varying vec3 viewDirection;
      void main(){along=position.z/27.; vec4 p=modelViewMatrix*vec4(position,1.);
      normalView=normalize(normalMatrix*normal); viewDirection=normalize(-p.xyz);
      gl_Position=projectionMatrix*p;}`,
    fragmentShader: `uniform float opacity; varying float along; varying vec3 normalView; varying vec3 viewDirection;
      void main(){float rim=pow(1.-abs(dot(normalView,viewDirection)),2.);
      gl_FragColor=vec4(1.,.67,.29,opacity*pow(1.-clamp(along,0.,1.),1.8)*(.3+rim*.7));}`
  });
  const beam = new T.Mesh(coneGeometry, beamMaterial);
  beam.position.copy(lampPosition);
  scene.add(beam);

  const signalPosition = new T.Vector3();
  const windowPosition = new T.Vector3();
  const target = new T.Vector3();
  const forward = new T.Vector3();
  function state(frame) {
    const seconds = frame / api.fps;
    const location = routeAt(seconds);
    const past = routeAt(Math.max(0, seconds - .08));
    const future = routeAt(Math.min(22.99, seconds + .08));
    forward.subVectors(future, past);
    if (forward.lengthSq() < .000001) forward.copy(route.getTangentAt(1));
    forward.normalize();
    vessel.root.position.copy(location);
    vessel.root.position.y = waterHeight(location.x, location.z, seconds) + .06;
    vessel.root.rotation.set(
      .027 * Math.sin(seconds * 1.40),
      Math.atan2(-forward.x, -forward.z),
      .045 * Math.sin(seconds * 1.16 + .5)
    );
    const call = frame >= api.point('call') && frame < api.point('call') + 9;
    const answer = frame >= api.point('answer');
    vessel.lampSurface.emissiveIntensity = call ? 6 : 1.3;
    vessel.lampGlow.material.opacity = call ? 1 : .48;
    vessel.lampGlow.scale.setScalar(call ? 1.7 : .75);
    coast.windows.emissiveIntensity = answer ? 1.6 : .04;
    coast.dockLamp.material.emissiveIntensity = answer ? 5 : .03;
    coast.dockHalo.material.opacity = answer ? .85 : 0;
    harborLight.intensity = answer ? 40 : 16;
    const sweep = smooth(3, 10, seconds);
    const angle = T.MathUtils.lerp(-1.15, -2.28, sweep) + .12 * Math.sin(seconds * .5);
    target.set(lampPosition.x + Math.sin(angle) * 22, .1, lampPosition.z + Math.cos(angle) * 22);
    if (seconds > 10) target.lerp(new T.Vector3(location.x, .15, location.z), smooth(10, 13, seconds) * .78);
    spotlight.target.position.copy(target);
    coast.lamp.material.emissiveIntensity = 0.2 + 3.0 * smooth(2.5, 3.0, seconds);
    beam.lookAt(target);
    beamMaterial.uniforms.opacity.value = .05 * smooth(2.5, 3.2, seconds);
    sea.uniforms.time.value = seconds;
    sea.uniforms.boat.value.set(location.x, location.z);
    sea.uniforms.direction.value.set(target.x - lampPosition.x, target.z - lampPosition.z).normalize();
    sea.uniforms.strength.value = 1.2 * smooth(2.5, 3.2, seconds);
    coast.halo.material.opacity = smooth(2.5, 3.0, seconds) * (.8 + .15 * Math.cos(seconds * .5));
    spotlight.intensity = 145 * smooth(2.5, 3.2, seconds);
    for (const [index, buoy] of coast.buoys.entries()) {
      const lit = seconds > 5.5 + index * 1.6;
      buoy.root.position.y = waterHeight(buoy.root.position.x, buoy.root.position.z, seconds);
      buoy.root.rotation.z = Math.sin(seconds * 1.1 + index) * .06;
      buoy.bulb.material.emissiveIntensity = lit ? 2.5 : .05;
      buoy.gleam.material.opacity = lit ? .65 : .03;
    }
    updateWake(seconds);

    const reveal = smooth(4.2, 11.5, seconds);
    const home = smooth(17, 23, seconds);
    const closeCamera = location.clone().add(new T.Vector3(5.5, 4.5, 8.4));
    const wideCamera = new T.Vector3(16, 15, 20);
    const arrivalCamera = new T.Vector3(-5.6, 5.9, .4);
    const closeTarget = location.clone().add(new T.Vector3(.8, .55, -1.5));
    const wideTarget = new T.Vector3(2.2, 1.0, -2.1);
    const arrivalTarget = new T.Vector3(3.0, 1.25, -8.2);
    camera.position.copy(closeCamera).lerp(wideCamera, reveal).lerp(arrivalCamera, home);
    camera.lookAt(closeTarget.lerp(wideTarget, reveal).lerp(arrivalTarget, home));
    camera.fov = 38 + reveal * 5 - home * 3;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    scene.updateMatrixWorld(true);
    vessel.root.localToWorld(signalPosition.set(-.3, 2.26, -.3));
    signalPosition.project(camera);
    coast.dockLamp.getWorldPosition(windowPosition).project(camera);
    return {
      boat: location.toArray(), heading: vessel.root.rotation.y,
      lampScreen: [(signalPosition.x + 1) / 2, (1 - signalPosition.y) / 2],
      windowScreen: [(windowPosition.x + 1) / 2, (1 - windowPosition.y) / 2],
      shot: seconds < 4.2 ? 0 : seconds < 17 ? 1 : 2,
      call, answer
    };
  }
  return {
    evaluate: t => state(t.frame),
    draw(g) {
      renderer.render(scene, camera);
      g.drawImage(renderer.domElement, 0, 0, api.width, api.height);
      const vignette = g.createRadialGradient(api.width * .5, api.height * .45, api.height * .25,
        api.width * .5, api.height * .45, api.width * .64);
      vignette.addColorStop(0, '#02121b00');
      vignette.addColorStop(1, '#02121b55');
      g.fillStyle = vignette;
      g.fillRect(0, 0, api.width, api.height);
    }
  };
}
