from pathlib import Path
import json,hashlib,subprocess,array,math,wave
root=Path('evidence/code-expression-20261110'); out=root/'independent-review-evidence'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
index=json.loads((root/'delivery/results.json').read_text()); report=json.loads((root/'delivery/verification/report.json').read_text())
checks={'exampleSourceHashes':{},'delivery':[]}
for n,h in json.loads((root/'source-hashes.json').read_text()).items():checks['exampleSourceHashes'][n]=sha(Path('examples/relation-studies')/n)==h
for r in index['results']:
 n=r['name'];p=root/'delivery'/f'{n}.mp4';job=json.loads((Path(r['canonicalOutput']).parent/'job.json').read_text());v=next(x for x in report['results'] if x['name']==n)
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-f','s16le','-ac','2','-ar','48000','-']);a=array.array('h',raw)
 active=[i//2 for i in range(0,len(a),2) if a[i] or a[i+1]]
 with wave.open(str(root/'delivery'/n/'score.wav'),'rb') as f: pcm=array.array('h',f.readframes(f.getnframes()))
 length=min(len(a),len(pcm)); dot=sum(x*y for x,y in zip(a,pcm)); a2=sum(x*x for x in a[:length]);b2=sum(x*x for x in pcm[:length]);err=math.sqrt(sum((x-y)**2 for x,y in zip(a,pcm))/length)/32768
 s={'name':n,'indexCanonicalAndFileHashMatch':sha(p)==r['sha256']==sha(r['canonicalOutput'])==job['outputSha256'], 'jobRevisionReportMatch':r['revision']==job['revision']==v['revision'] and r['job']==v['job'], 'aacSamplesPerChannel':len(a)//2,'aacPeakNormalized':max(abs(x) for x in a)/32768,'aacFirstNonzeroSeconds':active[0]/48000,'aacLastNonzeroSeconds':active[-1]/48000,'aacTrailingExactSilenceSeconds':(len(a)//2-active[-1]-1)/48000,'aacCorrelationWithProjectPCM':dot/math.sqrt(a2*b2),'aacRmsError':err,'reportAacCorrelationMatches':abs(dot/math.sqrt(a2*b2)-v['aac']['correlation'])<1e-12}
 checks['delivery'].append(s)
(out/'technical-spotcheck.json').write_text(json.dumps(checks,indent=2));print(json.dumps(checks,indent=2))
