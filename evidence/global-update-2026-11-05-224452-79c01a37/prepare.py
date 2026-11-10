from pathlib import Path
import hashlib, json, os, re, shutil, stat
from datetime import datetime, timezone
from urllib.parse import urlsplit, unquote

E = Path(__file__).resolve().parent
S = Path('/Volumes/eyedisk/develop/cinewright')
D = Path('/Users/oozoofrog/.codex/skills/cinewright')

def digest(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''): h.update(b)
    return h.hexdigest()

def data_hash(b): return hashlib.sha256(b).hexdigest()
def write_json(name, data):
    p = E / name
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: json.dump(data, f, ensure_ascii=False, indent=2); f.write('\n')

def scan(root, exclude=()):
    assert root.is_dir() and not root.is_symlink(), f'Unexpected root: {root}'
    entries = {}
    def walk(base):
        for p in sorted(base.iterdir()):
            rel = p.relative_to(root).as_posix()
            if rel in exclude: continue
            st = p.lstat()
            item = {'mode': oct(stat.S_IMODE(st.st_mode))}
            if stat.S_ISLNK(st.st_mode):
                target = os.readlink(p)
                resolved = p.resolve(strict=True)
                item.update(type='symlink', target=target, targetTextSha256=data_hash(os.fsencode(target)), resolvedPath=str(resolved))
                if resolved.is_file(): item['resolvedFileSha256'] = digest(resolved)
                else: item['resolvedKind'] = 'directory' if resolved.is_dir() else 'other'
            elif stat.S_ISREG(st.st_mode):
                item.update(type='file', size=st.st_size, sha256=digest(p))
            elif stat.S_ISDIR(st.st_mode):
                item['type'] = 'directory'
            else: raise RuntimeError(f'Unsupported filesystem shape: {p}')
            entries[rel] = item
            if item['type'] == 'directory': walk(p)
    walk(root)
    return entries

def fingerprint(entries):
    return data_hash(json.dumps(entries, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())

def manifest(root, entries):
    return {'root': str(root), 'entries': entries, 'entryCount':len(entries),
            'fileCount':sum(x['type']=='file' for x in entries.values()),
            'symlinkCount':sum(x['type']=='symlink' for x in entries.values()),
            'bytes':sum(x.get('size',0) for x in entries.values()), 'fingerprintSha256':fingerprint(entries)}

def dependencies():
    entries = {'node_modules/' + k:v for k,v in scan(D/'node_modules').items()}
    for rel in ['package.json','package-lock.json']:
        p = D/rel; st = p.lstat()
        assert stat.S_ISREG(st.st_mode)
        entries[rel] = {'type':'file','mode':oct(stat.S_IMODE(st.st_mode)), 'size':st.st_size, 'sha256':digest(p)}
    return manifest(D, entries)

LINK = re.compile(r'\[[^\]\n]*\]\(([^\s)]+)\)')
DOCS = ['SKILL.md'] + ['references/'+n+'.md' for n in ['craft','direction','format','stillcuts','tools']] + ['examples/stillcuts/README.md']

def anchors(p):
    found=set(); seen={}
    for line in p.read_text().splitlines():
        m=re.match(r'^#{1,6}\s+(.+?)\s*#*\s*$',line)
        if not m: continue
        slug=re.sub(r'[^\w\-\s]', '', m.group(1).lower())
        slug=re.sub(r'\s', '-', slug)
        n=seen.get(slug,0); seen[slug]=n+1
        found.add(slug if n==0 else f'{slug}-{n}')
    return found

def check_links(staged=False):
    rows=[]
    for rel in DOCS:
        document = E/'stage'/rel if staged else D/rel
        text=document.read_text()
        for m in LINK.finditer(text):
            target=m.group(1); u=urlsplit(target)
            if u.scheme or u.netloc: continue
            logical=((D/rel).parent / unquote(u.path)).resolve() if u.path else D/rel
            actual=logical
            if staged and logical.is_relative_to(D):
                candidate=E/'stage'/logical.relative_to(D)
                if candidate.exists(): actual=candidate
            assert actual.is_file(), f'Unresolved link: {rel}: {target}'
            anchor_ok=None
            if u.fragment:
                assert actual.suffix=='.md', f'Unexpected local fragment: {target}'
                anchor_ok=unquote(u.fragment) in anchors(actual)
                assert anchor_ok, f'Unresolved heading: {rel}: {target}'
            rows.append({'document':rel,'target':target,'resolved':str(logical),'exists':True,'fragmentValid':anchor_ok})
    return {'mode':'staged-overlay' if staged else 'installed', 'localLinkCount':len(rows),'allResolved':True,'links':rows}

def prepare():
    assert str(S.resolve())==str(S) and str(D.resolve())==str(D)
    receipts=[
        '.superpowers/sdd/2026-11-05-cinewright-production/final-review-inputs.json',
        '.superpowers/sdd/2026-11-05-cinewright-production/final-fix-1-review-inputs.json',
        'evidence/2026-11-05-production/protected-before.json',
        'evidence/2026-11-05-production/primary-final-delivery.json',
        'evidence/2026-11-05-production/preserved-existing-source.json',
        'evidence/2026-11-05-production/final-fix-1/preservation.json']
    r={p:json.loads((S/p).read_text()) for p in receipts}
    expected={}; authorities={}
    def add(path,sha,authority): expected[path]=sha; authorities[path]=authority
    first=r[receipts[0]]
    for p,sha in first['files'].items(): add(p,sha,receipts[0])
    for item in first['copyIdentity']: add(item['copy'],item['copySha256'],receipts[0]+'#copyIdentity')
    for key in ['generatedInputAndAssetFiles','ordinarySourceAndHelpers','sceneCopies']:
        for item in r[receipts[5]][key]: add(item['path'],item['sha256'],receipts[5]+'#'+key)
    for p,sha in r[receipts[1]]['files'].items(): add(p,sha,receipts[1])
    for p,sha in r[receipts[3]]['statusDocumentsSha256'].items(): add(p,sha,receipts[3]+'#statusDocumentsSha256')
    still=scan(S/'examples/stillcuts')
    assert all(x['type'] in ['directory','file'] for x in still.values())
    assert not any(any(part.startswith('.') for part in Path(p).parts) for p in still), 'Hidden stillcuts content'
    stillfiles=['examples/stillcuts/'+p for p,x in still.items() if x['type']=='file']
    assert len(stillfiles)==31
    payload=['SKILL.md']+['references/'+n+'.md' for n in ['craft','direction','format','stillcuts','tools']]+['modules/'+n+'.mjs' for n in ['cuts','artwork']]+stillfiles+['tests/'+n+'.test.mjs' for n in ['artwork','cuts','stillcuts-build','stillcuts-evidence','stillcuts.integration']]+['evidence/2026-11-05-production/task-4/task4-run.mjs']
    assert len(payload)==45 and len(set(payload))==45
    for rel in payload:
        p=S/rel
        assert not p.is_symlink() and stat.S_ISREG(p.lstat().st_mode)
        assert str(p.resolve())==str(p), f'Unexpected source symlink ancestry: {rel}'
        assert rel in expected and digest(p)==expected[rel], f'Reviewed source conflict: {rel}'
    status_docs=[]
    for rel,sha in r[receipts[3]]['statusDocumentsSha256'].items():
        actual=digest(S/rel)
        if rel in payload: assert actual==sha, f'Payload status-document conflict: {rel}'
        status_docs.append({'path':rel,'inPayload':rel in payload,'historicalReceiptSha256':sha,'currentSha256':actual,'matchesHistoricalReceipt':actual==sha,'action':'Preserve current source; install only if part of the reviewed 45-file payload.'})
    write_json('historical-status-documents.json',{'documents':status_docs,'reconciliation':'The non-payload RESULT.md at committed HEAD differs from its historical receipt. Preserve it and its current hash unchanged. Do not copy or relabel it. The earlier guard was broader than installation eligibility.'})
    for item in r[receipts[4]]['files']:
        assert digest(S/item['path'])==item['currentSha256'], f'Preserved source conflict: {item["path"]}'
    for rel in ['package.json','package-lock.json']: assert (S/rel).read_bytes()==(D/rel).read_bytes()
    before=scan(D,exclude=('node_modules',))
    oldfiles={p:x['sha256'] for p,x in before.items() if x['type']=='file'}
    assert len(oldfiles)==64 and oldfiles==r[receipts[2]]['installedFiles'], 'Installed content conflicts with protected-before receipt'
    assert not any(x['type']=='symlink' for x in before.values()), 'Unexpected installed symlink outside dependencies'
    replaced=sorted(set(payload)&set(oldfiles))
    assert replaced==['SKILL.md','references/direction.md','references/format.md','references/tools.md']
    write_json('installed-before.json',manifest(D,before))
    write_json('dependencies-before.json',dependencies())
    sourcepaths=set(payload)|set(r[receipts[3]]['statusDocumentsSha256'])|{x['path'] for x in r[receipts[4]]['files']}|set(receipts)|{'README.md'}
    write_json('source-before.json',{'root':str(S),'files':{p:digest(S/p) for p in sorted(sourcepaths)}})
    write_json('reviewed-inputs.json',{'receiptHashes':{p:digest(S/p) for p in receipts},'payload':{p:{'sha256':expected[p],'authority':authorities[p]} for p in payload}})
    backup=[]
    for rel,item in before.items():
        target=E/'backup/files'/rel
        if item['type']=='directory': target.mkdir(parents=True,exist_ok=True); continue
        target.parent.mkdir(parents=True,exist_ok=True)
        with (D/rel).open('rb') as src, target.open('xb') as out: shutil.copyfileobj(src,out)
        shutil.copystat(D/rel,target,follow_symlinks=False)
        assert digest(target)==item['sha256']
        assert (target.stat().st_dev,target.stat().st_ino)!=( (D/rel).stat().st_dev,(D/rel).stat().st_ino)
        backup.append({'path':rel,'sha256':item['sha256'],'size':item['size'],'independentCopy':True})
    write_json('backup/receipt.json',{'root':str(E/'backup/files'),'fileCount':len(backup),'bytes':sum(x['size'] for x in backup),'files':backup,'symlinks':[]})
    changes=[]; records=[]
    adapted_docs={'references/craft.md','references/direction.md','examples/stillcuts/README.md'}
    for rel in payload:
        original=(S/rel).read_bytes(); out=original
        if rel in DOCS:
            text=original.decode()
            def adapt(m):
                target=m.group(1); u=urlsplit(target)
                if u.scheme or u.netloc or not u.path: return m.group(0)
                assert not Path(u.path).is_absolute(), f'Unexpected preexisting absolute link: {target}'
                local=(D/rel).parent.joinpath(unquote(u.path)).resolve()
                packaged=local.is_relative_to(D) and local.relative_to(D).as_posix() in payload
                if packaged or local.exists(): return m.group(0)
                assert rel in adapted_docs, f'Unapproved adaptation document: {rel}'
                src=(S/rel).parent.joinpath(unquote(u.path)).resolve()
                assert src.is_relative_to(S) and src.relative_to(S).parts[0] in ['evidence','.direction','.superpowers']
                assert src.is_file() and not u.query
                replacement=str(src)+('#'+u.fragment if u.fragment else '')
                changes.append({'document':rel,'line':text.count('\n',0,m.start())+1,'oldTarget':target,'newTarget':replacement,'labelAndOtherTextUnchanged':True})
                return m.group(0)[:m.start(1)-m.start()]+replacement+m.group(0)[m.end(1)-m.start():]
            out=LINK.sub(adapt,text).encode()
        target=E/'stage'/rel; target.parent.mkdir(parents=True,exist_ok=True)
        with target.open('xb') as f: f.write(out)
        os.chmod(target,stat.S_IMODE((D/rel if rel in oldfiles else S/rel).stat().st_mode))
        records.append({'path':rel,'action':'replace' if rel in oldfiles else 'add','sourceSha256':data_hash(original),'installedSha256':data_hash(out),'bytes':len(out),'mode':oct(stat.S_IMODE(target.stat().st_mode)),'linkTargetsAdapted':out!=original})
    assert len(changes)==19 and sum(x['linkTargetsAdapted'] for x in records)==3
    assert scan(D,exclude=('node_modules',))==before, 'Destination changed during snapshot'
    assert dependencies()==json.loads((E/'dependencies-before.json').read_text()), 'Dependencies changed during snapshot'
    for rel in payload: assert digest(S/rel)==expected[rel], f'Source changed while staging: {rel}'
    write_json('link-adaptations.json',{'count':len(changes),'documents':sorted(adapted_docs),'changes':changes,'semantics':'Only Markdown target substrings changed; labels and all other bytes preserved.'})
    write_json('payload.json',{'count':len(records),'replacedCount':4,'addedCount':41,'files':records})
    write_json('links-staged.json',check_links(staged=True))
    write_json('prepared.json',{'at':datetime.now(timezone.utc).isoformat(),'status':'BACKED_UP_AND_STAGED','backupFileCount':64,'payloadFileCount':45,'sourcePayloadMatchesReviewedInputs':True,'destinationUnchanged':True})
    print(json.dumps({'status':'BACKED_UP_AND_STAGED','evidence':str(E),'backupFiles':64,'backupBytes':sum(x['size'] for x in backup),'stagedFiles':45,'replaced':4,'added':41,'linkAdaptations':len(changes),'links':json.loads((E/'links-staged.json').read_text())['localLinkCount']}))

if __name__=='__main__': prepare()
