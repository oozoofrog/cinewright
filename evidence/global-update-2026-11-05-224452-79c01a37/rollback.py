"""Explicit, guarded rollback for this one installation. Not executed during installation."""
from pathlib import Path
import argparse, hashlib, json, os, stat, tempfile
from datetime import datetime,timezone
E=Path(__file__).resolve().parent
D=Path('/Users/oozoofrog/.codex/skills/cinewright')

def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply',action='store_true',help='Restore exactly four replaced files and remove exactly41 added payload files after all guards pass.')
    args=parser.parse_args()
    assert D.resolve()==D and D.is_dir() and not D.is_symlink()
    payload=json.loads((E/'payload.json').read_text())['files']
    original=json.loads((E/'installed-before.json').read_text())['entries']
    assert len(payload)==45
    added=[x for x in payload if x['action']=='add']; replaced=[x for x in payload if x['action']=='replace']
    assert len(added)==41 and len(replaced)==4
    def check_installed(item):
        p=D/item['path']
        assert p.resolve()==p and p.is_file() and not p.is_symlink(), f'Unexpected target shape: {p}'
        assert digest(p)==item['installedSha256'], f'Changed after installation; refusing rollback: {p}'
    for item in payload: check_installed(item)
    for item in replaced:
        p=E/'backup/files'/item['path']
        assert p.is_file() and not p.is_symlink()
        assert digest(p)==original[item['path']]['sha256'], f'Backup changed: {p}'
    operations={'restore':[x['path'] for x in replaced],'remove':[x['path'] for x in added],'preserve':'All other files, node_modules, directories and .direction/test-runs validation records.'}
    if not args.apply:
        print(json.dumps({'status':'CHECK_ONLY','operations':operations},ensure_ascii=False,indent=2)); return
    records=[]
    # Restore the previous entry point before removing the newly referenced helpers.
    replaced.sort(key=lambda x:(x['path']!='SKILL.md',x['path']))
    for item in replaced:
        rel=item['path']; p=D/rel; check_installed(item)
        fd,tmp=tempfile.mkstemp(prefix='.'+p.name+'.rollback-',dir=p.parent)
        with os.fdopen(fd,'wb') as f:
            f.write((E/'backup/files'/rel).read_bytes()); f.flush(); os.fsync(f.fileno()); os.fchmod(f.fileno(),int(original[rel]['mode'],8))
        check_installed(item); os.replace(tmp,p)
        assert digest(p)==original[rel]['sha256']
        records.append({'path':rel,'action':'restored','sha256':original[rel]['sha256']})
    for item in added:
        check_installed(item); (D/item['path']).unlink()
        records.append({'path':item['path'],'action':'removed-exact-installed-payload'})
    receipt=E/('rollback-executed-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')+'.json')
    with receipt.open('x') as f:json.dump({'at':datetime.now(timezone.utc).isoformat(),'operations':records},f,ensure_ascii=False,indent=2);f.write('\n')
    print(str(receipt))

if __name__=='__main__':main()
