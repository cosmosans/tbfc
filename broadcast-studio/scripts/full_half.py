"""Whiff City full-half extension: rational source mapping and cached activity."""
import concurrent.futures, copy, hashlib, json, math, subprocess, uuid
from pathlib import Path
from fractions import Fraction as F
import xml.etree.ElementTree as E
import cv2
import numpy as np
import gameplay as g
OUT=g.ROOT/'output/whiff-first-half';OUT.mkdir(exist_ok=True)
SOURCE=g.source.read_bytes();root=E.fromstring(SOURCE)
resources={e.get('id'):e for e in root.find('resources')}
project=root.find('./library/event/project');seq=project.find('sequence');spine=seq.find('spine');gap=spine.find('gap');clip=gap.find('mc-clip')
def tm(e,k,default='0s'):return F(e.get(k,default)[:-1])
def ts(x):return f'{x.numerator}/{x.denominator}s'
START=tm(clip,'start');DURATION=tm(clip,'duration');N=math.ceil(DURATION*2)
assert len(spine)==1 and len(gap)==1 and all(c.tag=='mc-source' for c in clip)
assert DURATION*60==int(DURATION*60)
angles=resources[clip.get('ref')].findall('./multicam/mc-angle')
assert [a.get('name') for a in angles]==['Cam A','Cam B']
from urllib.parse import unquote,urlparse
jobs={};ends={}
for a in angles:
 refs=a.findall('ref-clip');assert len(refs)==1
 ref=refs[0];compound=resources[ref.get('ref')].find('sequence');parts=[]
 for c in compound.find('spine'):
  assert c.tag=='asset-clip' and c.find('timeMap') is None
  asset=resources[c.get('ref')];path=Path(unquote(urlparse(asset.find('media-rep').get('src')).path));assert path.is_file(),path
  rate=c.find('conform-rate');assert rate is not None and rate.get('srcFrameRate')=='59.94'
  origin=tm(ref,'offset')-tm(ref,'start')+tm(c,'offset')
  lo=max(600,math.ceil((origin-START)*2));hi=min(N,math.ceil((origin+tm(c,'duration')-START)*2))
  if hi>lo:parts.append((path,lo,hi,(START+F(lo,2)-origin)*F(1001,1000)+tm(c,'start')-tm(asset,'start')))
 jobs[a.get('name')]=parts;ends[a.get('name')]=min(DURATION,tm(ref,'offset')+tm(ref,'duration')-START)
old=json.loads((g.OUT/'analysis.json').read_text());assert old['sourceSHA256']==hashlib.sha256(SOURCE).hexdigest()
(OUT/'source.fcpxml').write_bytes(SOURCE)

def analyze_camera(index,name):
 cache=OUT/f'{name.replace(" ","-")}-activity.json'
 if cache.exists():
  data=json.loads(cache.read_text());assert data['sha']==hashlib.sha256(SOURCE).hexdigest();return data['scores']
 scores=np.zeros(N);scores[:600]=old['scores'][index]
 mask=np.zeros((360,640),np.uint8);cv2.fillPoly(mask,[np.array(g.config['pitchMasks'][name])],255)
 previous=None
 for path,lo,hi,seek in jobs[name]:
  count=hi-lo
  cmd=['ffmpeg','-v','error','-hwaccel','videotoolbox','-ss',str(float(seek)),'-i',str(path),'-an','-vf','setpts=PTS/1.001,tpad=stop_mode=clone:stop_duration=1,fps=2,scale=640:360,format=gray','-frames:v',str(count),'-f','rawvideo','pipe:1']
  proc=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  for i in range(lo,hi):
   data=proc.stdout.read(640*360)
   if len(data)!=640*360:raise RuntimeError(f'{name} {path.name}: short decode at {i}: '+proc.stderr.read().decode())
   gray=cv2.GaussianBlur(np.frombuffer(data,np.uint8).reshape(360,640),(5,5),0)
   if previous is not None:
    moving=((cv2.absdiff(gray,previous)>20)&(mask>0)).astype(np.uint8)
    _,_,stats,_=cv2.connectedComponentsWithStats(moving)
    scores[i]=sum(float(s[4]) for s in stats[1:] if 6<=s[4]<=500)/np.count_nonzero(mask)
   previous=gray
   if i%240==0:print(f"{name}: {i/2:.0f}s analyzed",flush=True)
  proc.stdout.close();err=proc.stderr.read();assert proc.wait()==0,err
  print(f'{name}: analyzed through {min(float(DURATION),hi/2):.1f}s ({path.name})',flush=True)
 data={'sha':hashlib.sha256(SOURCE).hexdigest(),'scores':scores.tolist()};cache.write_text(json.dumps(data));return data['scores']

def main():
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  futures=[pool.submit(analyze_camera,i,a.get('name')) for i,a in enumerate(angles)]
  scores=np.array([f.result() for f in futures])
 smooth=np.zeros_like(scores)
 for i in range(N):smooth[:,i]=np.mean(scores[:,max(0,i-5):i+1],axis=1)
 baseline=np.maximum(np.percentile(smooth[:,:600],75,axis=1),.001);strength=smooth/baseline[:,None]
 approved=json.loads((g.OUT/'decisions.json').read_text())['segments'];cuts=[(s['startFrame'],s['videoAngle'],s['reason']) for s in approved]
 active=['Cam A','Cam B'].index(cuts[-1][1]);pending=None;since=0;evidence=[]
 for i in range(N):
  total=float(strength[:,i].sum());adv=float((strength[1,i]-strength[0,i])/max(total,.001));confidence=abs(adv)*min(1,total/2)
  evidence.append({'frame':i*30,'evidenceStrength':confidence})
  if i<600:continue
  # Availability is handled exactly at the final source frame below.
  if F(i,2)>=ends['Cam B']:break
  candidate=1 if adv>g.config['switchMargin'] else 0 if adv < -g.config['switchMargin'] else active
  raw=scores[:,i]/baseline
  if confidence<g.config['minimumEvidence'] or candidate==active or int(raw[1]>raw[0])!=candidate:pending=None;continue
  if pending!=candidate:pending=candidate;since=i
  if (i-since)/2>=g.config['sustainedTransitionSeconds'] and (i*30-cuts[-1][0])/60>=g.config['minimumShotSeconds']:
   active=candidate;cuts.append((i*30,['Cam A','Cam B'][active],'sustained_near_pitch_motion'));pending=None
 end_b=int(ends['Cam B']*60)
 if active==1 and ends['Cam B']<DURATION:
  if end_b-cuts[-1][0]<180:cuts.pop()
  else:cuts.append((end_b,'Cam A','camera_b_recording_ended'))
 totalframes=int(DURATION*60)
 if len(cuts)>1 and totalframes-cuts[-1][0]<180:cuts.pop()
 segments=[{'startFrame':f,'endFrame':cuts[k+1][0] if k+1<len(cuts) else totalframes,'videoAngle':name,'reason':reason} for k,(f,name,reason) in enumerate(cuts)]
 for s in segments:
  assert s['endFrame']>s['startFrame'] and s['endFrame']<=int(ends[s['videoAngle']]*60)
 assert all(a['endFrame']==b['startFrame'] for a,b in zip(segments,segments[1:]))
 original=E.tostring(root.find('resources'));anchor=tm(clip,'offset')
 project.set('name','TBFC - Whiff City - First Half AutoDirector');project.set('uid',str(uuid.uuid4()).upper());project.attrib.pop('modDate',None)
 gap.set('duration',ts(DURATION));gap.remove(clip)
 for s in segments:
  part=copy.deepcopy(clip);part.set('offset',ts(anchor+F(s['startFrame'],60)));part.set('start',ts(START+F(s['startFrame'],60)));part.set('duration',ts(F(s['endFrame']-s['startFrame'],60)))
  for c in list(part):part.remove(c)
  for a in angles:E.SubElement(part,'mc-source',angleID=a.get('angleID'),srcEnable='all' if a.get('name')==s['videoAngle'] else 'audio')
  gap.append(part)
 assert E.tostring(root.find('resources'))==original
 assert sum(tm(p,'duration') for p in gap)==DURATION
 assert g.source.read_bytes()==SOURCE
 bundle=OUT/'Whiff-First-Half-AutoDirector.fcpxmld';bundle.mkdir(exist_ok=True);E.indent(root)
 (bundle/'Info.fcpxml').write_bytes(b'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE fcpxml>\n'+E.tostring(root,encoding='utf-8'))
 (OUT/'decisions.json').write_text(json.dumps({'schemaVersion':1,'fps':60,'timelineTimebase':'frames','sourceStart':str(START),'audioAngles':['Cam A','Cam B'],'segments':segments},indent=2))
 report={'durationSeconds':float(DURATION),'changes':len(segments)-1,'averageShotSeconds':float(DURATION)/len(segments),'screenTimeSeconds':{n:sum(s['endFrame']-s['startFrame'] for s in segments if s['videoAngle']==n)/60 for n in ends},'cameraEndSeconds':{n:float(t) for n,t in ends.items()},'method':g.config['method'],'approvedOpeningPreserved':True,'sourceSHA256':hashlib.sha256(SOURCE).hexdigest(),'audio':'Both enabled throughout; Cam B has no media after its recording ends.','limitations':['Motion fallback, not ball tracking.','Final Cut playback review pending.'],'lowEvidenceSamples':[e for e in evidence if e['evidenceStrength']<g.config['minimumEvidence']]}
 (OUT/'diagnostics.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='lowEvidenceSamples'},indent=2),flush=True)
if __name__=='__main__':main()
