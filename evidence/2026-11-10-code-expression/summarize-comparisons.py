from PIL import Image,ImageChops,ImageDraw
import json,os,hashlib
root='evidence/2026-11-10-code-expression'
read=lambda p:json.load(open(root+'/'+p))
results=read('delivery/results.json')['results'];comparisons=read('comparisons.json');draft=read('draft-render.json');oldfold=read('fold-r1.json')
frame=lambda output,f:os.path.dirname(output)+'/frames/'+str(f).zfill(7)+'.png'
pairs=[('cups-trace-revision',draft['output'],results[0]['canonicalOutput'],320),('fold-shadow-revision',oldfold['canonicalOutput'],comparisons[0]['output'],156),('without-traces',results[0]['canonicalOutput'],comparisons[1]['output'],320),('without-first-visit',results[0]['canonicalOutput'],comparisons[2]['output'],479)]
rows=[]
for label,a,b,f in pairs:
 x=Image.open(frame(a,f)).convert('RGB');y=Image.open(frame(b,f)).convert('RGB');diff=ImageChops.difference(x,y)
 rows.append({'comparison':label,'frame':f,'changedBounds':diff.getbbox(),'changedPixels':sum(1 for v in diff.getdata() if v!=(0,0,0)),'a':frame(a,f),'b':frame(b,f)})
json.dump(rows,open(root+'/pixel-comparisons.json','w'),indent=2)
canvas=Image.new('RGB',(960,1200),'#f1eadc');d=ImageDraw.Draw(canvas)
for row,(result,frames) in enumerate(zip(results,[[0,120,240,320,384,479],[0,48,84,119,120,239],[0,72,120,156,216,287]])):
 d.text((10,row*400+7),result['name']+' / frames '+', '.join(str(x) for x in frames),fill='#172c37')
 for j,f in enumerate(frames):
  im=Image.open(frame(result['canonicalOutput'],f));im.thumbnail((320,180));canvas.paste(im,((j%3)*320,row*400+30+(j//3)*180))
canvas.save(root+'/time-structure.png')
