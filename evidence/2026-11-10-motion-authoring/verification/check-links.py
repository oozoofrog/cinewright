from pathlib import Path
import re,json,urllib.parse
root=Path.cwd();scope=['SKILL.md','skills/cinewright/SKILL.md']+[f'references/{x}.md' for x in ['craft-execution','craft','direction','format','music','stillcuts','pose-tracks']]+['docs/implementation/2026-11-10-motion-authoring/README.md','evidence/2026-11-10-motion-authoring/plans/comparison.md']
def clean(s):
 return re.sub(r'```.*?```','',s,flags=re.S)
def anchors(s):
 counts={};out=set()
 for h in re.findall(r'^#{1,6}\s+(.+?)\s*#*$',clean(s),flags=re.M):
  h=re.sub(r'\[([^]]+)\]\([^)]*\)',r'\1',h)
  slug=re.sub(r'[^\w\- ]','',h.lower()).replace(' ','-')
  n=counts.get(slug,0);counts[slug]=n+1;out.add(slug+(f'-{n}' if n else ''))
 return out
results=[]
for name in scope:
 path=root/name;s=path.read_text()
 for m in re.finditer(r'\[[^\]]*\]\(([^)\s]+)\)',clean(s)):
  link=m[1].strip('<>')
  if re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:',link) or link.startswith('/'):continue
  dest,sep,anchor=urllib.parse.unquote(link).partition('#');target=(path.parent/dest).resolve() if dest else path
  ok=target.exists();reason='' if ok else 'missing target'
  if ok and sep and target.suffix=='.md' and anchor not in anchors(target.read_text()):ok=False;reason='missing heading anchor'
  results.append({'source':name,'line':s[:m.start()].count('\n')+1,'link':link,'ok':ok,'reason':reason})
report={'scope':scope,'checked':len(results),'failures':[r for r in results if not r['ok']],'results':results,'limits':'Inline relative Markdown links and heading anchors in listed documents only; external URLs not fetched.'}
Path('evidence/2026-11-10-motion-authoring/verification/links.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['checked','failures','limits']},ensure_ascii=False,indent=2))
raise SystemExit(bool(report['failures']))
