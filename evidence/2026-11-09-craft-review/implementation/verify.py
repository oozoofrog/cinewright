from pathlib import Path
import hashlib,json,re,subprocess,sys
root=Path.cwd(); out=root/'evidence/craft-review-20261109/implementation'
files=sorted(set([Path('SKILL.md'),Path('skills/cinewright/SKILL.md'),*Path('references').glob('*.md'),*Path('examples/stillcuts').rglob('*'),*Path('modules').glob('*.mjs'),*Path('runtime').glob('*.mjs'),*Path('scripts').glob('*.mjs')]))
files=[p for p in files if p.is_file()]
def manifest(name):
 data={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in files};(out/name).write_text(json.dumps(data,indent=2)+'\n');return data
before=manifest('source-before-checks.sha256.json')
def run(name,args):
 r=subprocess.run(args,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);(out/name).write_text('$ '+' '.join(args)+'\n'+r.stdout+'\nEXIT '+str(r.returncode)+'\n');print(name,r.returncode);assert r.returncode==0,r.stdout[-2000:];return r.stdout
run('skill-validation-success.log',['/usr/local/bin/python3','/Users/oozoofrog/.codex/skills/.system/skill-creator/scripts/quick_validate.py','.'])
run('regression-bound.log',['node','--test','tests/artwork.test.mjs','tests/cuts.test.mjs','tests/timeline.test.mjs'])
run('whitespace.log',['git','diff','--check'])
# Check file targets and heading fragments in affected docs and entry routing.
links=[]
for p in map(Path,['SKILL.md','references/craft.md','references/craft-execution.md','references/stillcuts.md']):
 for target in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if re.match(r'https?://',target):continue
  name,_,fragment=target.partition('#');dest=p.parent/name if name else p
  assert dest.exists(),(p,target)
  if fragment:
   headings=re.findall(r'^#+\s+(.+)$',dest.read_text(),re.M)
   slugs=[re.sub(r'[^\w\- ]','',h.lower()).replace(' ','-') for h in headings]
   assert fragment in slugs,(p,target,slugs)
  links.append([str(p),target])
(out/'local-links.json').write_text(json.dumps({'checked':len(links),'links':links},ensure_ascii=False,indent=2)+'\n');print('local links',len(links))
import shutil
sandbox=out/'sandbox';(sandbox/'examples').mkdir(parents=True)
shutil.copytree(root/'examples/stillcuts',sandbox/'examples/stillcuts');shutil.copytree(root/'modules',sandbox/'modules')
run('example-build.log',['node',str(sandbox/'examples/stillcuts/build.mjs')])
project=sandbox/'examples/stillcuts/a';store=out/'store'
frozen=json.loads(run('freeze.log',['node','scripts/direction.mjs','freeze',str(project),'--store',str(store)]));rev=frozen['revision']
for f in [108,109]:run(f'frame-{f}.log',['node','scripts/direction.mjs','frame',rev,str(f),'--store',str(store)])
after=manifest('source-after-checks.sha256.json');assert before==after
(out/'source-check-result.json').write_text(json.dumps({'files':len(before),'unchanged':before==after,'revision':rev},indent=2)+'\n')
