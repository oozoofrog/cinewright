"""Original authored replacement contact poses. Stable planted shoes + lifted swings, not IK."""
import pathlib,json,math,hashlib,platform
base=pathlib.Path(__file__).resolve().parent;repo=base.parents[2];recipe=repo/'recipes/styles/line-wash/commuter.json'
s=json.loads(recipe.read_text());by={a['id']:a for a in s['strokes']}
# x is the ankle of the front outline edge. Each plant interval has identical paper coordinates.
left=[(0,634,0),(16,634,0),(26,717,32),(36,800,0),(56,800,0),(64,820,24),(72,840,0),(191,840,0)]
right=[(0,788,0),(8,824,30),(16,860,0),(36,860,0),(46,900,32),(56,940,0),(72,940,0),(191,940,0)]
def sample(keys,f):
 if f>=keys[-1][0]:return keys[-1][1:]
 for a,b in zip(keys,keys[1:]):
  if a[0]<=f<=b[0]:
   t=(f-a[0])/(b[0]-a[0]);return(a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t)
def travel(f):return 65*f/36 if f<=36 else 65+75*min(1,(f-36)/36)
frames=sorted(set([k[0]for k in left+right]+[36,72,191]))
for side,keys in [('left',left),('right',right)]:
 shoe=by['shoe'+side];rest=[p[:]for p in shoe['points']];x0=rest[0][0];shoe['bank']=[]
 leg=by['leg'+side];final=leg['points'];leg['bank']=[]
 fold=by['trouser-fold'+(''if side=='left'else'2')];fold['bank']=[]
 for f in frames:
  x,lift=sample(keys,f);shoePoints=[[px+x-x0,py-lift,p]for px,py,p in rest];shoe['bank'].append({'frame':f,'points':shoePoints})
  hipA=[final[0][0]-140+travel(f),final[0][1],final[0][2]];hipB=[final[-1][0]-140+travel(f),final[-1][1],final[-1][2]]
  ankleA=shoePoints[0];ankleB=shoePoints[-1];kneeA=[(hipA[0]+ankleA[0])/2+lift*.25,738-lift*.3,.8];kneeB=[(hipB[0]+ankleB[0])/2+lift*.25,738-lift*.3,.8]
  leg['bank'].append({'frame':f,'points':[hipA,kneeA,ankleA,ankleB,kneeB,hipB]})
  fold['bank'].append({'frame':f,'points':[[(hipA[0]+hipB[0])/2,675,.2],[(kneeA[0]+kneeB[0])/2,730-lift*.25,.4],[(kneeA[0]+kneeB[0]+ankleA[0]+ankleB[0])/4,770-lift*.6,.2]]})
 for obj in [shoe,leg,fold]:obj['every']=2;obj['mode']='linear'
s['contacts']={'type':'authored-paper-space-plants','left':[[0,16],[36,56],[72,192]],'right':[[16,36],[56,192]],'swingLiftPx':[24,32],'solver':'none; matching shoe/ankle points authored'}
recipe.write_text(json.dumps(s,indent=2)+'\n')
a=base/'assets/authored-strokes.json';data=json.loads(a.read_text());data['commuter']=s['strokes'];a.write_text(json.dumps(data,indent=2)+'\n');p=base/'assets/provenance.json';meta=json.loads(p.read_text());meta['sha256']=hashlib.sha256(a.read_bytes()).hexdigest();meta['tool']='Python '+platform.python_version()+' stdlib';meta['clip']='24fps, 192 frames, nonloop; planted shoe ranges in scene.contacts; lifted swings and matching ankle outlines, no IK';meta['contactAuthoring']='author-contact.py, original CC0 replacement points';p.write_text(json.dumps(meta,indent=2)+'\n')
