from pathlib import Path
from datetime import datetime,timezone
import json,os,shutil,subprocess,sys,time
E=Path(__file__).resolve().parent
D=Path('/Users/oozoofrog/.codex/skills/cinewright')
node=shutil.which('node'); npm=shutil.which('npm')
assert node and npm
for p in ['tmp/npm-cache','tmp/node-compile-cache']:(E/p).mkdir(parents=True,exist_ok=True)
env=os.environ.copy()
env.update(TMPDIR=str(E/'tmp'),npm_config_cache=str(E/'tmp/npm-cache'),npm_config_update_notifier='false',NODE_COMPILE_CACHE=str(E/'tmp/node-compile-cache'),PYTHONDONTWRITEBYTECODE='1')
configuration={'cwd':str(D),'node':node,'nodeRealPath':str(Path(node).resolve()),'npm':npm,'npmRealPath':str(Path(npm).resolve()),'environmentOverrides':{k:env[k] for k in ['TMPDIR','npm_config_cache','npm_config_update_notifier','NODE_COMPILE_CACHE','PYTHONDONTWRITEBYTECODE']},'testInternalTemporaryPaths':'Existing tests override TMPDIR and retain validation artifacts beneath installed .direction/test-runs. These are authorized validation outputs and will be inventoried.'}
(E/'validation-configuration.json').write_text(json.dumps(configuration,ensure_ascii=False,indent=2)+'\n')
commands=[('node-version',[node,'--version']),('npm-version',[npm,'--version']),('quick-validate',['/usr/bin/python3','/Users/oozoofrog/.codex/skills/.system/skill-creator/scripts/quick_validate.py',str(D)]),('doctor',[node,'scripts/direction.mjs','doctor']),('help',[node,'scripts/direction.mjs','--help']),('npm-test',[npm,'test'])]
results=[]
for label,args in commands:
    record={'label':label,'command':args,'cwd':str(D),'startedAt':datetime.now(timezone.utc).isoformat(),'environmentOverrides':configuration['environmentOverrides'],'stdout':str(E/'logs'/f'{label}.stdout'),'stderr':str(E/'logs'/f'{label}.stderr')}
    (E/'logs'/f'{label}.started.json').write_text(json.dumps(record,indent=2)+'\n')
    print('START '+label,flush=True); started=time.monotonic()
    with (E/'logs'/f'{label}.stdout').open('xb') as out,(E/'logs'/f'{label}.stderr').open('xb') as err:
        p=subprocess.run(args,cwd=D,env=env,stdout=out,stderr=err)
    record.update(exitCode=p.returncode,finishedAt=datetime.now(timezone.utc).isoformat(),seconds=time.monotonic()-started)
    (E/'logs'/f'{label}.status.json').write_text(json.dumps(record,indent=2)+'\n')
    results.append(record)
    print(f'END {label} exit={p.returncode} seconds={record["seconds"]:.3f}',flush=True)
    if p.returncode:
        (E/'validation-failure.json').write_text(json.dumps(record,indent=2)+'\n')
        sys.exit(p.returncode)
(E/'validation-commands.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print('ALL_PLANNED_COMMANDS_PASSED',flush=True)
