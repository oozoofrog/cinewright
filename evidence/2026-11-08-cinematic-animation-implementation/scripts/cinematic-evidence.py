"""Extract immutable-source comparisons. Offline frame analysis, never a realtime-viewing claim."""
import json,pathlib,hashlib,subprocess,sys
from PIL import Image,ImageDraw,ImageOps
R=pathlib.Path(__file__).resolve().parents[1];E=R/'evidence/cinematic-animation-implementation-2026-11-08'
manifest=json.loads((R/'evidence/cinematic-animation-review-2026-11-08/manifest.json').read_text())
clips={c['id']:c for c in manifest['clips']};ids=sys.argv[1:] or ['S01','S02','S03','S04','S05','S06','P01','P02','P03']
frames={'S01':[24,72,100,126,156,178],'S02':[60,88,144,178,191],'S03':[24,120,156],'S04':[44,72,88,100,126,156],'S05':[70,80,87,88,94,104,156,174],'S06':[48,120,156],'P01':[24,72,144],'P02':[24,72,144],'P03':[24,54,64,69,120]}
windows={'S01':[(48,83),(100,143)],'S02':[(64,99),(144,179)],'S03':[(108,131)],'S04':[(56,87),(88,155)],'S05':[(70,105),(144,179)],'S06':[(108,131)],'P01':[(20,35),(60,83),(132,155)],'P02':[(20,35),(60,83),(132,155)],'P03':[(48,71)]}
crops={'S01':(650,480,1450,900),'S02':(600,430,1450,1000),'S03':(950,220,1480,600),'S04':(740,120,1250,600),'S05':(750,250,1350,750),'S06':(650,120,1350,800),'P01':(550,250,1150,850),'P02':(450,200,1500,900),'P03':(800,290,1350,650)}
def run(args):subprocess.run(args,check=True,stdout=subprocess.DEVNULL)
def sheet(items,out,width=480,cols=3,crop=None):
 images=[]
 for p,label in items:
  im=Image.open(p).convert('RGB')
  if crop:im=im.crop(crop)
  im.thumbnail((width,270 if not crop else 320));images.append((im,label))
 h=max(im.height for im,_ in images)+25;canvas=Image.new('RGB',(width*cols,h*((len(images)+cols-1)//cols)),'#ddd');draw=ImageDraw.Draw(canvas)
 for i,(im,label)in enumerate(images):x=i%cols*width;y=i//cols*h;canvas.paste(im,(x,y+25));draw.text((x+5,y+5),label,fill='black')
 canvas.save(out,quality=94)
rows=[]
for id in ids:
 out=E/id;after=E/('P03-designed'if id=='P03'else id);before=out/'before-native24';before.mkdir(parents=True,exist_ok=True)
 run(['ffmpeg','-y','-v','error','-i',clips[id]['video'],'-q:v','2','-start_number','0',str(before/'f%03d.jpg')])
 # Every native frame exists on both sides, even outside contact-sheet windows.
 assert len(list(before.glob('f*.jpg')))==192;assert len(list((after/'video').glob('f*.jpg')))==192
 comparison=out/'comparison';comparison.mkdir(exist_ok=True)
 for f in frames[id]:
  b=before/f'f{f:03}.jpg';a=after/'stills'/f'f{f:03}.png'
  if not a.exists():a=after/'video'/f'f{f:03}.jpg'
  for scale in [.25,.5,1]:
   w,h=int(1920*scale),int(1080*scale)
   for gray in [False,True] if scale==.25 else [False]:
    panel=Image.new('RGB',(w*2,h+24),'#ddd');d=ImageDraw.Draw(panel)
    for i,p in enumerate([b,a]):
     im=Image.open(p).convert('RGB').resize((w,h),Image.Resampling.LANCZOS)
     if gray:im=ImageOps.grayscale(im).convert('RGB')
     panel.paste(im,(w*i,24));d.text((w*i+8,6),f'{id} f{f} / '+('BEFORE'if i==0 else'AFTER'),fill='black')
    panel.save(comparison/f'f{f:03}-{int(scale*100)}{"-gray"if gray else""}.jpg',quality=96)
 sheet([(after/'stills'/f'f{f:03}.png',f'{id} after f{f}')for f in frames[id]],comparison/'key-poses.jpg')
 for lo,hi in windows[id]:
  for start in range(lo,hi+1,12):
   stop=min(start+11,hi);items=[(after/'video'/f'f{f:03}.jpg',f'{id} f{f} {f/24:.3f}s')for f in range(start,stop+1)]
   sheet(items,comparison/f'native24-f{start:03}-{stop:03}.jpg',width=400,cols=4,crop=crops[id])
 # 2x1920 side-by-side keeps both sources at native size and rate.
 run(['ffmpeg','-y','-v','error','-i',clips[id]['video'],'-i',str(after/'1080p24.mp4'),'-filter_complex','[0:v][1:v]hstack=inputs=2[v]','-map','[v]','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(comparison/'before-after-native24.mp4')])
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate,nb_read_frames','-of','json',str(after/'1080p24.mp4')]))
 rows.append({'id':id,'original':clips[id]['video'],'after':str(after/'1080p24.mp4'),'metadata':probe['streams'][0],'native24Windows':windows[id],'comparison':str(comparison),'allBeforeFrames':192,'allAfterFrames':192})
 print(id,'comparison complete',flush=True)
if sys.argv[1:] and (E/'comparison-manifest.json').exists():
 rows=[r for r in json.loads((E/'comparison-manifest.json').read_text())['clips']if r['id']not in ids]+rows
(E/'comparison-manifest.json').write_text(json.dumps({'method':'offline frame extraction/canvas seek, no realtime viewing','clips':rows},indent=2))
# Verify all fifteen originals, including untouched non-targets.
integrity=[{'id':c['id'],'expected':c['sha256'],'actual':hashlib.sha256(pathlib.Path(c['video']).read_bytes()).hexdigest()}for c in manifest['clips']]
assert all(c['expected']==c['actual']for c in integrity)
(E/'original-integrity.json').write_text(json.dumps(integrity,indent=2))
