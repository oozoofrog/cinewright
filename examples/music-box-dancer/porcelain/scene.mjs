import * as T from 'three';
import { poseSamples, study } from './choreography.mjs';

const tau = Math.PI*2;
export async function prepare(api, config={}) {
  const renderer = new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1); renderer.setSize(api.pixelWidth,api.pixelHeight,false);
  renderer.setClearColor('#102d31'); renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.debug.onShaderError=()=>{throw new Error('Porcelain shader compilation failed');};
  const world=new T.Scene(); world.fog=new T.Fog('#102d31',15,29);
  const camera=new T.PerspectiveCamera(31,api.width/api.height,.1,60);
  camera.position.set(4.4,3.65,8.8); camera.lookAt(.15,1.58,0);camera.zoom=1.06;camera.updateProjectionMatrix();
  const porcelain=new T.MeshPhysicalMaterial({color:'#f9e8d5',roughness:.27,metalness:.03,clearcoat:.65,clearcoatRoughness:.24});
  const blush=new T.MeshPhysicalMaterial({color:'#bc656b',roughness:.43,metalness:.12,clearcoat:.35,side:T.DoubleSide});
  const silk=new T.MeshStandardMaterial({color:'#e9afa3',roughness:.55,side:T.DoubleSide});
  const gold=new T.MeshStandardMaterial({color:'#c89c55',metalness:.72,roughness:.28});
  const darkgold=new T.MeshStandardMaterial({color:'#68462a',metalness:.65,roughness:.4});
  const enamel=new T.MeshPhysicalMaterial({color:'#194a4c',metalness:.25,roughness:.33,clearcoat:.8});
  const plum=new T.MeshStandardMaterial({color:'#491d2c',roughness:.56,metalness:.1});
  const hair=new T.MeshStandardMaterial({color:'#442b27',roughness:.48});
  const shadow=new T.MeshStandardMaterial({color:'#0d292b',roughness:.76});
  function mesh(geo,mat,parent,x=0,y=0,z=0) {
    const m=new T.Mesh(geo,mat); m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  const group=(parent,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  function ellipsoid(parent,mat,x,y,z,sx,sy,sz) {
    const m=mesh(new T.SphereGeometry(1,28,20),mat,parent,x,y,z);m.scale.set(sx,sy,sz);return m;
  }
  function rod(parent,a,b,r1,r2,mat) {
    const v1=new T.Vector3(...a),v2=new T.Vector3(...b),d=v2.clone().sub(v1);
    const m=mesh(new T.CylinderGeometry(r2,r1,d.length(),16),mat,parent);
    m.position.copy(v1.add(v2).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;
  }
  function ring(parent,r,t,y,mat) { const m=mesh(new T.TorusGeometry(r,t,10,128),mat,parent,0,y,0);m.rotation.x=Math.PI/2;return m; }
  function lathe(parent,profile,mat,y=0) {return mesh(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),64),mat,parent,0,y,0);}
  function curve(parent,points,r,mat) {return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,8,false),mat,parent);}
  world.add(new T.HemisphereLight('#c9e6e0','#614033',2.3));
  const light=new T.DirectionalLight('#ffdcc0',4.6);light.position.set(-3,7,4);light.castShadow=true;
  light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-5,right:5,top:6,bottom:-4,near:.5,far:20});light.shadow.bias=-.0003;light.shadow.normalBias=.018;world.add(light);
  const rim=new T.DirectionalLight('#80c7c2',2.2);rim.position.set(4,4,-3);world.add(rim);
  const fill=new T.PointLight('#eaa77c',14,12,2);fill.position.set(-1,3.4,3);world.add(fill);
  const floor=mesh(new T.PlaneGeometry(200,200),shadow,world,0,-.13,0);floor.rotation.x=-Math.PI/2;
  // A turned enamel jewellery case. Deep rim, fluted body, brass inlay and feet.
  const box=group(world,-.55,0,0);
  lathe(box,[[0,0],[1.70,0],[1.84,.08],[1.85,.18],[1.76,.24],[1.76,.48],[1.88,.53],[1.87,.60],[0,.60]],enamel);
  ring(box,1.81,.027,.10,gold);ring(box,1.82,.025,.50,gold);ring(box,1.86,.022,.58,gold);
  mesh(new T.CylinderGeometry(1.73,1.73,.045,96),plum,box,0,.63,0);
  for(let i=0;i<72;i++) {
    const a=i*tau/72;
    rod(box,[1.78*Math.cos(a),.23,1.78*Math.sin(a)],[1.78*Math.cos(a),.44,1.78*Math.sin(a)],.008,.008,i%3?darkgold:gold);
  }
  for(let i=0;i<3;i++){const a=i*tau/3+.5;ellipsoid(box,gold,1.35*Math.cos(a),-.035,1.35*Math.sin(a),.17,.10,.17);}
  // Upright pierced lid: actual recessed surfaces and petal-shaped filigree.
  const lid=group(box,0,1.91,-1.42);lid.rotation.x=.10;
  const back=mesh(new T.CylinderGeometry(1.66,1.66,.12,96),enamel,lid);back.rotation.x=Math.PI/2;
  const face=mesh(new T.CylinderGeometry(1.54,1.54,.025,96),plum,lid,0,0,.075);face.rotation.x=Math.PI/2;
  for(const r of [1.60,1.49,1.36]) mesh(new T.TorusGeometry(r,.014,8,128),gold,lid,0,0,.099);
  for(let i=0;i<24;i++) {
    const a=i*tau/24;
    const pts=Array.from({length:33},(_,j)=>{const p=j*tau/32,r=1.18+.17*Math.cos(p),b=a+.037*Math.sin(p);return [r*Math.cos(b),r*Math.sin(b),.11];});
    curve(lid,pts,.008,gold);
    ellipsoid(lid,gold,1.43*Math.cos(a),1.43*Math.sin(a),.11,.018,.018,.013);
  }
  // Turntable provides a firm visual and geometric supporting-foot contact.
  const platter=group(box,0,.68,.13);
  mesh(new T.CylinderGeometry(.91,.97,.095,96),gold,platter,0,.03,0);
  mesh(new T.CylinderGeometry(.89,.89,.035,96),porcelain,platter,0,.09,0);
  ring(platter,.82,.009,.112,gold);
  const dancer=group(platter,0,.115,0);dancer.name='dancer';
  const hips=group(dancer,.11,1.36,0);
  // Supporting toe remains at world-space (0,0,0) relative to dancer. Body turns about it.
  lathe(dancer,[[0,.045],[.025,.11],[.028,.24],[.049,.43],[.048,.57],[.039,.69],[.049,.82],[.072,1.08],[.08,1.27],[.06,1.36],[0,1.38]],porcelain);
  // Hip offset is a small weight transfer over the fixed supporting toe.

  ellipsoid(dancer,silk,0,.12,.015,.056,.15,.07);
  const freeHip=group(hips,-.20,0,0);freeHip.name='freeHip';
  ellipsoid(freeHip,porcelain,0,-.28,.01,.064,.32,.065);
  const knee=group(freeHip,0,-.60,.02);knee.name='freeKnee';
  ellipsoid(knee,porcelain,0,0,0,.049,.052,.049);
  ellipsoid(knee,porcelain,0,-.23,0,.042,.28,.045);rod(knee,[0,-.39,0],[0,-.58,0],.030,.024,porcelain);
  ellipsoid(knee,silk,0,-.62,.018,.032,.13,.045);
  const torso=group(hips);torso.name='torso';
  lathe(torso,[[.12,0],[.20,.07],[.15,.18],[.115,.32],[.15,.46],[.21,.59],[.23,.65],[.12,.69],[0,.69]],blush);
  ellipsoid(torso,porcelain,0,.666,0,.205,.085,.105);
  // Gold piping traces the bodice V, instead of a flat chest polygon.
  curve(torso,[[-.19,.64,.105],[-.13,.46,.13],[0,.24,.13],[.13,.46,.13],[.19,.64,.105]],.009,gold);
  rod(torso,[0,.68,0],[0,.84,0],.061,.050,porcelain);
  const head=group(torso,0,.99,0);head.rotation.z=-.11;
  ellipsoid(head,porcelain,0,0,0,.115,.151,.112);
  ellipsoid(head,hair,0,.061,-.030,.117,.105,.105);
  ellipsoid(head,hair,0,.04,-.137,.076,.071,.067);
  curve(head,[[-.109,.065,.018],[-.06,.12,.078],[0,.14,.09],[.06,.12,.078],[.109,.065,.018]],.012,gold);
  // Nose and chin are small sculptural planes; no painted source likeness.
  ellipsoid(head,porcelain,0,-.008,.108,.025,.029,.035);
  function arm(side,name) {
    const root=group(torso,side*.19,.63,0);root.name=name;
    const upper=ellipsoid(root,porcelain,0,-.185,0,.044,.205,.047);
    const elbow=group(root,0,-.37,0);elbow.name=name+'Elbow';
    ellipsoid(elbow,porcelain,0,0,0,.039,.046,.041);
    ellipsoid(elbow,porcelain,0,-.165,.008,.032,.18,.034);
    const hand=ellipsoid(elbow,porcelain,0,-.36,.023,.031,.065,.023);hand.rotation.z=-side*.25;
    return root;
  }
  arm(-1,'leftArm');arm(1,'rightArm');
  // Three opaque scalloped cloth shells avoid order-dependent transparency.

  for(let layer=0;layer<3;layer++) {
    const n=192,m=16,pos=[],idx=[];
    for(let j=0;j<=m;j++) for(let i=0;i<=n;i++) {
      const a=i*tau/n,u=j/m;
      const r=.16+(.67-layer*.025)*u;
      const y=.08-.18*u*u-layer*.028 + .022*Math.sin(24*a)*u*u;
      pos.push(r*Math.cos(a),y,r*Math.sin(a));
      if(j<m&&i<n){const q=j*(n+1)+i;idx.push(q,q+n+1,q+1,q+1,q+n+1,q+n+2);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
    const skirt=mesh(geo,layer===0?blush:silk,torso);
  }
  for(let i=0;i<24;i++) {
    const a=i*tau/24;
    curve(torso,Array.from({length:10},(_,j)=>{const u=j/9,r=.17+.64*u;return [r*Math.cos(a),.091-.18*u*u,r*Math.sin(a)];}),.0048,gold);
    ellipsoid(torso,gold,.814*Math.cos(a),-.088,.814*Math.sin(a),.012,.012,.012);
  }
  ring(torso,.155,.014,.12,gold);
  // Exposed mechanical voice, positioned beside the dancer rather than over it.
  const machine=group(world,1.35,.12,.72);machine.rotation.y=-.25;
  const drum=group(machine,0,.48,0);drum.name='drum';
  const barrel=mesh(new T.CylinderGeometry(.33,.33,1.22,48),gold,drum);barrel.rotation.z=Math.PI/2;
  for(const x of [-.64,.64]){const disc=mesh(new T.CylinderGeometry(.39,.39,.045,48),darkgold,machine,x,.48,0);disc.rotation.z=Math.PI/2;}
  for(let i=0;i<72;i++) {
    const a=i*tau/18,x=-.54+(i%12)*.095;
    const pin=mesh(new T.SphereGeometry(.024,8,6),porcelain,drum,x,.34*Math.cos(a),.34*Math.sin(a));
  }
  mesh(new T.BoxGeometry(1.55,.10,1.05),enamel,machine,0,.08,.05);
  const comb=group(machine);
  for(let i=0;i<19;i++){
    mesh(new T.BoxGeometry(.044,.025,.48-(i%5)*.035),gold,comb,-.56+i*.062,.22,.50);
    ellipsoid(comb,darkgold,-.56+i*.062,.24,.71,.012,.012,.012);
  }
  rod(machine,[-.81,.22,-.25],[-.81,.55,-.25],.04,.04,gold);
  rod(machine,[.81,.22,-.25],[.81,.55,-.25],.04,.04,gold);
  // Real library animation tracks; complete pose assignment each absolute frame.
  const samples=poseSamples(),times=samples.map(p=>(p.frame-study[0])/api.fps);
  const track=(target,field,name)=>new T.NumberKeyframeTrack(`${target}.${field}`,times,samples.map(p=>p[name]));
  const tracks=[track('dancer','rotation[y]','yaw'),track('torso','rotation[z]','lean'),
    ...['leftArm','rightArm'].flatMap(name=>[track(name,'rotation[z]',name),track(name+'Elbow','rotation[z]',name==='leftArm'?'leftElbow':'rightElbow')]),
    track('freeHip','rotation[z]','freeHip'),track('freeKnee','rotation[z]','freeKnee')];
  const mixer=new T.AnimationMixer(dancer);
  const clip=new T.AnimationClip('authored-port-de-bras-and-turn',times.at(-1),tracks);
  const action=mixer.clipAction(clip);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();
  return {
    evaluate(t) {
      const frame=t.exposed??t.frame;
      const energyBinding=(config.bindings??[]).find(b=>b.name==='music.energy');
      const energy=energyBinding&&t.read?t.read(energyBinding.name,energyBinding.space):0;
      return {frame,seconds:Math.max(0,Math.min(times.at(-1),(frame-study[0])/api.fps)),energy};
    },
    draw(g,t,s) {
      // Clamp endpoint time ourselves. Keep action enabled when seeking backwards
      // after the last key, where a LoopOnce action could otherwise be paused.
      action.enabled=true;action.paused=false;mixer.setTime(s.seconds);
      drum.rotation.x=(s.frame-study[0])*.012;comb.rotation.x=.012*s.energy;
      renderer.render(world,camera);
      g.drawImage(renderer.domElement,0,0,api.width,api.height);
    },
  };
}
