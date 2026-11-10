import * as T from 'three';

export function waterHeight(x, z, seconds) {
  return Math.sin(x * 0.55 + z * 0.31 - seconds * 1.15) * 0.075
    + Math.sin(z * 0.91 - x * 0.27 + seconds * 0.72) * 0.045;
}

export function buildSea(scene) {
  const uniforms = {
    time: { value: 0 }, beacon: { value: new T.Vector3(6.2, 6.6, -5.3) },
    direction: { value: new T.Vector2(-1, 1).normalize() }, strength: { value: 1 },
    boat: { value: new T.Vector2(-7, 9) }
  };
  const surface = new T.ShaderMaterial({
    uniforms,
    vertexShader: `
      uniform float time;
      varying vec3 world;
      void main() {
        vec3 p = position;
        p.y += sin(p.x*.55+p.z*.31-time*1.15)*.075
             + sin(p.z*.91-p.x*.27+time*.72)*.045;
        world = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 beacon;
      uniform vec2 direction;
      uniform float strength;
      uniform vec2 boat;
      varying vec3 world;
      float hash(vec2 p) {return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p) {
        vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
          mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
      }
      float ring(vec2 center,float radius) {
        float distance = length(world.xz-center);
        float edge = distance-radius;
        return exp(-abs(edge)*4.) * (.5+.5*sin(edge*22.-time*2.));
      }
      void main() {
        vec2 p = world.xz;
        float s1=cos(p.x*.55+p.y*.31-time*1.15);
        float s2=cos(p.y*.91-p.x*.27+time*.72);
        float fine=sin(p.x*6.3+p.y*3.8+time*1.4)*sin(p.y*5.-time*.8);
        float grain=noise(p*2.+vec2(time*.1,-time*.14));
        float swell=noise(p*.45+vec2(time*.045,0.));
        vec3 normal=normalize(vec3(-s1*.041+s2*.012,1.,-s1*.023-s2*.041+fine*.025));
        vec3 view=normalize(cameraPosition-world);
        float fresnel=pow(1.-max(dot(normal,view),0.),3.);
        vec3 color=mix(vec3(.015,.067,.087),vec3(.06,.19,.22),.45+s1*.08+s2*.06+swell*.20);
        color+=vec3(.12,.21,.25)*fresnel*.6;
        vec3 light=normalize(vec3(-10.,20.,8.));
        float spec=pow(max(dot(reflect(-light,normal),view),0.),85.);
        color+=vec3(.33,.59,.65)*spec*(.20+grain*.6);
        vec2 delta=p-beacon.xz;
        float distance=length(delta);
        float angle=dot(normalize(delta),direction);
        float beam=smoothstep(.96,.995,angle)*exp(-distance*.044)*strength;
        float ripples=pow(grain,3.) * (.35+.65*pow(.5+.5*sin(p.y*13.+p.x*5.+s1*2.-time*1.8),3.));
        color+=vec3(.56,.29,.09)*beam*ripples*.24;
        float reflection=exp(-pow((p.x-beacon.x)/(.23+max(0.,p.y-beacon.z)*.085),2.));
        reflection*=step(beacon.z,p.y)*exp(-abs(p.y-beacon.z)*.16);
        color+=vec3(.71,.36,.13)*reflection*ripples*1.4*strength;
        float contact=exp(-length(p-boat)*2.7);
        color*=1.-contact*.37;
        float foam=ring(vec2(-1.5,1.),1.8)+ring(vec2(7.,2.5),2.)
          +ring(vec2(6.,-7.2),3.9)+ring(vec2(-3.,-1.3),1.3);
        color+=vec3(.25,.43,.43)*foam*.32;
        float far=1.-exp(-length(p)*.013);
        color=mix(color,vec3(.036,.09,.12),far*.60);
        gl_FragColor=vec4(color*.48,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  });
  const geometry = new T.PlaneGeometry(400, 400, 180, 180);
  geometry.rotateX(-Math.PI / 2);
  const water = new T.Mesh(geometry, surface);
  water.receiveShadow = true;
  scene.add(water);
  return { uniforms };
}

export function buildWake(scene, routeAt) {
  const count = 90;
  const objects = [];
  for (const side of [-1, 1]) {
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 2 * 3), 3));
    geometry.setAttribute('color', new T.BufferAttribute(new Float32Array(count * 2 * 3), 3));
    const indices = [];
    for (let i = 0; i < count - 1; i++) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    geometry.setIndex(indices);
    const surface = new T.MeshBasicMaterial({ vertexColors: true, side: T.DoubleSide,
      transparent: true, opacity: .28, depthWrite: false, blending: T.AdditiveBlending });
    const wake = new T.Mesh(geometry, surface);
    scene.add(wake);
    objects.push({ geometry, side, surface });
  }
  return seconds => {
    for (const { geometry, side, surface } of objects) {
      const vertices = geometry.attributes.position;
      const colors = geometry.attributes.color;
      for (let i = 0; i < count; i++) {
        const age = i / (count - 1) * 3.3;
        const p = routeAt(Math.max(0, seconds - age));
        const before = routeAt(Math.max(0, seconds - age - .08));
        const next = routeAt(Math.min(24, seconds - age + .08));
        const tangent = next.clone().sub(before).normalize();
        const outward = new T.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(side);
        const origin = p.clone().addScaledVector(tangent, -1.1);
        const spread = .5 + age * .29;
        const life = Math.max(0, 1 - age / 3.3) * Math.min(1, Math.max(0, seconds - age) * 2);
        for (let edge = 0; edge < 2; edge++) {
          const spot = origin.clone().addScaledVector(outward, spread + edge * (.04 + age * .015));
          const vertex = i * 2 + edge;
          vertices.setXYZ(vertex, spot.x, waterHeight(spot.x, spot.z, seconds) + .025, spot.z);
          const brightness = life * (edge ? .06 : .40);
          colors.setXYZ(vertex, brightness * .51, brightness * .80, brightness * .81);
        }
      }
      vertices.needsUpdate = true;
      colors.needsUpdate = true;
      geometry.computeBoundingSphere();
      surface.opacity = seconds < 1 ? seconds * .42 : Math.max(.06, .42 - Math.max(0, seconds - 20) * .09);
    }
  };
}
