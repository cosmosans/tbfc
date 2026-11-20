"""Fixture-specific, non-destructive round-trip preparation; not an automatic director."""
import copy, hashlib, json, uuid
from pathlib import Path
from fractions import Fraction
from urllib.parse import urlparse, unquote
import xml.etree.ElementTree as E
source = Path('/Users/cosmopro/Desktop/WhiffCity-11-19.fcpxmld/Info.fcpxml')
out = Path(__file__).resolve().parents[1] / 'output/whiff-city-test'
out.mkdir(parents=True, exist_ok=True)
data = source.read_bytes()
root = E.fromstring(data)
assert root.get('version') == '1.13'
original_resources = E.tostring(root.find('resources'))
project = root.find('./library/event/project')
seq = project.find('sequence')
spine = seq.find('spine')
gap = spine.find('gap')
clip = gap.find('mc-clip')
assert len(spine) == 1 and len(gap) == 1 and len(clip) == 1
assert clip.get('ref') == 'r2' and clip.get('offset') == gap.get('start')
angles = {a.get('name'): a.get('angleID') for a in root.findall('./resources/media/multicam/mc-angle')}
assert set(angles) == {'Cam A', 'Cam B'}
assert root.find('./resources/format').get('frameDuration') == '100/6000s'
project.set('name', 'TBFC - Whiff City - 5min Multicam Test')
project.set('uid', str(uuid.uuid4()).upper())
project.attrib.pop('modDate', None)
# Keep the original connected-clip layout, with the gap shortened to the test region.
seq.set('duration', '300s')
gap.set('duration', '300s')
gap.remove(clip)
segments = []
for i in range(5):
    name = 'Cam A' if i % 2 == 0 else 'Cam B'
    part = copy.deepcopy(clip)
    part.set('offset', f'{3600 + i * 60}s')
    part.set('start', f'{60 + i * 60}s')
    part.set('duration', '60s')
    for child in list(part): part.remove(child)
    for camera, angle in angles.items():
        E.SubElement(part, 'mc-source', angleID=angle, srcEnable='all' if camera == name else 'audio')
    gap.append(part)
    segments.append(dict(start=i*60, end=(i+1)*60, sourceStart=60+i*60,
                         videoAngle=name, audioAngles=list(angles), reason='manual_roundtrip_test'))
assert E.tostring(root.find('resources')) == original_resources
for i, part in enumerate(gap):
    assert Fraction(part.get('start')[:-1]) == 60 + i*60
    assert sum(s.get('srcEnable') == 'all' for s in part) == 1
    assert all(s.get('srcEnable') in ('all', 'audio') for s in part)
assert source.read_bytes() == data
bundle = out / 'Whiff-City-5min-Test.fcpxmld'
bundle.mkdir(exist_ok=True)
E.indent(root)
(bundle / 'Info.fcpxml').write_bytes(b'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE fcpxml>\n' + E.tostring(root, encoding='utf-8'))
(out / 'decisions.json').write_text(json.dumps(dict(schemaVersion=1, timelineTimebase='seconds', fps=60, sourceRegion=[60,360], segments=segments), indent=2))
media = {a.get('name'): Path(unquote(urlparse(a.find('media-rep').get('src')).path)).is_file() for a in root.findall('./resources/asset')}
report = dict(sourceSHA256=hashlib.sha256(data).hexdigest(), durationSeconds=300, cameraSeconds={'Cam A':180,'Cam B':120}, switches=4, averageShotSeconds=60, tracking='Not run: interchange test only', audio='Both angles enabled in every segment', sourceRegionSeconds=[60,360], mediaAvailable=media, finalCutImportVerified=False, notes=['Cam A starts at 36.4333s; test starts at 60s.', 'Project is 60fps; source clips are 59.94fps with existing conform-rate preserved.', 'Original resources, synchronization, media references, and source file preserved.'])
(out / 'diagnostics.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
print(bundle)
