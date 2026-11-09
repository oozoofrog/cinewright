import { prepare as prepareArtwork } from '../../modules/artwork.mjs';
import { prepare as prepareFocus } from '../../modules/fx/focus.mjs';
import { prepare as prepareAccent } from '../../modules/fx/accent.mjs';
import { clamp, ease, progress } from '../../modules/motion.mjs';
import { limitedPose, groupCounterpoint, shapeMatch, visualPhases, energyAt } from './recipes.mjs';

const ink = '#263e40', paper = '#f2e9d4', vermilion = '#b4523e', brass = '#b28e53';
function ellipse(g, x, y, rx, ry, fill) {
  g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
}
function polygon(g, points, fill) {
  g.fillStyle = fill; g.beginPath(); points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y)); g.closePath(); g.fill();
}
function line(g, points, color, width = 3) {
  g.strokeStyle = color; g.lineWidth = width; g.beginPath(); points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y)); g.stroke();
}

/** A deliberately non-human paper figurine: pinned disk head, fan skirt, ink limbs.
 * The supporting leg terminates at (0,0) in every pose; free leg/arms change by exposure.
 */
function figurine(g, pose, at, scale = 1, color = vermilion) {
  g.save();
  try {
    g.translate(...at); g.scale(scale, scale);
    ellipse(g, 0, 4, 61, 9, '#253e4030');
    g.scale(pose.facing, 1);
    const held = pose.pose === 'contact' || pose.pose === 'hold';
    const arms = held ? [[-87,-160],[-35,-142],[0,-162],[42,-201],[65,-215]] : pose.pose === 'anticipate' ? [[-57,-210],[-32,-170],[0,-165],[33,-157],[73,-175]] : [[-76,-145],[-33,-162],[0,-161],[42,-147],[76,-125]];
    line(g, [[0,-65],[0,-7],[0,0]], ink, 9);
    g.fillStyle=ink; g.fillRect(-14,-4,28,7);
    line(g, [[13,-64],[held ? 50 : 34,-36 - pose.lift*35],[held ? 98 : 60,-31 - pose.lift*65]], ink, 8);
    line(g, arms, ink, 8);
    polygon(g, [[-18,-175],[18,-175],[30,-116],[-25,-116]], color);
    polygon(g, [[0,-130],[-78,-63],[80,-63]], paper);
    polygon(g, [[0,-130],[-65,-66],[-16,-76],[24,-65],[69,-68]], color);
    for (const x of [-48,-24,0,24,48]) line(g, [[0,-125],[x,-70]], '#f6deb3', 2);
    ellipse(g, 0,-203,25,28,paper);
    polygon(g, [[-24,-207],[-24,-230],[8,-239],[26,-220],[25,-208],[0,-223]], ink);
    ellipse(g, 0,-145,4,4,brass); ellipse(g, 0,-66,4,4,brass);
    line(g, [[-21,-203],[17,-203]], '#be9e77', 1);
  } finally { g.restore(); }
}
function foldedWing(g, side, amount) {
  g.save();
  try {
    g.translate(side < 0 ? 385 : 1535, 370); g.scale(side < 0 ? 1 : -1, 1);
    for (let i=0;i<4;i++) {
      const width = 58 * amount;
      polygon(g, [[i*width,0],[(i+1)*width,i%2?22:-20],[(i+1)*width,370],[i*width,350]], i%2 ? '#cab994' : '#e6dac1');
      line(g, [[i*width,0],[i*width,350]], '#9a8867', 2);
      if (amount > .65) { ellipse(g,i*width+width/2,130,12,32,'#4e6d63'); line(g,[[i*width+width/2,160],[i*width+width/2,270]],'#63786a',3); }
    }
  } finally { g.restore(); }
}
function glyph(g, kind, amount, color) {
  g.fillStyle = color;
  if (kind === 0) {
    g.beginPath(); g.arc(0,0,65,0,Math.PI*2); g.fill();
    ellipse(g,0,0,29,29,paper);
    g.fillStyle=color; g.fillRect(44,-12,102 + 34*amount,24); g.fillRect(116,0,17,38);
  } else if (kind === 1) {
    polygon(g,[[-65,55],[0,-85],[65,55]],color);
    polygon(g,[[-27,32],[0,-27],[27,32]],paper);
  } else {
    for(let i=0;i<4;i++) { g.save(); g.rotate(i*Math.PI/2); ellipse(g,0,-42,22,47,color); g.restore(); }
    ellipse(g,0,0,14,14,paper);
  }
}

export async function prepare(api, config = {}) {
  const variant = config.variant ?? 'theatre';
  if (!['theatre','counterpoint'].includes(variant)) throw new Error('Unknown Music Box Dancer variant');
  const derived = await api.json('music/derived.json');
  if (derived.frames !== api.frames || derived.fps !== api.fps) throw new Error('Scene/derived timing mismatch');
  const phases = visualPhases(derived, api.frames);
  // Presentation-only onset thinning prevents paper poses chattering on dense attacks.
  // Analysis and canonical JSON are never rewritten.
  const events = [];
  const minimumPoseFrames = Math.ceil(api.fps * (variant === 'theatre' ? .55 : .22));
  for (const event of derived.events?.onsets ?? []) if (!events.length || event.frame - events.at(-1).frame >= minimumPoseFrames) events.push({ ...event });
  const artwork = variant === 'theatre' ? await prepareArtwork({ ...api, width:1920, height:1080 }, { artworks: { stage: { asset:'assets/paper-stage.svg', placement:{fit:'contain'} } } }) : null;
  const accent = prepareAccent({ events, at:[960,770], radius:48, release:api.fps*.23, color:vermilion });
  const formation = shapeMatch({frames:api.frames, color:variant === 'theatre' ? brass : vermilion, radius:variant === 'theatre' ? 2.1 : 3});
  const reveals = phases.map(p => prepareFocus({ from:p.from, to:p.from+Math.max(1,Math.min(p.to-p.from-1,Math.round(api.fps*1.3))), box:[385,345,1150,420] }));
  function evaluate(t) {
    const frame = t.exposed ?? t.frame;
    const phaseIndex = Math.max(0, phases.findIndex(p => p.from <= frame && frame < p.to));
    const phase = phases[phaseIndex];
    let energy = energyAt(derived.tracks?.energy, frame);
    for (const binding of config.bindings ?? []) {
      if (t.read && binding.from <= t.frame && t.frame < binding.to) {
        const value = t.read(binding.name, binding.space);
        if (binding.name === 'music.energy' && binding.kind === 'number') energy = clamp(value);
      }
    }
    return { frame, phase, phaseIndex, energy, pose:limitedPose({frame,events,fps:api.fps}), voices:groupCounterpoint({frame,events,fps:api.fps}), tiles:formation.evaluate({...t,exposed:frame}), accent:accent.evaluate({...t,exposed:frame}), reveal:reveals[phaseIndex].evaluate({...t,exposed:frame}) };
  }
  function theatre(g,t,s) {
    const role = s.phase.role;
    // Shot changes are hard cuts at phrase boundaries, never automatic camera drift.
    const close = role === 'solo' || role === 'return';
    g.save();
    try {
      g.translate(960,540); g.scale(close ? 1.16 : 1, close ? 1.16 : 1); g.translate(-960,close ? -600 : -540);
      artwork.draw(g,{...t,value:'stage'});
      if (['unfold','ensemble','return','coda'].includes(role)) {
        const amount = role === 'unfold' ? s.reveal.amount : 1;
        foldedWing(g,-1,amount); foldedWing(g,1,amount);
      }
      ellipse(g,960,793,230,30,'#b6a47c'); ellipse(g,960,779,230,29,'#dbcba8');
      g.fillStyle='#f1e5c9'; g.fillRect(730,779,460,9);
      if (['opening','unfold','coda'].includes(role)) {
        g.save(); g.translate(960,425); g.scale(.75,.75); formation.draw(g,t,s.tiles); g.restore();
      } else {
        // Quiet pinned brass sun provides negative space behind the figure.
        ellipse(g,960,410,101,101,'#c1a878'); ellipse(g,960,410,89,89,'#e9ddc4');
        line(g,[[960,297],[960,277]],brass,3);
      }
      if (role === 'opening') {
        g.fillStyle=ink; g.font='24px Georgia, serif'; g.textAlign='center'; g.fillText('M U S I C   B O X   D A N C E R',960,274);
      }
      if (['duet','ensemble'].includes(role)) {
        for (const [i,x] of [650,1270].entries()) {
          const answer = limitedPose({frame:s.frame-Math.round((i+1)*api.fps*.16), events, fps:api.fps});
          figurine(g,answer,[x,765],.82,i ? '#6b7f70' : '#c19a56');
        }
      }
      // Opening/coda are held tableau, not compulsory motion on every beat.
      const pose = ['opening','coda'].includes(role) ? {pose:'hold',lift:0,facing:1} : s.pose;
      figurine(g,pose,[960,765],1.3);
      if (!['opening','coda'].includes(role)) accent.draw(g,t,s.accent);
      // Mechanical crank with a stepped detent, rather than perpetual rotation.
      g.save(); g.translate(1450,896); g.rotate((Math.max(0,s.pose.index)%12)*Math.PI/6);
      ellipse(g,0,0,37,37,brass); ellipse(g,0,0,28,28,ink); line(g,[[0,0],[57,0]],'#d0b27d',9); ellipse(g,57,0,10,10,vermilion); g.restore();
    } finally {g.restore();}
  }
  function counterpoint(g,t,s) {
    const role=s.phase.role;
    g.fillStyle=paper; g.fillRect(0,0,1920,1080);
    g.fillStyle=ink; g.fillRect(116,128,74,8);
    g.font='25px Georgia, serif'; g.textAlign='left'; g.fillText('Music Box Dancer',220,143);
    // A graphic field, not a music-analysis HUD; no meters or beat-wide strobes.
    g.fillStyle='#ded6bd'; g.fillRect(116,864,1688,2);
    const layouts = {
      opening:[[620,580],[960,580],[1300,580]], solo:[[550,620],[960,505],[1370,390]],
      duet:[[590,460],[960,640],[1330,460]], unfold:[[530,680],[960,680],[1390,680]],
      ensemble:[[500,440],[960,620],[1420,440]], return:[[550,620],[960,505],[1370,390]], coda:[[620,660],[960,660],[1300,660]],
    };
    const colors=[vermilion,ink,'#8a986f'];
    for (const voice of s.voices) {
      const i=voice.group, [x,y]=layouts[role][i];
      const held=['opening','coda'].includes(role);
      g.save();
      try {
        g.translate(x+(held?0:voice.travel),y);
        if (!held) g.rotate(voice.turn*(i%2?-1:1));
        // Offset paper register/shadow is flat print, not glow.
        g.save(); g.translate(8,9); glyph(g,i,0,'#c9bfa5'); g.restore();
        glyph(g,i,held?0:voice.amount,colors[i]);
      } finally {g.restore();}
      // Three smaller answer tokens are spatially separate from the principal voice.
      for(let j=0;j<3;j++) {
        g.save(); g.translate(x-48+j*48,794-(held?0:voice.amount*(3-j)*14)); g.scale(.13,.13); glyph(g,i,0,colors[i]); g.restore();
      }
    }
    if (['unfold','ensemble','coda'].includes(role)) {
      reveals[s.phaseIndex].draw(g,t,s.reveal,()=>{g.save();g.translate(960,355);formation.draw(g,t,s.tiles);g.restore();});
    } else {
      // Purposeful match: the key's vertical stem becomes a paper fold in the next shot.
      const width=role==='duet'?360:180;
      g.fillStyle=role==='duet'?'#8a986f':brass; g.fillRect(960-width/2,280,width,14);
      g.fillRect(960-width/2,280,14,66);
    }
    // Energy changes only a bounded local hinge, never the full canvas luminance.
    g.save();g.translate(1785,818);g.rotate(-Math.PI/4+s.energy*.22);g.fillStyle=brass;g.fillRect(-34,-5,68,10);g.restore();
  }
  return {
    evaluate,
    draw(g,t,supplied) {
      const s=supplied??evaluate(t);
      g.save();
      try {
        g.scale(api.width/1920,api.height/1080);
        g.fillStyle=paper;g.fillRect(0,0,1920,1080);
        if (variant==='theatre') theatre(g,t,s); else counterpoint(g,t,s);
      } finally {g.restore();}
    },
  };
}
