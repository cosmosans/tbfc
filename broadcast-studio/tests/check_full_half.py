"""Independent output checks against the original export and approved opening."""
import json
import xml.etree.ElementTree as E
from fractions import Fraction as F
from pathlib import Path
base=Path(__file__).resolve().parents[1]/'output'
out=base/'whiff-first-half'
src=E.parse(out/'source.fcpxml').getroot()
result=E.parse(out/'Whiff-First-Half-AutoDirector.fcpxmld/Info.fcpxml').getroot()
def normalized(e):
 return e.tag,sorted(e.attrib.items()),(e.text or '').strip(),[normalized(c) for c in e]
assert normalized(src.find('resources'))==normalized(result.find('resources'))
seq=result.find('./library/event/project/sequence');gap=seq.find('./spine/gap')
original=src.find('./library/event/project/sequence/spine/gap/mc-clip')
start=F(original.get('start')[:-1]);offset=F(original.get('offset')[:-1]);cursor=F(0)
ids={a.get('angleID'):a.get('name') for a in src.findall('./resources/media/multicam/mc-angle')}
end_b=F(21067400,6000)-start
for c in gap:
 duration=F(c.get('duration')[:-1]);assert duration>0
 assert F(c.get('offset')[:-1])==offset+cursor
 assert F(c.get('start')[:-1])==start+cursor
 assert len(c)==2 and {x.get('angleID') for x in c}==set(ids)
 assert sorted(x.get('srcEnable') for x in c)==['all','audio']
 selected=next(ids[x.get('angleID')] for x in c if x.get('srcEnable')=='all')
 if selected=='Cam B':assert cursor+duration<=end_b
 assert (cursor*60).denominator==1 and (duration*60).denominator==1
 cursor+=duration
assert cursor==F(original.get('duration')[:-1])==F(seq.get('duration')[:-1])
segments=json.loads((out/'decisions.json').read_text())['segments']
old=json.loads((base/'whiff-gameplay/decisions.json').read_text())['segments']
for frame in range(18000):
 a=next(s['videoAngle'] for s in old if s['startFrame']<=frame<s['endFrame'])
 b=next(s['videoAngle'] for s in segments if s['startFrame']<=frame<s['endFrame'])
 assert a==b
assert src.find('./library/event/project').get('uid')!=result.find('./library/event/project').get('uid')
print('PASS: unchanged resources, all frames covered, exact source timing, both audio sources active, no unavailable video, approved opening identical, separate project identity.')
