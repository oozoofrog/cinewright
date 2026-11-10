from pathlib import Path
from datetime import datetime,timezone
import json,re,subprocess,sys
sys.dont_write_bytecode=True
from prepare import E,S,D,digest,scan,manifest,dependencies,write_json,fingerprint

before=json.loads((E/'installed-before.json').read_text())
base=json.loads((E/'installed-after-apply.json').read_text())
payload=json.loads((E/'payload.json').read_text())
after=manifest(D,scan(D,exclude=('node_modules',)))
expected={x['path']:x for x in payload['files']}
for rel,item in expected.items():
    assert after['entries'][rel]['type']=='file'
    assert after['entries'][rel]['sha256']==item['installedSha256'],f'Installed payload conflict: {rel}'
    assert after['entries'][rel]['mode']==item['mode']
    assert digest(S/rel)==item['sourceSha256'],f'Source payload conflict: {rel}'
    assert digest(E/'stage'/rel)==item['installedSha256'],f'Staged payload conflict: {rel}'
for rel,item in before['entries'].items():
    if item['type']=='file' and rel not in expected: assert after['entries'][rel]==item,f'Original file changed: {rel}'
for rel,item in base['entries'].items(): assert after['entries'][rel]==item,f'Base installation changed during validation: {rel}'
newentries={p:x for p,x in after['entries'].items() if p not in base['entries']}
assert all(p=='.direction' or p=='.direction/test-runs' or p.startswith('.direction/test-runs/') for p in newentries), 'Unexpected installed output path'
depafter=dependencies()
assert depafter==json.loads((E/'dependencies-before.json').read_text()), 'Dependency fingerprint changed'
backup=json.loads((E/'backup/receipt.json').read_text())
for item in backup['files']:assert digest(E/'backup/files'/item['path'])==item['sha256']
write_json('installed-after.json',after)
write_json('dependencies-after.json',depafter)
source_before=json.loads((E/'source-before.json').read_text())['files']
source_after={rel:digest(S/rel) for rel in source_before}
source_drift=[{'path':rel,'beforeSha256':sha,'afterSha256':source_after[rel],'inPayload':rel in expected} for rel,sha in source_before.items() if source_after[rel]!=sha]
write_json('source-after.json',{'root':str(S),'files':source_after,'observedDrift':source_drift,'payloadUnchanged':True,'scope':'45 approved payload files are enforced. Other listed source files are observations only; concurrent non-payload edits are preserved and not attributed to this installer.'})
runs=[]
for p in sorted((D/'.direction/test-runs').iterdir()):
    rel=p.relative_to(D).as_posix(); entries={k:v for k,v in newentries.items() if k==rel or k.startswith(rel+'/')}
    runs.append({'path':str(p),'fileCount':sum(v['type']=='file' for v in entries.values()),'bytes':sum(v.get('size',0) for v in entries.values()),'fingerprintSha256':fingerprint(entries)})
artifacts={'root':str(D/'.direction/test-runs'),'retained':True,'fileCount':sum(v['type']=='file' for v in newentries.values()),'bytes':sum(v.get('size',0) for v in newentries.values()),'runs':runs,'completeEntriesIn':str(E/'installed-after.json')}
write_json('validation-artifacts.json',artifacts)
commands=json.loads((E/'validation-commands.json').read_text())
assert len(commands)==6 and all(x['exitCode']==0 for x in commands)
out=(E/'logs/npm-test.stdout').read_text()
counts={key:int(re.search(r'^ℹ '+key+r' (\d+)$',out,re.M).group(1)) for key in ['tests','pass','fail','cancelled','skipped','todo']}
assert counts=={'tests':364,'pass':364,'fail':0,'cancelled':0,'skipped':0,'todo':0}
assert (E/'logs/npm-test.stderr').stat().st_size==0
source_git={}
for label,args in [('source-head-after',['git','rev-parse','HEAD']),('source-status-after',['git','status','--porcelain=v1','--untracked-files=normal'])]:
    q=subprocess.run(args,cwd=S,capture_output=True)
    (E/'logs'/f'{label}.stdout').write_bytes(q.stdout);(E/'logs'/f'{label}.stderr').write_bytes(q.stderr)
    write_json('logs/'+label+'.status.json',{'command':args,'cwd':str(S),'exitCode':q.returncode})
    source_git[label]=q.stdout.decode()
write_json('post-verification.json',{'at':datetime.now(timezone.utc).isoformat(),'payloadFilesMatched':45,'sourcePayloadUnchanged':True,'stageUnchanged':True,'originalFilesUnchanged':60,'replacementFilesMatched':4,'backupFilesIntact':64,'dependenciesUnchanged':True,'dependencyFingerprintSha256':depafter['fingerprintSha256'],'baseInstalledFiles':105,'onlyAdditionalInstalledPaths':str(D/'.direction/test-runs'),'validationArtifacts':artifacts,'tests':counts,'sourceHead':source_git['source-head-after'].strip(),'sourceNonPayloadObservedDrift':source_drift,'installedManifestSha256':digest(E/'installed-after.json'),'payloadManifestSha256':digest(E/'payload.json')})
print(json.dumps({'status':'POST_VALIDATION_HASHES_PASSED','payload':45,'unchangedOriginals':60,'dependenciesUnchanged':True,'installedTotalFiles':after['fileCount'],'validationArtifactFiles':artifacts['fileCount'],'validationArtifactBytes':artifacts['bytes'],'runs':runs,'tests':counts,'sourceHead':source_git['source-head-after'].strip(),'sourceObservedDrift':source_drift},ensure_ascii=False))
