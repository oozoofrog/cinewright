"""Original authored cut-paper control curves, CC0; regenerate JSON, no renderer code."""
import pathlib,json,math,hashlib,platform
base=pathlib.Path(__file__).resolve().parent; repo=base.parents[2]; assets=base/'assets'; recipes=repo/'recipes/styles/silhouette-theatre'
def shape(p,fill=None,**kw): return {'path':p,'fillRule':'evenodd',**({'fill':fill}if fill else {}),**kw}
shapes={
'fox-body':shape('M-118 -67 C-145 -63 -158 -34 -126 -10 C-81 12 -20 17 36 -12 C62 -30 56 -60 26 -72 C-21 -83 -76 -77 -118 -67 Z M-105 -58 Q-78 -67 -58 -56 Q-83 -60 -105 -51 Z'),
'fox-head':shape('M-22 -43 L-27 -105 L6 -78 L33 -109 L45 -48 L100 -19 L63 -8 L44 9 Q4 20 -22 -13 Z M26 -41 Q32 -48 39 -42 Q33 -33 26 -41 Z M58 -20 L75 -19 L65 -15 Z'),
'fox-tail':shape('M0 -12 C-63 -56 -117 -45 -147 4 C-172 46 -185 48 -214 29 C-200 96 -146 92 -97 47 C-59 11 -26 32 0 16 Z M-170 47 L-180 55 L-164 70 L-154 60 Z'),
'fox-upper':shape('M-15 -4 Q-30 24 -19 63 L7 69 L18 20 L13 -5 Z'),
'fox-lower':shape('M-15 -2 L11 -2 L8 46 L37 56 Q42 65 27 67 L-17 61 Z'),
'hare-body':shape('M-85 -70 C-134 -68 -147 -26 -107 -6 C-58 15 -2 19 28 -15 C52 -50 14 -87 -26 -82 Z'),
'hare-head':shape('M-25 -22 C-59 -55 -48 -69 -27 -57 C-58 -141 -35 -175 -18 -104 L0 -67 C-5 -153 21 -171 22 -104 L14 -48 Q49 -42 61 -17 L82 -8 L54 3 C22 26 -11 18 -25 -22 Z M23 -27 Q28 -33 33 -27 Q28 -20 23 -27 Z M-24 -89 L-30 -128 Q-19 -112 -16 -91 Z M9 -91 L12 -127 L15 -91 Z'),
'hare-upper':shape('M-24 -13 Q-51 14 -31 44 L15 35 L25 4 Z'),
'hare-lower':shape('M-19 -5 L12 -6 L20 25 L63 34 Q73 45 48 48 L-24 41 Z'),
'hare-tail':shape('M0 0 C-24 -34 -52 -9 -37 11 C-24 26 -2 25 0 0 Z'),
'lighthouse':shape('M-73 0 L-47 -280 L-65 -291 L-65 -307 L-48 -312 L-48 -365 L-68 -366 L0 -413 L68 -366 L48 -365 L48 -312 L65 -307 L65 -291 L47 -280 L73 0 Z M-27 -353 L-27 -319 L27 -319 L27 -353 Z M-13 -253 L-17 -221 L12 -221 L10 -253 Z M-20 -155 L-23 -122 L17 -122 L15 -155 Z M-18 0 L-18 -55 Q0 -80 18 -55 L18 0 Z'),
'ship':shape('M-180 -22 Q-40 -4 175 -45 L136 9 Q52 64 -112 30 Z M-27 -34 L-27 -250 L-19 -250 L-19 -34 Z M-36 -236 Q-124 -175 -150 -54 L-36 -65 Z M-9 -233 L-9 -75 L137 -76 Q80 -177 -9 -233 Z M-115 3 A9 9 0 1 0 -97 3 A9 9 0 1 0 -115 3 Z M-65 12 A9 9 0 1 0 -47 12 A9 9 0 1 0 -65 12 Z M-15 16 A9 9 0 1 0 3 16 A9 9 0 1 0 -15 16 Z M35 14 A9 9 0 1 0 53 14 A9 9 0 1 0 35 14 Z'),
'beam':shape('M0 0 L-1160 -205 Q-1190 0 -1160 205 Z','#ffe8aa45',edge=False),
'mountain':shape('M-250 1080 L-250 690 Q100 460 360 630 Q610 350 840 600 Q1150 370 1420 620 Q1670 440 2180 600 L2180 1180 Z','#747e7d'),
'ground':shape('M-300 835 Q100 774 420 819 Q700 776 1000 814 Q1450 743 2200 802 L2200 1250 L-300 1250 Z','#627475'),
'harbor-cliff':shape('M-160 0 L-120 -41 L-75 -25 L-57 -60 L21 -29 L61 -40 L146 -6 L220 220 L-260 220 Z'),
'star':shape('M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z','#ffedbb',edge=False),
}
# Intricate branch silhouettes with negative-space cuts, each curve deliberately authored.
for side in ['left','right']:
 p='M-250 1180 L-230 -200 L230 -200 Q270 130 209 305 Q178 406 255 523 L367 427 L414 352 L386 466 L314 573 Q270 612 285 706 L388 657 L455 602 L430 690 L305 767 L353 1180 Z M92 258 Q162 320 132 411 Q102 368 92 258 Z M102 482 Q179 521 162 594 Q100 562 102 482 Z'
 for x,y in [(250,350),(287,430),(352,440),(326,550),(388,650),(257,245),(214,137)]:
  p+=f'M{x} {y} q-48 -94 -82 -53 q5 55 82 53 Z M{x} {y} q74 -66 98 -31 q-25 47 -98 31 Z '
 shapes['tree-'+side]=shape(p,'#101c23')
# Ferns occupy foreground; curled stems and tapered leaves, not rectangles.
fern='M0 120 Q-20 -20 -100 -123 Q-13 -56 10 120 Z '
for j in range(8):
 y=95-j*24;x=-j*j*1.4
 fern+=f'M{x} {y} q-85 -55 -102 -19 q23 34 102 19 Z M{x} {y} q62 -77 83 -50 q-5 36 -83 50 Z '
shapes['fern']=shape(fern)
wave='M-300 0 '
for x in range(-300,2200,180): wave+=f'Q{x+45} -42 {x+90} 0 Q{x+135} 38 {x+180} 0 '
wave+='L2400 450 L-300 450 Z'
shapes['wave']=shape(wave)
def obj(id,typ='shape',**kw):return {'id':id,'type':typ,**kw}
def key(f,x=0,y=0,**kw):return {'frame':f,'x':x,'y':y,**kw}
def puppet(id,animal,x,y,scale,phase):
 bones=[{'id':'body','pivot':[0,0],'shape':animal+'-body'},{'id':'tail','parent':'body','pivot':[-119,-27]if animal=='fox'else[-112,-36],'shape':animal+'-tail','limits':[-.7,.7]},{'id':'rear','parent':'body','pivot':[-94,-22],'shape':animal+'-upper','limits':[-1.2,1.2]},{'id':'rearFoot','parent':'rear','pivot':[0,54]if animal=='fox'else[0,32],'shape':animal+'-lower','limits':[-1,1]},{'id':'front','parent':'body','pivot':[10,-17],'shape':animal+'-upper','limits':[-1.2,1.2]},{'id':'frontFoot','parent':'front','pivot':[0,54]if animal=='fox'else[0,32],'shape':animal+'-lower','limits':[-1,1]},{'id':'head','parent':'body','pivot':[26,-61]if animal=='fox'else[20,-56],'shape':animal+'-head','limits':[-.5,.5]}]
 poses=[]
 for f in range(0,193,4):
  stop=1 if f<(100 if animal=='fox'else 76) else 0;t=(f+phase)*math.pi/(24 if animal=='fox'else 18)
  poses.append({'frame':f,'pose':{'body':0,'tail':.19*math.sin(t/2),'rear':.45*math.sin(t)*stop,'rearFoot':-.35*math.sin(t)*stop,'front':-.45*math.sin(t)*stop,'frontFoot':.35*math.sin(t)*stop,'head':-.18 if f>136 else .08*math.sin(t/2)}})
 return obj(id,'puppet',rig={'bones':bones},poses=poses,every=2 if animal=='fox'else 3,keys=[key(0,x,y,scale=scale),key(104 if animal=='fox'else 80,x+(320 if animal=='fox'else 200),y,scale=scale),key(192,x+(320 if animal=='fox'else 200),y,scale=scale)],criticalPairs=[{'a':'head','b':'frontFoot','minDistance':22}])
shapes['mid-tree']={**shapes['tree-left'],'fill':'#677875'}
forest={'version':1,'style':'silhouette-theatre','title':'The path beyond the fern','size':[1920,1080],'fps':24,'frames':192,'seed':17,'coordinateSystem':'canvas +y down','units':'px, radians, frames','ink':'#15232a','background':'#e6d6ab','backdrop':[[0,'#d5d2b8'],[.58,'#f5e8b9'],[1,'#8fa09a']],'shapes':shapes,'camera':{'keys':[key(0),key(192,90,-12,zoom=1.025)]},'planes':[
 {'id':'distant','depth':.15,'objects':[obj('mountains',shape='mountain'),obj('moon','alpha',asset='assets/moon.svg',bounds=[0,0,180,180],keys=[key(0,1320,150)])]},
 {'id':'grove','depth':.35,'objects':[obj('back-tree',shape='mid-tree',keys=[key(0,1750,0,scale=1)])]},
 {'id':'action','depth':.65,'objects':[obj('ground',shape='ground'),obj('fox-glow','halo',radius=330,color='#fff1c044',keys=[key(0,680,660),key(140,1000,650)]),obj('fox-shadow','shadow',shape='fox-body',keys=[key(0,630,856,scale=1.7),key(104,950,856,scale=1.7)],opacity=.22),puppet('fox','fox',620,748,1.15,0),puppet('hare','hare',1030,790,.9,12)]},
 {'id':'foreground','depth':1,'objects':[obj('left-curtain',shape='tree-left',keys=[key(0,30,0),key(52,30,0),key(98,-185,0),key(192,-185,0)]),obj('right-tree',shape='tree-right',keys=[key(0,2180,0,scaleX=-1)]),obj('fern-a',shape='fern',keys=[key(0,300,956,scale=1.4)]),obj('fern-b',shape='fern',keys=[key(0,1660,990,scale=1.9,scaleX=-1)])]}]}
harbor={'version':1,'style':'silhouette-theatre','title':'A light for the late sail','size':[1920,1080],'fps':24,'frames':192,'seed':43,'coordinateSystem':'canvas +y down','units':'px, radians, frames','ink':'#17212d','background':'#b8bec4','backdrop':[[0,'#56697c'],[.58,'#e7d4af'],[1,'#596d7d']],'shapes':shapes,'camera':{'keys':[key(0),key(192,50,0,zoom=1.02)]},'reveal':{'kind':'iris','from':0,'to':25,'center':[970,570],'radius':1300},'planes':[
 {'id':'distance','depth':.15,'objects':[obj('moon','alpha',asset='assets/moon.svg',bounds=[0,0,220,220],keys=[key(0,1260,125)]),obj('land',shape='mountain',keys=[key(0,0,280,scaleY=.6)])]+[obj('star'+str(i),shape='star',keys=[key(0,240+i*230,130+(i%3)*70,scale=.25)])for i in range(7)]},
 {'id':'light','depth':.4,'objects':[obj('beam',shape='beam',keys=[key(0,1350,335,rotation=-.46),key(74,1350,335,rotation=.24),key(130,1350,335,rotation=-.12),key(192,1350,335,rotation=-.12)]),obj('lamp-halo','halo',radius=220,color='#ffedb966',keys=[key(0,1350,335)])]},
 {'id':'island','depth':.55,'objects':[obj('cliff',shape='harbor-cliff',keys=[key(0,1350,778,scale=1.1)]),obj('tower',shape='lighthouse',keys=[key(0,1350,718)])]},
 {'id':'sea-back','depth':.6,'objects':[obj('rear-wave',shape='wave',keys=[key(0,-35,825),key(96,20,825),key(192,-35,825)]),obj('ship',shape='ship',every=3,keys=[key(0,400,805,rotation=-.025,scale=.9),key(72,720,790,rotation=.025,scale=.9),key(144,990,800,rotation=-.02,scale=.9),key(192,1090,795,rotation=0,scale=.9)])]},
 {'id':'sea-front','depth':1,'objects':[obj('front-wave',shape='wave',keys=[key(0,0,938),key(96,-80,945),key(192,0,938)])]}]}
(assets/'cutouts.json').write_text(json.dumps(shapes,indent=2)+'\n')
(assets/'moon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><path fill="#fff0bd" fill-rule="evenodd" d="M110 5 A105 105 0 1 0 110 215 A105 105 0 1 0 110 5 Z M147 14 A94 94 0 0 1 147 199 A100 100 0 0 0 147 14 Z"/></svg>')
for name,s in [('forest',forest),('harbor',harbor)]: (recipes/(name+'.json')).write_text(json.dumps(s,indent=2)+'\n')
portrait=json.loads(json.dumps(forest));portrait['size']=[1080,1920];portrait['title']='Forest vertical study';portrait['camera']={'keys':[key(0),key(192,20,0)]}
portrait['shapes']['ground']=shape('M-300 1310 Q100 1260 460 1290 Q700 1250 1400 1300 L1400 2500 L-300 2500 Z','#627475')
portrait['shapes']['mountain']=shape('M-300 2500 L-300 950 Q100 700 400 880 Q700 640 1400 940 L1400 2500 Z','#8a9489')
for plane in portrait['planes']:
 for o in plane['objects']:
  if o['id']=='moon':o['keys']=[key(0,700,280)]
  if o['id']=='back-tree':o['keys']=[key(0,1270,0,scale=1.7)]
  if o['id'] in ['fox','hare']:
   x,y,sc=(410,1200,1)if o['id']=='fox'else(790,1245,.85)
   o['keys']=[key(0,x,y,scale=sc),key(104 if o['id']=='fox'else 80,x+60,y,scale=sc),key(192,x+60,y,scale=sc)]
  if o['id']=='fox-shadow':o['keys']=[key(0,380,1300,scale=1.5),key(104,440,1300,scale=1.5)]
  if o['id']=='fox-glow':o['keys']=[key(0,530,1130)]
  if o['id']=='left-curtain':o['keys']=[key(0,-200,0,scale=1.7),key(52,-200,0,scale=1.7),key(98,-420,0,scale=1.7),key(192,-420,0,scale=1.7)]
  if o['id']=='right-tree':o['keys']=[key(0,1700,0,scale=1.7,scaleX=-1)]
  if o['id']=='fern-a':o['keys']=[key(0,30,1800,scale=2.4)]
  if o['id']=='fern-b':o['keys']=[key(0,1060,1780,scale=2.6,scaleX=-1)]
(recipes/'portrait.json').write_text(json.dumps(portrait,indent=2)+'\n')
meta={'author':'Cinewright original authored demo geometry','source':'author.py control curves; no source film images','license':'CC0-1.0','original':True,'tools':{'python':platform.python_version(),'renderer':'Canvas2D'},'coordinates':'+x right +y down, logical px','pivot':'hinge-local bones in scene JSON','bounds':'path control curves; scene plane extent explicit','colorSpace':'sRGB','alpha':'SVG straight alpha decoded into premultiplied Canvas','rig':'parent hinge, rest 0 rad, limits radians; local origin at hinge','clip':{'fps':24,'loop':False,'contacts':'authored foot contacts approximate, fox walk stops at frame104'},'files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in assets.iterdir()if p.is_file() and p.name!='provenance.json'}}
(assets/'provenance.json').write_text(json.dumps(meta,indent=2)+'\n')
