"""Experimental cached pitch-motion director for the verified Whiff fixture."""
import copy,json,uuid,hashlib
from pathlib import Path
from fractions import Fraction
import cv2
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/whiff-gameplay'
config=json.loads((ROOT/'config/director.json').read_text())
source=Path('/Users/cosmopro/Desktop/WhiffCity-11-19.fcpxmld/Info.fcpxml')
import xml.etree.ElementTree as E

def analyze():
    all_scores=[]
    for name,file in [('Cam A','a-analysis.avi'),('Cam B','b-analysis.avi')]:
        cap=cv2.VideoCapture(str(OUT/file)); scores=[]; previous=None
        mask=np.zeros((360,640),np.uint8)
        cv2.fillPoly(mask,[np.array(config['pitchMasks'][name])],255)
        while True:
            ok,frame=cap.read()
            if not ok: break
            gray=cv2.GaussianBlur(cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY),(5,5),0)
            if previous is None: scores.append(0.)
            else:
                diff=cv2.absdiff(gray,previous)
                moving=((diff>20)&(mask>0)).astype(np.uint8)
                n,labels,stats,centers=cv2.connectedComponentsWithStats(moving)
                # Reject isolated noise and large exposure changes; suppress distant background.
                score=sum(float(s[4]) for s in stats[1:] if 6<=s[4]<=500)
                scores.append(score/np.count_nonzero(mask))
            previous=gray
        cap.release()
        if len(scores)<600: raise ValueError(f'{name}: incomplete analysis cache {len(scores)} frames')
        all_scores.append(scores[:600])
    cache={'method':config['method'],'fps':2,'pitchMasks':config['pitchMasks'],'scores':all_scores,'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest()}
    (OUT/'analysis.json').write_text(json.dumps(cache))
    return cache

def direct(cache):
    scores=np.array(cache['scores']); smooth=np.zeros_like(scores)
    for i in range(600): smooth[:,i]=np.mean(scores[:,max(0,i-5):i+1],axis=1)
    # Per-view baseline compensates for different resolution, perspective and mask area.
    baseline=np.maximum(np.percentile(smooth,75,axis=1),0.001)
    strength=smooth/baseline[:,None]
    active=0; pending=None; since=0; cuts=[(0,0,'initial_camera')]; evidence=[]
    for i in range(600):
        total=float(strength[:,i].sum())
        advantage=float((strength[1,i]-strength[0,i])/max(total,0.001))
        candidate=1 if advantage>config['switchMargin'] else 0 if advantage < -config['switchMargin'] else active
        confidence=abs(advantage)*min(1,total/2)
        evidence.append({'frame':i*30,'activityA':float(strength[0,i]),'activityB':float(strength[1,i]),'evidenceStrength':confidence})
        raw = scores[:,i] / baseline
        raw_candidate = int(raw[1] > raw[0])
        if confidence<config['minimumEvidence'] or candidate==active or raw_candidate!=candidate:
            pending=None;continue
        if pending!=candidate: pending=candidate;since=i
        if (i-since)/2>=config['sustainedTransitionSeconds'] and (i-cuts[-1][0])/2>=config['minimumShotSeconds']:
            active=candidate;cuts.append((i,active,'sustained_near_pitch_motion'));pending=None
    if len(cuts)>1 and (600-cuts[-1][0])/2 < config["minimumShotSeconds"]:
        cuts.pop()
    segments=[]
    for k,(i,angle,reason) in enumerate(cuts):
        end=cuts[k+1][0] if k+1<len(cuts) else 600
        segments.append({'startFrame':i*30,'endFrame':end*30,'videoAngle':['Cam A','Cam B'][angle],'reason':reason,'evidenceStrength':float(np.mean([x['evidenceStrength'] for x in evidence[i:end]]))})
    return segments,evidence

def export(segments,evidence):
    root=E.parse(source).getroot(); resources=E.tostring(root.find('resources'))
    project=root.find('./library/event/project'); seq=project.find('sequence');spine=seq.find('spine');gap=spine.find('gap');clip=gap.find('mc-clip')
    assert len(spine)==1 and len(gap)==1 and all(c.tag=='mc-source' for c in clip)
    start=Fraction(clip.get('start','0s')[:-1]); anchor=Fraction(clip.get('offset')[:-1])
    angles={a.get('name'):a.get('angleID') for a in root.findall('./resources/media/multicam/mc-angle')}
    def ts(f):return f'{f.numerator}/{f.denominator}s'
    project.set('name','TBFC - Whiff City - Opening 5min AutoDirector v1');project.set('uid',str(uuid.uuid4()).upper());project.attrib.pop('modDate',None)
    seq.set('duration','300s');gap.set('duration','300s');gap.remove(clip)
    for segment in segments:
        a=Fraction(segment['startFrame'],60);b=Fraction(segment['endFrame'],60)
        part=copy.deepcopy(clip);part.set('offset',ts(anchor+a));part.set('start',ts(start+a));part.set('duration',ts(b-a))
        for c in list(part):part.remove(c)
        for name,angle in angles.items():E.SubElement(part,'mc-source',angleID=angle,srcEnable='all' if name==segment['videoAngle'] else 'audio')
        gap.append(part)
    assert resources==E.tostring(root.find('resources'))
    assert segments[0]['startFrame']==0 and segments[-1]['endFrame']==18000
    assert all(a['endFrame']==b['startFrame'] for a,b in zip(segments,segments[1:]))
    assert sum(Fraction(p.get('duration')[:-1]) for p in gap)==300
    bundle=OUT/'Whiff-Opening-5min-AutoDirector.fcpxmld';bundle.mkdir(exist_ok=True)
    E.indent(root);(bundle/'Info.fcpxml').write_bytes(b'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE fcpxml>\n'+E.tostring(root,encoding='utf-8'))
    (OUT/'decisions.json').write_text(json.dumps({'schemaVersion':1,'timelineTimebase':'frames','fps':60,'sourceStart':str(start),'audioAngles':list(angles),'segments':segments},indent=2))
    report={'durationSeconds':300,'method':config['method'],'changes':len(segments)-1,'averageShotSeconds':300/len(segments),'screenTimeSeconds':{name:sum((s['endFrame']-s['startFrame'])/60 for s in segments if s['videoAngle']==name) for name in angles},'lowEvidenceIntervalsSeconds':[[e['frame']/60,(e['frame']+30)/60] for e in evidence if e['evidenceStrength']<config['minimumEvidence']], 'limitations':['Motion evidence is not ball tracking or calibrated probability.','Pitch masks are manually estimated and exclude neighboring games; SuperView geometry is not metrically calibrated.','Audio enabled for both angles; no audio gain changes.','Final Cut review required; full-match processing not yet validated.'],'evidence':evidence}
    (OUT/'diagnostics.json').write_text(json.dumps(report,indent=2))
    print(json.dumps({k:v for k,v in report.items() if k not in ('evidence','lowEvidenceIntervalsSeconds')},indent=2))
    print('Cuts:',[(s['startFrame']/60,s['videoAngle']) for s in segments])
if __name__=='__main__':
    import sys
    cache=json.loads((OUT/'analysis.json').read_text()) if '--cached' in sys.argv else analyze()
    assert cache['sourceSHA256']==hashlib.sha256(source.read_bytes()).hexdigest()
    export(*direct(cache))
