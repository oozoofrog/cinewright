from pathlib import Path
import sys, json, os, stat, tempfile
from datetime import datetime, timezone
sys.dont_write_bytecode=True
from prepare import E,S,D,digest,scan,dependencies,manifest,write_json,check_links

before=json.loads((E/'installed-before.json').read_text())
payload=json.loads((E/'payload.json').read_text())['files']
source=json.loads((E/'source-before.json').read_text())['files']
assert scan(D,exclude=('node_modules',))==before['entries'], 'Destination changed after backup'
assert dependencies()==json.loads((E/'dependencies-before.json').read_text()), 'Dependencies changed after backup'
for item in payload: assert digest(S/item['path'])==item['sourceSha256'], f'Payload source changed after staging: {item["path"]}'
for item in payload:
    assert digest(E/'stage'/item['path'])==item['installedSha256'], f'Stage changed: {item["path"]}'
    assert stat.S_IMODE((E/'stage'/item['path']).stat().st_mode)==int(item['mode'],8)

def order(item):
    rel=item['path']
    return (2 if rel=='SKILL.md' else 1 if rel.endswith('.md') else 0,rel)

applied=[]
for item in sorted(payload,key=order):
    rel=item['path']; dest=D/rel
    assert digest(S/rel)==item['sourceSha256'], f'Source conflict: {rel}'
    dest.parent.mkdir(parents=True,exist_ok=True)
    assert dest.parent.resolve()==dest.parent, f'Symlink parent: {rel}'
    previous=before['entries'].get(rel)
    def check_target():
        if previous:
            assert not dest.is_symlink() and dest.is_file(), f'Target shape changed: {rel}'
            assert digest(dest)==previous['sha256'], f'Target content conflict: {rel}'
            assert stat.S_IMODE(dest.stat().st_mode)==int(previous['mode'],8)
        else: assert not os.path.lexists(dest), f'New file conflict: {rel}'
    check_target()
    fd,tempname=tempfile.mkstemp(prefix='.'+dest.name+'.global-update-',dir=dest.parent)
    with os.fdopen(fd,'wb') as f:
        f.write((E/'stage'/rel).read_bytes()); f.flush(); os.fsync(f.fileno())
        os.fchmod(f.fileno(),int(item['mode'],8))
    assert digest(Path(tempname))==item['installedSha256']
    check_target()
    os.replace(tempname,dest)
    assert digest(dest)==item['installedSha256']
    row={'at':datetime.now(timezone.utc).isoformat(),**item}
    with (E/'applied-files.jsonl').open('a') as f:
        f.write(json.dumps(row,ensure_ascii=False)+'\n'); f.flush(); os.fsync(f.fileno())
    applied.append(row)
assert applied[-1]['path']=='SKILL.md'
after=scan(D,exclude=('node_modules',))
assert sum(x['type']=='file' for x in after.values())==105
for rel,item in before['entries'].items():
    if item['type']=='file' and rel not in {x['path'] for x in payload}: assert after[rel]==item, f'Unrelated installed file changed: {rel}'
for item in payload:
    assert after[item['path']]['sha256']==item['installedSha256']
assert dependencies()==json.loads((E/'dependencies-before.json').read_text())
for item in payload: assert digest(S/item['path'])==item['sourceSha256'], f'Payload source changed during application: {item["path"]}'
source_after={rel:digest(S/rel) for rel in source}
source_drift=[{'path':rel,'beforeSha256':sha,'afterSha256':source_after[rel],'inPayload':rel in {x['path'] for x in payload}} for rel,sha in source.items() if source_after[rel]!=sha]
write_json('source-after-apply.json',{'root':str(S),'files':source_after,'observedDrift':source_drift,'scope':'Observed selected source files only. Payload preservation enforced. Non-payload concurrent edits are preserved and excluded from installation eligibility.'})
helper=D/'evidence/2026-11-05-production/task-4/task4-run.mjs'
assert not helper.is_symlink()
assert (helper.parent/'../../../scripts/revisions.mjs').resolve()==D/'scripts/revisions.mjs'
write_json('installed-after-apply.json',manifest(D,after))
write_json('links-installed.json',check_links())
write_json('applied.json',{'at':datetime.now(timezone.utc).isoformat(),'status':'INSTALLED_AWAITING_VALIDATION','payloadFiles':45,'replacedFiles':4,'addedFiles':41,'unchangedOriginalFiles':60,'baseInstalledFileCount':105,'lastInstalledFile':'SKILL.md','helperImportResolvesTo':str(D/'scripts/revisions.mjs'),'sourcePayloadUnchanged':True,'nonPayloadSourceDrift':source_drift,'dependenciesUnchanged':True})
print(json.dumps({'status':'INSTALLED_AWAITING_VALIDATION','payloadFiles':45,'replaced':4,'added':41,'unchangedOriginals':60,'baseInstalledFiles':105,'localLinks':44,'dependenciesUnchanged':True,'sourcePayloadUnchanged':True,'nonPayloadSourceDrift':source_drift}))
