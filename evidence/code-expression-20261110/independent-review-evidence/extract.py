from pathlib import Path
import subprocess,json,hashlib,math
from PIL import Image,ImageDraw
root=Path('evidence/code-expression-20261110'); out=root/'independent-review-evidence'
paths=[root/'delivery'/f'{n}.mp4' for n in ('cups','doorway','fold')]+[root/f'{n}.mp4' for n in ('without-traces','without-first-visit')]
manifest=[]
for p in paths:
 meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:v:0','-vf','scale=480:270','-f','rawvideo','-pix_fmt','rgb24','-'])
 size=480*270*3; frames=[Image.frombytes('RGB',(480,270),raw[i:i+size]) for i in range(0,len(raw),size)]
 def sheet(ids,label,cols=4):
  s=Image.new('RGB',(cols*480,math.ceil(len(ids)/cols)*294),'#ddd'); d=ImageDraw.Draw(s)
  for j,i in enumerate(ids):
   x=j%cols*480;y=j//cols*294;s.paste(frames[i],(x,y));d.text((x+8,y+273),f'{p.stem} frame {i} t={i/24:.4f}s',fill='black')
  s.save(out/f'{p.stem}-{label}.jpg',quality=90)
 ids=list(range(0,len(frames),12))+[len(frames)-1]
 for k in range(0,len(ids),20):sheet(ids[k:k+20],f'overview-{k//20+1}')
 ranges={'cups':[(58,66),(261,273),(375,387)],'doorway':[(114,126)],'fold':[(108,120),(192,204)]}.get(p.stem,[])
 for a,b in ranges:sheet(list(range(a,b)),f'consecutive-{a}-{b-1}')
 manifest.append({'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'decoded_frames':len(frames),'metadata':meta})
 print(p,len(frames))
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
