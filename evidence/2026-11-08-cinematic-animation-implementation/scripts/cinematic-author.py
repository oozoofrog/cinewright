"""Deterministic scene authoring from preserved work-in-progress baseline. No original media writes."""
import json,pathlib,math,copy
root=pathlib.Path(__file__).resolve().parents[3];base=root/'evidence/2026-11-08-cinematic-animation-implementation/baseline'
def load(style,name):return json.loads((base/f'recipes/styles/{style}/{name}.json').read_text())
def save(s,name):
 p=root/f'recipes/styles/{s["style"]}/{name}.json';p.write_text(json.dumps(s,indent=2)+'\n')
def mix(a,b,t):return [mix(x,y,t)if isinstance(x,(list,tuple))else x+(y-x)*t for x,y in zip(a,b)]
def sample(bank,f):
 if f<=bank[0]['frame']:return copy.deepcopy(bank[0]['points'])
 for a,b in zip(bank,bank[1:]):
  if a['frame']<=f<=b['frame']:return mix(a['points'],b['points'],(f-a['frame'])/(b['frame']-a['frame']))
 return copy.deepcopy(bank[-1]['points'])
def val(keys,f):return sample([{'frame':k[0],'points':[k[1:]]} for k in keys],f)[0]
def smooth(a,b,f):
 t=max(0,min(1,(f-a)/(b-a)));return t*t*(3-2*t)
def points(xy):return [[x,y,.65]for x,y in xy]
s=load('line-wash','commuter');by={a['id']:a for a in s['strokes']};old=copy.deepcopy(by)
frames=list(range(192));face=['head','hair','face','eye','brow','ear']
for a in s['strokes']:
 if a['id'].startswith('shoe') or a['id']in ['folded','letter','fold','writing','handleft','handright','armleft','armright','cuff']:continue
 if not a.get('bank'):continue
 bank=[]
 for f in frames:
  p=sample(old[a['id']]['bank'],f)
  oldtravel=65*f/36 if f<=36 else 65+75*min(1,(f-36)/36)
  travel,dy,lean=val([(0,0,0,0),(36,65,0,0),(56,121,1,.015),(64,136,6,.03),(72,143,9,.025),(82,140,4,.01),(88,140,0,0),(191,140,0,0)],f)
  dx=travel-oldtravel
  for i,v in enumerate(p):
   if a['id'].startswith('leg'):
    if i in [2,3]:continue # exact original ankle/shoe contacts
    influence=1 if i in [0,5]else .45;v[0]+=dx*influence;v[1]+=dy*influence
   elif a['id'].startswith('trouser'):v[0]+=dx*.5;v[1]+=dy*.5
   else:v[0]+=dx+lean*(650-v[1]);v[1]+=dy
  if a['id']in face:
   angle=.68*smooth(100,150,f);cx,cy=865,268
   for v in p:
    x,y=v[0]-cx,v[1]-cy;v[0]=cx+x*math.cos(angle)-y*math.sin(angle)+12*smooth(100,150,f);v[1]=cy+x*math.sin(angle)+y*math.cos(angle)
  bank.append({'frame':f,'points':p})
 a.update(bank=bank,every=2 if a['id'].startswith(('leg','trouser'))else 1,clock='frame',mode='linear',boil=0)
 a['to']=18 if a['from']==0 else 38
# One geometric paper, two persistent contacts. No draw-on replacement of folded/open paper.
letterbank=[];foldbank=[];handbanks={'left':[],'right':[]};armbanks={'left':[],'right':[]}
for f in frames:
 opening=smooth(106,140,f);lift=48*smooth(140,156,f);left=[1020,510-lift];right=[1020+190*opening,390-lift-10*opening]
 paper=points([[1020,390-lift],[1115,382-lift],[right[0],right[1]],[right[0],right[1]+120],[1115,502-lift],left,[1020,390-lift]])
 letterbank.append({'frame':f,'points':paper});foldbank.append({'frame':f,'points':points([[1115,382-lift],[1115,502-lift]])})
 for side,contact in [('left',left),('right',right)]:
  reach=smooth(82,102,f) if side=='left'else smooth(76,94,f)
  initial=sample(old['hand'+side]['bank'],min(f,72))[0][:2]
  c=[initial[i]+(contact[i]-initial[i])*reach for i in range(2)]
  # Thumb follows the lower paper corner; fingers curl around its outer edge.
  sign=-1 if side=='left'else 1
  hand=points([[c[0]-sign*10,c[1]+12],[c[0]+sign*10,c[1]+9],[c[0]+sign*13,c[1]-7],c,[c[0]-sign*8,c[1]-8]])
  handbanks[side].append({'frame':f,'points':hand})
  start=sample(old['arm'+side]['bank'],min(f,72));shoulder=start[0]
  target=points([[shoulder[0],shoulder[1]],[850 if side=='left'else 990,425 if side=='left'else 325],[c[0]-30,c[1]+20 if side=='left'else c[1]-24],hand[0][:2]])
  armbanks[side].append({'frame':f,'points':mix(start,target,reach)})
for side in ['left','right']:
 for kind,banks in [('hand',handbanks),('arm',armbanks)]:by[kind+side].update(points=banks[side][0]['points'],bank=banks[side],every=1,clock='frame',mode='linear',boil=0,to=18)
by['letter'].update(points=letterbank[0]['points'],bank=letterbank,**{'from':80,'to':88},every=1,clock='frame',mode='linear')
by['fold'].update(points=foldbank[0]['points'],bank=foldbank,**{'from':80,'to':88},every=1,clock='frame',mode='linear')
by['writing'].update(points=points([[1039,406],[1062,402],[1082,405]]),**{'from':158,'to':172})
s['strokes']=[a for a in s['strokes']if a['id']not in ['folded','cuff']]
s['erasures']=[]
# Paper goes under hands. Same edge remains in contact throughout every frame.
s['strokes'].sort(key=lambda a: 1 if a['id'].startswith('hand')else 0)
coat=by['coat']['bank'];washbank=[]
for k in coat:
 # Selected outline vertices preserve lapel white, add consistent right/down offset.
 p=k['points'];washbank.append({'frame':k['frame'],'points':[[x+8,y+8]for x,y,*_ in p[1:8]]})
s['washes'][1].update(points=washbank[0]['points'],bank=washbank,every=1,mode='linear',edge=.045,alpha=.16,to=38)
s['washes'][2].update(points=[p[:2]for p in letterbank[0]['points']],bank=[{'frame':k['frame'],'points':[p[:2]for p in k['points']]}for k in letterbank],**{'from':80,'to':88},edge=.025,alpha=.12)
s['shotBeats']={'stop':[56,88],'grasp':[89,104],'unfold':[105,140],'read':[141,191],'contacts':'left thumb=letter point 5; right thumb=letter point 2; both at hand point 3 after f102','hinge':'vertical paper points 1 and 4'}
save(s,'commuter')
s=load('line-wash','rain')
for i,id in enumerate(['leaf1','leaf2']):
 a=next(a for a in s['strokes']if a['id']==id)
 if a.get('points'):p=a['points']
 else:
  p=[]
  for seg in a['segments']:
   for j in range(9):
    t=j/8;p.append([sum(seg[k][c]*[ (1-t)**3,3*(1-t)**2*t,3*(1-t)*t*t,t**3][k]for k in range(4))for c in range(3)])
 s['washes'][i+1].update(points=[[v[0]+6,v[1]+3]for v in p],alpha=.18,edge=.035)
save(s,'rain')
s=load('silhouette-theatre','forest');objs={o['id']:o for p in s['planes']for o in p['objects']}
for name,stop,start in [('hare',60,112),('fox',78,138)]:
 o=objs[name];oldposes=copy.deepcopy(o['poses']);keys=[]
 for f in range(0,192,2):
  # Existing walk retained until a deliberate planted hold; distinct anticipations.
  if f<stop-12:pose=copy.deepcopy(min(oldposes,key=lambda k:abs(k['frame']-f))['pose'])
  else:
   pose={b['id']:0 for b in o['rig']['bones']};look=smooth(stop-12,stop+12,f)*(1-smooth(start-12,start+10,f));pose['head']=(-.48 if name=='hare'else .4)*look;pose['tail']=(-.5 if name=='hare'else .5)*look
   pose['front']=(-.7 if name=='hare'else -.12)*look;pose['frontFoot']=.65*look;pose['rear']=.13*look
   if f>start:
    phase=(f-start)*math.pi/12;fade=1-smooth(172,188,f);pose['front']=.4*math.sin(phase)*fade;pose['rear']=-pose['front'];pose['frontFoot']=-.3*math.sin(phase)*fade;pose['rearFoot']=-pose['frontFoot']
  keys.append({'frame':f,'pose':pose})
 o['poses']=keys;o['clock']='frame';o['every']=1
 if name=='hare':o['keys']=[{'frame':f,'x':x,'y':790,'scale':.9}for f,x in [(0,1030),(40,1150),(52,1175),(60,1180),(112,1180),(140,1270),(176,1375),(191,1385)]]
 else:o['keys']=[{'frame':f,'x':x,'y':748,'scale':1.15}for f,x in [(0,620),(48,780),(64,810),(78,818),(138,818),(176,925),(191,940)]]
objs['fox-shadow']['keys']=[dict(k,y=856,scale=1.7)for k in objs['fox']['keys']]
s['shotBeats']={'leader':'hare','follower':'fox','look':[60,112],'choice':126,'delayedFollow':138};save(s,'forest')
s=load('silhouette-theatre','harbor');objs={o['id']:o for p in s['planes']for o in p['objects']}
objs['ship']['keys']=[{'frame':f,'x':x,'y':y,'rotation':r,'scale':.9}for f,x,y,r in [(0,400,805,-.025),(64,680,790,.025),(88,770,780,.01),(120,850,768,-.008),(144,875,764,0),(164,880,764,0),(191,880,764,0)]]
objs['beam']['keys']=[{'frame':f,'x':1350,'y':335,'rotation':r}for f,r in [(0,-.15),(64,-.64),(88,-.64),(144,-.74),(191,-.74)]]
s['shotBeats']={'lightHolds':[64,88],'boatResponds':[88,144],'moored':[164,191]};save(s,'harbor')
# NPR: scalar controls and local authored geometry, no new shader feature.
for name in ['station','laboratory']:
 s=load('expressionist-space',name);m=s['materials'];m['stone'].update(hatch=2,strength=.09,tones=[.35,.58,.8,1]);m['chalk'].update(hatch=1,strength=.06);m['dark'].update(hatch=2,strength=.14);m['brass'].update(hatch=2,strength=.18);m['leaf'].update(hatch=0,strength=0,tones=[.24,.48,.75,1]);m['paper'].update(hatch=0,strength=0)
 s['lights'][0]['intensity']=.9
 if name=='station':
  o=next(o for o in s['objects']if o['id']=='traveler');o.pop('visible',None);o['asset']='assets/traveler-readable.glb';o.update(time='frame',exposure={'every':1});o['clip']['exposure']={'every':1}
  o['keys']=[{'frame':f,'position':p}for f,p in [(0,[-2.3,0,-14.15]),(70,[-2.3,0,-14.15]),(82,[-1.55,0,-14.15]),(94,[-.55,0,-13.8]),(104,[.15,0,-12.7]),(144,[.65,0,-6.6]),(156,[.7,0,-6]),(191,[.7,0,-6])]]
  # Real opaque occluder in front of the hidden start; body and case traverse its right edge.
  s['objects'].append({'id':'door-jamb-occluder','geometry':{'type':'box','args':[2.4,4.1,.3]},'position':[-2.45,2,-13.7],'material':'chalk'})
  # Clear light plane behind the walking route, not a screen overlay.
  m['quiet']={'color':'#e5ddbe','hatch':0,'strength':0,'tones':[.6,.8,1]}
  next(x for x in s['objects']if x['id']=='door-light')['material']='quiet'
  for x in s['objects']:
   if x['id'].startswith('floor-seam'):x['material']='stone'
  s['shotBeats']={'shadow':'original preserved','emergence':[72,104],'settle':[144,156],'train':'original f112 approach preserved'}
 else:
  m['wood']={'color':'#c7a678','hatch':0,'strength':0,'tones':[.3,.55,.8,1]};m['ceramic']={'color':'#b9a182','hatch':1.5,'strength':.23};m['bottle']={'color':'#bfd3c6','hatch':0,'strength':0,'tones':[.3,.55,.85,1]}
  for x in s['objects']:
   if x['id']=='main-pot':x['material']='ceramic'
   if x['id']in ['bench-top','stool']:x['material']='wood'
   if x['id']=='specimen' or x['id'].startswith('bottle'):x['material']='bottle'
   if x['id'].startswith('leaf-'):
    # Reproject secondary vein vertices onto the actual leaf surface.
    g=x['geometry'];L,W,B=g['length'],g['width'],g['bend']
    for line in x.get('lines',[]):
     for p in line['points']:
      u=p[1]/L;v=p[0]/max(.00001,W*math.sin(math.pi*u)**.8);p[2]=B*u*u+abs(v)*.18*math.sin(math.pi*u)+.012
   if x['id']=='bench-top':
    x['lines']=[{'points':[[xx,.115,zz+.025*math.sin(xx*2+zz)]for xx in [-3.8,-2,-.5,1,2.8,3.8]],'color':'#917657'}for zz in [-1.2,-.8,-.4,0,.4,.8,1.2]]
  for light in s['lights']:
   if light.get('gobo'):light['intensity']*=.3
  s['shotBeats']={'focus':'leaf cluster first, bottle second, wood support; still life hold preserved'}
 save(s,name)
