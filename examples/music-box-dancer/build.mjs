import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { materializeKit, writeOwnedFiles } from '../../scripts/materialize-kit.mjs';
import { projectPath, validate } from '../../runtime/timeline.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const json = value => JSON.stringify(value, null, 2) + '\n';
async function regularAsset(project, asset) {
  projectPath(asset);
  const base=await fs.realpath(project);
  let component=base;
  for (const part of asset.split('/')) {
    component=path.join(component,part);
    if ((await fs.lstat(component)).isSymbolicLink()) throw new Error(`Audio asset must not use symlinks: ${asset}`);
  }
  const file=await fs.realpath(component), relative=path.relative(base,file);
  if (relative.startsWith('..'+path.sep) || path.isAbsolute(relative) || !(await fs.stat(file)).isFile()) throw new Error(`Audio asset must be a project-local regular file: ${asset}`);
}
function checkDerived(derived, frames, fps) {
  if (derived?.version !== 1 || !Number.isSafeInteger(frames) || frames < 2 || derived.frames !== frames || derived.fps !== fps) throw new Error('source/derived timing or version mismatch (at least two frames required)');
  for (const name of ['onsets','beats']) {
    const events=derived.events?.[name];
    if (!Array.isArray(events) || events.some((e,i)=>!Number.isFinite(e.seconds) || e.seconds<0 || !Number.isInteger(e.frame) || e.frame<0 || e.frame>=frames || (i && e.frame<events[i-1].frame) || (e.strength!==undefined && !Number.isFinite(e.strength)))) throw new Error(`Invalid canonical events.${name}`);
  }
  const keys=derived.tracks?.energy;
  if (!Array.isArray(keys) || !keys.length || keys.some((k,i)=>!Array.isArray(k) || k.length!==2 || !Number.isInteger(k[0]) || k[0]<0 || k[0]>=frames || !Number.isFinite(k[1]) || (i && k[0]<=keys[i-1][0]))) throw new Error('Invalid canonical tracks.energy');
}

/** Build either variant for exactly the same source timing; never creates replacement music.
 * Audio is an existing project-local source.audio descriptor in 48k sample units.
 * Analysis files remain owned by the music service. Rebuilding generated files refuses edits.
 */
export async function buildMusicBoxProject({ project, source, derived, variant = 'theatre', size = [1920,1080] }) {
  if (!['theatre','counterpoint'].includes(variant)) throw new Error(`Unknown variant: ${variant}`);
  if (!source?.audio) throw new Error('source.audio is required; no synthesized fallback');
  const frames=source.frames ?? source.requiredFrames ?? derived?.frames, fps=source.fps ?? derived?.fps;
  checkDerived(derived,frames,fps);
  if (source.decoded && (source.decoded.rate !== 48000 || source.decoded.channels !== 2 ||
      !Number.isSafeInteger(source.decoded.frames) || source.decoded.frames < 1 ||
      frames !== Math.ceil(source.decoded.frames * fps / 48000) ||
      source.audio.sourceIn !== 0 || source.audio.sourceOut !== source.decoded.frames || source.audio.at !== 0)) {
    throw new Error('Music source must retain the entire decoded audio and ceil its visual duration');
  }
  await fs.mkdir(project,{recursive:true});
  await regularAsset(project,source.audio.asset);
  const channels=structuredClone(derived.manifest?.channels ?? {});
  for (const [name,channel] of Object.entries(channels)) {
    if (!name.startsWith('music.') || channel.producer !== '$data' || !Array.isArray(channel.consumers) || channel.consumers.some(id=>id!=='scene')) throw new Error(`Music channel must target only scene: ${name}`);
    if (!channel.consumers.length) channel.consumers=['scene'];
  }
  const bindings=Object.entries(channels).map(([name,c])=>({name,space:c.space,kind:c.kind,from:c.from,to:c.to}));
  const work={
    version:1, title:`Music Box Dancer — ${variant === 'theatre' ? 'Paper Theatre' : 'Printed Counterpoint'}`,
    size:[...size], fps, frames, background:'#f2e9d4',
    points:structuredClone(derived.manifest?.points ?? {}), spans:structuredClone(derived.manifest?.spans ?? {}), channels,
    layers:[{ id:'scene', module:'scene.mjs', exposure:[{from:0,to:frames,every:variant==='theatre'?2:1,value:'paper'}], config:{variant,bindings} }],
    audio:[structuredClone(source.audio)],
  };
  validate(work);
  const canonical=path.join(project,'music/derived.json');
  // Existing canonical bytes (including service diagnostics and quantization data) are untouched.
  try {
    const existing=JSON.parse(await fs.readFile(canonical,'utf8'));
    if (!isDeepStrictEqual(existing,derived)) throw new Error('Existing music/derived.json differs; derive with the music service first');
  } catch(error) {
    if (error.code!=='ENOENT') throw error;
    await fs.mkdir(path.dirname(canonical),{recursive:true});
    await fs.writeFile(canonical,json(derived),{flag:'wx'});
  }
  const files={'work.json':json(work)};
  for (const name of ['scene.mjs','recipes.mjs']) {
    // The authored example imports the toolkit for Node tests; the project imports local copies.
    files[name]=(await fs.readFile(path.join(root,name),'utf8')).replaceAll("'../../modules/", "'./modules/");
  }
  if (variant==='theatre') files['assets/paper-stage.svg']=await fs.readFile(path.join(root,'assets/paper-stage.svg'));
  const kit=await materializeKit({project,modules:['motion','focus','accent','particles','artwork']});
  const generated=await writeOwnedFiles({project,files,registry:'.music-box-generated.json'});
  return {project:path.resolve(project),variant,work,kit,files:generated};
}
