import os, json, hashlib, subprocess, sys
from pathlib import Path
out=Path('evidence/aesthetic-toolkit-phase02-2026-11-08/independent-recheck')
owned=['evidence/aesthetic-toolkit-phase02-2026-11-08/independent-recheck/', '.direction/aesthetic-toolkit-phase02-2026-11-08/independent-recheck/', 'docs/handoffs/2026-11-08-phase02-independent-recheck.md']
def digest(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()
def snapshot(paths):
    return {p:digest(p) if Path(p).is_file() else None for p in paths}
def git(*args): return subprocess.check_output(['git',*args]).decode().strip()
if sys.argv[1]=='before':
    paths=set(json.load(open('evidence/aesthetic-toolkit-phase02-2026-11-08/coordinator/baseline.json'))['protected'])
    for folder in ['modules','runtime','scripts','tests','catalog','references','skills','examples','docs','evidence']:
        for base,dirs,files in os.walk(folder):
            for f in files:
                p=str(Path(base)/f)
                if not any(p.startswith(x) for x in owned): paths.add(p)
    data={'head':git('rev-parse','HEAD'),'index':digest(git('rev-parse','--git-path','index')),'files':snapshot(sorted(paths))}
    (out/'hashes-before.json').write_text(json.dumps(data,indent=2)+'\n')
    print({'files':len(paths),'head':data['head'],'index':data['index']})
else:
    before=json.load(open(out/'hashes-before.json')); after=snapshot(before['files'])
    (out/'hashes-after.json').write_text(json.dumps(after,indent=2)+'\n')
    result={'files':len(after),'changed':[p for p,h in after.items() if h!=before['files'][p]],'headUnchanged':git('rev-parse','HEAD')==before['head'],'indexUnchanged':digest(git('rev-parse','--git-path','index'))==before['index']}
    (out/'preservation.json').write_text(json.dumps(result,indent=2)+'\n'); print(result)
