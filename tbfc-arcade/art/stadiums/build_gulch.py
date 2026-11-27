"""Build The Gulch's editable Blender source, packed game model and review render.

Run: Blender --background --python tbfc-arcade/art/stadiums/build_gulch.py
Coordinates below are game coordinates (X length, Y height, Z width), in meters.
The review-only goals are replaced by the game's live goal/net meshes on export.
"""
import bpy
import math
import random
from pathlib import Path
from mathutils import Vector, Matrix
import numpy as np
import json
import struct

OUT = Path(__file__).resolve().parent
SPEC = json.loads((OUT.parent.parent / 'src/streetArena.json').read_text())
X,Z = SPEC['length']/2,SPEC['width']/2
GW,GH,GD = SPEC['goalWidth']/2,SPEC['goalHeight'],SPEC['goalDepth']
WALL,FENCE = SPEC['wallHeight'],SPEC['fenceHeight']
random.seed(23)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
    if c.name != 'Collection':
        bpy.data.collections.remove(c)
base = bpy.data.collections.get('Collection')
base.name = 'STREET_COURT'
groups = {base.name: base}
active = base

def group(name,parent=None):
    global active
    if name not in groups:
        groups[name] = bpy.data.collections.new(name)
        (groups[parent] if parent else bpy.context.scene.collection).children.link(groups[name])
    active = groups[name]

def xyz(p):
    return (p[0], -p[2], p[1])

def material(name, rgb, rough=.85, metal=0, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    s = m.node_tree.nodes.get('Principled BSDF')
    s.inputs['Base Color'].default_value = (*rgb, 1)
    s.inputs['Roughness'].default_value = rough
    s.inputs['Metallic'].default_value = metal
    if emission:
        s.inputs['Emission Color'].default_value = (*rgb, 1)
        s.inputs['Emission Strength'].default_value = emission
    return m

asphalt = material('Asphalt - aggregate and repairs', (.15,.18,.19))
paint = material('STREET Surface Paint', (.0823,.1119,.1274))
cream = material('Warm chalk markings', (.88,.80,.59))
orange = material('Burnt orange enamel', (.68,.20,.065))
teal = material('Deep teal enamel', (.035,.22,.23))
dark = material('Charcoal steel', (.055,.075,.08), .64, .3)
steel = material('Galvanized fence', (.25,.31,.31), .55, .35)
concrete = material('Warm concrete', (.43,.42,.36))
mortar = material('Brick mortar', (.20,.19,.16))
bricks = [material('Fired brick %02d'%i, (.25+i*.025,.105+i*.012,.065+i*.01)) for i in range(6)]
wood = material('Weathered cedar', (.32,.19,.10))
glass = material('Smoky blue glazing', (.065,.15,.18), .25, .25)
light = material('Warm lamp glass', (1,.66,.29), .3, emission=3)
leaf = material('Dusty foliage', (.14,.25,.11))
white = material('Paper and ceramics', (.77,.74,.63))
rubber = material('Rubber', (.025,.028,.025))

# A packed aggregate texture survives glTF export; no external texture dependency.
size = 512
rng = np.random.default_rng(23)
grain = np.clip(rng.normal(.88,.045,(size,size)),.38,1)
for _ in range(12):
    x,y = rng.integers(0,size,2)
    for _ in range(int(rng.integers(15,120))):
        grain[y%size,x%size] = .65
        x += int(rng.choice([-1,0,1])); y += 1
rgba = np.ones((size,size,4),dtype=np.float32)
rgba[:,:,:3] = grain[:,:,None]
img = bpy.data.images.new('Gulch packed aggregate', width=size,height=size)
img.pixels.foreach_set(rgba.ravel())
img.pack()
for m in (asphalt,paint):
    n = m.node_tree.nodes.new('ShaderNodeTexImage'); n.image=img
    mix=m.node_tree.nodes.new('ShaderNodeMixRGB'); mix.blend_type='MULTIPLY'
    mix.inputs[0].default_value=1; mix.inputs[1].default_value=m.diffuse_color
    m.node_tree.links.new(n.outputs['Color'],mix.inputs[2])
    m.node_tree.links.new(mix.outputs[0],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

cube = bpy.data.meshes.new('Unit box')
cube.from_pydata([(-.5,-.5,-.5),(.5,-.5,-.5),(.5,.5,-.5),(-.5,.5,-.5),(-.5,-.5,.5),(.5,-.5,.5),(.5,.5,.5),(-.5,.5,.5)],[],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])
cube.materials.append(dark)
def box(name,p,d,m):
    o=bpy.data.objects.new(name,cube);active.objects.link(o)
    o.location=xyz(p);o.scale=(d[0],d[2],d[1])
    o.material_slots[0].link='OBJECT';o.material_slots[0].material=m
    return o

def mesh(name,vertices,faces,m):
    data=bpy.data.meshes.new(name);data.from_pydata([xyz(v) for v in vertices],[],faces)
    data.materials.append(m);o=bpy.data.objects.new(name,data);active.objects.link(o)
    return o

def rod(name,a,b,r,m,vertices=6):
    a,b=Vector(xyz(a)),Vector(xyz(b));d=b-a
    # Mesh cylinders avoid operator overhead on the fence and net strands.
    q=d.to_track_quat('Z','Y');vs=[]
    for point in (a,b):
        for i in range(vertices):
            t=2*math.pi*i/vertices
            vs.append(tuple(point+q@Vector((r*math.cos(t),r*math.sin(t),0))))
    fs=[tuple(range(vertices-1,-1,-1)),tuple(range(vertices,vertices*2))]
    fs += [(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]
    data=bpy.data.meshes.new(name);data.from_pydata(vs,[],fs);data.materials.append(m)
    o=bpy.data.objects.new(name,data);active.objects.link(o);return o

def text(name,body,p,height,m,face='north'):
    # Art direction: no lettering on any environmental surface.
    return None


def floor(name,x,z,w,d,y,m):
    o=mesh(name,[(x-w/2,y,z-d/2),(x-w/2,y,z+d/2),(x+w/2,y,z+d/2),(x+w/2,y,z-d/2)],[(0,1,2,3)],m)
    uv=o.data.uv_layers.new(name='UVMap')
    for i,co in enumerate([(0,0),(0,1),(1,1),(1,0)]):uv.data[i].uv=co
    return o

def ring(name,x,y,z,r,width,m):
    points=[];faces=[]
    for i in range(96):
        a=i*math.tau/96
        for rr in (r-width/2,r+width/2):points.append((x+rr*math.cos(a),y,z+rr*math.sin(a)))
        j=i*2;k=((i+1)%96)*2;faces.append((j,k,k+1,j+1))
    return mesh(name,points,faces,m)

# All reusable playable components live beneath STREET_COURT.
group('COURT_SURFACE','STREET_COURT')
floor('Flat painted concrete',0,0,2*X,2*Z,0,paint)
box('Independent court foundation',(0,-.12,0),(2*X+.5,.22,2*Z+.5),concrete)
group('COURT_MARKINGS','STREET_COURT')
for x in [-X+.23,X-.23]:floor('Outer end boundary',x,0,.075,2*Z-.46,.012,cream)
for z in [-Z+.23,Z-.23]:floor('Outer touch boundary',0,z,2*X-.46,.075,.012,cream)
floor('Halfway line',0,0,.075,2*Z-.46,.013,cream)
ring('Centre circle',0,.014,0,SPEC['centerCircleRadius'],.075,cream)
ring('Centre spot',0,.016,0,.12,.12,cream)
def arc(name,cx,r,sign):
    vs=[];fs=[]
    for i in range(49):
        angle=-math.pi/2+i*math.pi/48
        for radius in [r-.04,r+.04]:vs.append((cx-sign*radius*math.cos(angle),.014,radius*math.sin(angle)))
        if i:fs.append((2*i-2,2*i,2*i+1,2*i-1))
    return mesh(name,vs,fs,cream)
for sign in [-1,1]:
    arc('Compact goal area arc',sign*(X-.2),3,sign)
    ring('Restart spot',sign*(X-4.5),.015,0,.10,.1,cream)
# Restrained wear stays visually and physically separate from the tintable paint.
wear=material('STREET Concrete wear',(.23,.245,.25))
for _ in range(65):
    x=random.uniform(-X+.5,X-.5);z=random.uniform(-Z+.5,Z-.5)
    floor('Scuff',x,z,random.uniform(.06,.3),random.uniform(.01,.025),.004,wear)

def fence_group(side):
    group('FENCE_'+side,'STREET_COURT')
def board_group(side):
    group('REBOUND_'+side,'STREET_COURT')
for sign in [-1,1]:
    z=sign*Z;side='NORTH' if sign<0 else 'SOUTH'
    board_group(side)
    for i in range(8):
        x=-X+(i+.5)*2*X/8
        box('Smooth rebound panel',(x,WALL/2,z),(2*X/8,WALL,SPEC['wallThickness']),teal if i in [2,5] else concrete)
    fence_group(side)
    for x in np.linspace(-X,X,9):
        box('Outside cage post',(x,FENCE/2,z+sign*.09),(.075,FENCE,.075),dark)
    for y in [WALL,FENCE]:rod('Continuous cage rail',(-X,y,z),(X,y,z),.026,steel)
    # Open diamond mesh rather than an opaque texture, grouped for camera cutaways.
    for slope in [-1,1]:
        for start in np.arange(-X-(FENCE-WALL),X+.3,.36):
            a=max(0,(-X-start)/slope) if slope>0 else max(0,(start-X)/-slope)
            b=min(FENCE-WALL,(X-start)/slope) if slope>0 else min(FENCE-WALL,(-X-start)/slope)
            if b>a:rod('Chain link diamond',(start+slope*a,WALL+a,z),(start+slope*b,WALL+b,z),.006,steel,4)
for sign in [-1,1]:
    x=sign*X;side='WEST' if sign<0 else 'EAST'
    board_group(side)
    for zsign in [-1,1]:
        box('Goal-side rebound wall',(x,WALL/2,zsign*(Z+GW)/2),(SPEC['wallThickness'],WALL,Z-GW),concrete)
    fence_group(side)
    for z in [-Z,-Z/2,-GW,GW,Z/2,Z]:box('End post',(x+sign*.09,FENCE/2,z),(.075,FENCE,.075),dark)
    rod('End top rail',(x,FENCE,-Z),(x,FENCE,Z),.026,steel)
    for a,b in [(-Z,-GW),(GW,Z)]:rod('End lower rail',(x,WALL,a),(x,WALL,b),.026,steel)
    # Three regions preserve only the mini-goal opening; fencing also caps its top.
    for low,high,bottom in [(-Z,-GW,WALL),(-GW,GW,GH),(GW,Z,WALL)]:
        for z in np.arange(low,high+.001,.28):rod('End fence vertical',(x,bottom,z),(x,FENCE,z),.006,steel,4)
        for y in np.arange(bottom,FENCE,.28):rod('End fence cross',(x,y,low),(x,y,high),.006,steel,4)
# A locked pedestrian cage gate is decorative; there is no gap in the boundary.
group('FENCE_WEST','STREET_COURT')
for z in [7.4,8.8]:rod('Gate stile',(-X-.1,0,z),(-X-.1,2.4,z),.045,orange)
for y in [.1,2.4]:rod('Gate header',(-X-.1,y,7.4),(-X-.1,y,8.8),.045,orange)
box('Gate latch',(-X-.15,1,7.5),(.1,.12,.24),steel)

group('GOALS','STREET_COURT')
for sign in [-1,1]:
    x=sign*X;back=x+sign*GD;roof=x+sign*GD*.62
    for z in [-GW,GW]:
        rod('STREET goal post',(x,0,z),(x,GH,z),.065,cream,10)
        rod('STREET goal roof',(x,GH,z),(roof,GH,z),.043,steel)
        rod('STREET rear strut',(roof,GH,z),(back,0,z),.043,steel)
        rod('STREET ground bar',(x,.04,z),(back,.04,z),.043,steel)
    rod('STREET crossbar',(x,GH,-GW),(x,GH,GW),.075,cream,10)
    for z in np.arange(-GW,GW+.001,.12):
        rod('Mini goal roof net',(x,GH,z),(roof,GH,z),.008,white,4)
        rod('Mini goal back net',(roof,GH,z),(back,.04,z),.008,white,4)
    for y in np.arange(.08,GH,.12):
        xx=back+(roof-back)*y/GH
        rod('Mini goal cross net',(xx,y,-GW),(xx,y,GW),.008,white,4)
        for z in [-GW,GW]:rod('Mini goal side net',(x,y,z),(xx,y,z),.008,white,4)

def marker(name,p,**properties):
    o=bpy.data.objects.new(name,None);active.objects.link(o);o.location=xyz(p)
    o.empty_display_type='ARROWS';o.empty_display_size=.35
    for k,v in properties.items():o[k]=v
    return o
group('GAMEPLAY_MARKERS','STREET_COURT')
marker('STREET Court Origin',(0,0,0),length=2*X,width=2*Z)
marker('STREET Centre Spot',(0,0,0))
for sign,label in [(-1,'Home'),(1,'Away')]:
    marker('STREET '+label+' Goal',(sign*X,GH/2,0),width=2*GW,height=GH,depth=GD)
    marker('STREET '+label+' Goal Detection',(sign*(X+.1),GH/2,0),width=2*GW-.16,height=GH-.08)
    marker('STREET '+label+' Kickoff',(sign*1.2,0,0))
    marker('STREET '+label+' Formation',(sign*X*.45,0,0),normalizedDepth=.45)
    for i,z in enumerate([-6,-3,0,3,6]):marker('STREET '+label+' Warmup '+str(i),(sign*X*.6,0,z))
marker('STREET Entrance',(-X-.5,0,8))
group('GAMEPLAY_COLLISION','STREET_COURT')
for sign in [-1,1]:
    o=box('Collision side',(0,FENCE/2,sign*Z),(2*X,FENCE,SPEC['wallThickness']),dark)
    o.display_type='WIRE';o.hide_render=True;o['kind']='enclosure';o['reboundHeight']=WALL
    for zs in [-1,1]:
        o=box('Collision goal side',(sign*X,FENCE/2,zs*(Z+GW)/2),(SPEC['wallThickness'],FENCE,Z-GW),dark)
        o.display_type='WIRE';o.hide_render=True;o['kind']='enclosure'
    o=box('Collision over goal',(sign*X,(GH+FENCE)/2,0),(SPEC['wallThickness'],FENCE-GH,2*GW),dark)
    o.display_type='WIRE';o.hide_render=True;o['kind']='enclosure'
marker('Collision flat surface',(0,0,0),length=2*X,width=2*Z)
groups['GAMEPLAY_COLLISION'].hide_viewport=True

group('ENVIRONMENT_ARCHITECTURE')
floor('Sunken industrial ground',0,0,100,80,-.17,asphalt)
box('Court apron',(0,-.09,0),(40,.15,26),concrete)
# Author the retaining wall here; the final scenery reflection puts it on the camera side.
group('RETAINING_WALL')
for x in range(-24,25,4):
    box('Retaining wall panel',(x,2.3,-13.2),(3.96,4.6,.7),concrete)
    box('Retaining cap',(x,4.65,-13.2),(4.05,.15,.95),dark)
    for dx in [-1.4,1.4]:
        for y in [.6,3.8]:box('Formwork tie',(x+dx,y,-12.84),(.08,.08,.015),dark)
    box('Drain outlet',(x,.35,-12.82),(.35,.22,.03),dark)
for x in [-22,22]:
    rod('Utility downpipe',(x,.3,-12.7),(x,4.3,-12.7),.06,dark)
    for y in [.8,2.4,3.7]:box('Pipe bracket',(x,y,-12.68),(.22,.07,.13),steel)
# Lower retaining fragments at the ends frame entrances without sealing the camera.
group('ENVIRONMENT_ARCHITECTURE')
for x in [-22,22]:
    for z in [-9,8]:box('End retaining pier',(x,1.2,z),(1.2,2.4,5),concrete)
# Distinctive freight-container stack behind the east goal.
containerRed=material('Freight oxide',(.37,.105,.055))
containerBlue=material('Freight faded blue',(.075,.16,.21))
containerOchre=material('Freight mustard',(.49,.33,.09))
def container(name,cx,y,z,w,m):
    box(name,(cx,y+1.3,z),(w,2.6,2.5),m)
    for xx in np.arange(cx-w/2+.2,cx+w/2,.38):
        for zz in [-1.26,1.26]:box('Container corrugation',(xx,y+1.3,z+zz),(.07,2.42,.055),m)
    for xx in [cx-w/2+.1,cx+w/2-.1]:
        for zz in [-1.3,1.3]:box('Container corner casting',(xx,y+1.3,z+zz),(.15,2.6,.12),steel)
    for yy in [y+.12,y+2.48]:box('Container rim',(cx,yy,z+1.3),(w,.1,.08),dark)
container('Community equipment container',23,0,-3.8,8,containerBlue)
container('Freight container',23,0,0,8,containerRed)
container('Stacked freight container',24,2.6,-2,8,containerOchre)
text('Container shipping mark','ATL / 032',(23,1.5,1.28),.6,cream)
text('Container community lettering','AFTER HOURS F.C.',(23,4.1,-.72),.47,dark)
# Elevated road deck and a restrained skyline at the edge of the sunken site.
for x in [-35,31]:
    for z in [-20,22]:box('Viaduct concrete support',(x,4,z),(1.4,8,2.2),concrete)
    box('Viaduct deck',(x,8.3,0),(7,.7,57),concrete)
    for dx in [-3.2,3.2]:box('Viaduct steel edge',(x+dx,8.7,0),(.16,.7,57),dark)
group('DISTANT_SKYLINE')
for i in range(11):
    x=-32+i*6;h=random.uniform(7,17)
    box('Distant Atlanta silhouette',(x,h/2,-34),(random.uniform(3,5),h,5),glass)
    if i in [4,7]:rod('Skyline spire',(x,h,-34),(x,h+4,-34),.15,steel)

# Continuous warehouse blocks close the east/west horizon beyond the viaducts.
# Tune these tuples as (depth across site, frontage, height); adjoining frontages
# overlap slightly so low replay cameras never see sky through a building seam.
# Keep the inner faces outside X=35: goals, boxcars and end cameras stay clear.
warehouse_blocks = [(-35, 20, 16), (-17, 18, 21), (0, 17, 15),
                    (16, 17, 19), (34, 21, 23)]
warehouse_materials = [bricks[2], concrete, bricks[4], mortar, bricks[1]]
for side, label in [(-1, 'WEST'), (1, 'EAST')]:
    group('HORIZON_BUILDINGS_' + label)
    for index, (z, frontage, height) in enumerate(warehouse_blocks):
        # Offset the roofline on opposite ends without consuming the scene RNG.
        height += 2 if side == 1 and index % 2 == 0 else 0
        x = side * 42
        face = side * 35.9
        name = label + ' warehouse ' + str(index + 1)
        box(name + ' masonry shell', (x, height/2-.18, z),
            (12, height, frontage+.4), warehouse_materials[index])
        box(name + ' stone plinth', (face, .65, z), (.32, 1.6, frontage+.5), concrete)
        box(name + ' roof cap', (x, height-.12, z), (12.5, .35, frontage+.7), dark)
        box(name + ' parapet', (face, height+.35, z), (.42, .8, frontage+.5), concrete)
        # Recess-colored factory windows, divided by steel mullions and masonry piers.
        for bay in np.arange(z-frontage/2+2, z+frontage/2-1, 3.5):
            box(name + ' facade pier', (face-side*.18, height/2, bay-1.6),
                (.38, height, .38), concrete)
            for level in np.arange(5, height-1.5, 3.3):
                box(name + ' window reveal', (face-side*.22, level, bay),
                    (.13, 2.3, 2.55), dark)
                box(name + ' window glass', (face-side*.3, level, bay),
                    (.08, 1.95, 2.2), glass)
                box(name + ' window mullion', (face-side*.36, level, bay),
                    (.08, 2.1, .09), steel)
                box(name + ' window transom', (face-side*.36, level, bay),
                    (.08, .09, 2.25), steel)
                box(name + ' window sill', (face-side*.4, level-1.15, bay),
                    (.45, .17, 2.8), concrete)
            box(name + ' loading door', (face-side*.25, 2, bay), (.14, 2.8, 2.5), steel)
            for y in np.arange(.8, 3.4, .4):
                box(name + ' shutter rib', (face-side*.34, y, bay), (.07, .055, 2.45), dark)
        # Roof equipment gives the skyline a readable industrial silhouette.
        box(name + ' rooftop plant', (x, height+.9, z+2), (3.3, 1.8, 4), steel)
        box(name + ' plant cap', (x, height+1.85, z+2), (3.6, .16, 4.3), dark)
        for dz in [-.8, .8]:
            rod(name + ' exhaust', (x+side*2, height, z+dz-4),
                (x+side*2, height+2.7, z+dz-4), .23, dark, 8)
        rod(name + ' drainpipe', (face-side*.48, .3, z+frontage/2-.7),
            (face-side*.48, height, z+frontage/2-.7), .09, dark)

# Rail corridor lies wholly beyond the south touchline.
group('RAILWAY_INFRASTRUCTURE')
ballast=material('Rail ballast',(.235,.245,.23))
box('Raised railway embankment',(0,.5,16),(90,1,7),ballast)
for z in [14.5,17.6]:
    for x in np.arange(-44,45,.75):box('Railway sleeper',(x,1.04,z),(.22,.18,2.35),wood)
    for zz in [z-.72,z+.72]:
        box('Rail web',(0,1.2,zz),(90,.24,.07),dark)
        box('Polished rail head',(0,1.34,zz),(90,.075,.12),steel)
for x in [-29,29]:
    rod('Signal mast',(x,1,19.8),(x,5.1,19.8),.08,dark)
    box('Rail signal housing',(x,4.8,19.8),(.48,1,.35),dark)
    marker('Gulch Signal '+str(x),(x,4.8,19.58))
    text('Rail warning','LIVE TRACKS',(x,2.3,19.59),.22,cream)
# Steel truss gantry over the rail corridor, outside all playable bounds.
for x in [-28,28]:
    for z in [12.6,20.2]:rod('Gantry leg',(x,1,z),(x,6,z),.12,steel)
    for y in [5.4,6]:rod('Gantry beam',(x,y,12.6),(x,y,20.2),.09,dark)
    for i in range(7):rod('Gantry diagonal',(x,5.4,12.6+i),(x,6,13.6+i),.06,steel)

group('PARKED_BOXCARS')
for i,m in enumerate([containerRed,containerOchre,containerBlue]):
    cx=-12+i*12
    container('Parked boxcar',cx,2,14.5,10,m)
    box('Boxcar underframe',(cx,1.8,14.5),(10.7,.28,2.6),dark)
    box('Sliding freight door',(cx,3.3,13.19),(2.9,2.42,.08),m)
    for dx in [-1.45,1.45]:box('Door steel runner',(cx+dx,3.3,13.1),(.08,2.45,.1),steel)
    rod('Freight door handle',(cx+.9,2.8,13.05),(cx+.9,3.3,13.05),.035,steel)
    for xx in [cx-3.6,cx+3.6]:
        for zz in [13.4,15.6]:rod('Parked bogie wheel',(xx,1.62,zz-.1),(xx,1.62,zz+.1),.34,dark,10)
    for dx in [-4.2,4.2]:
        for y in [2.25,2.65,3.05,3.45]:rod('Boxcar ladder rung',(cx+dx-.18,y,13.17),(cx+dx+.18,y,13.17),.025,steel)
    for j in range(6):
        box('Faded paint repair',(cx+random.uniform(-4,4),random.uniform(2.3,4.1),13.225),(random.uniform(.2,.6),random.uniform(.12,.4),.012),mortar)

group('ANIMATED_ENVIRONMENT')
# Modular freight consist: one batch animated along a single, isolated track.
for i,m in enumerate([containerRed,containerOchre,containerBlue,containerRed]):
    cx=-17+i*11
    container('Gulch freight wagon',cx,2,17.6,9,m)
    box('Freight chassis',(cx,1.8,17.6),(10,.32,2.6),dark)
    for xx in [cx-3.4,cx+3.4]:
        for zz in [16.5,18.7]:rod('Freight wheel',(xx,1.63,zz-.10),(xx,1.63,zz+.10),.34,dark,10)
    rod('Wagon coupler',(cx-5.5,1.85,17.6),(cx-4.5,1.85,17.6),.10,steel)
    text('Fictional freight stencil','GULCH RAIL  /  '+str(320+i),(cx,3.3,18.87),.32,cream)

group('ENVIRONMENT_PROPS')
# Broad stairs lead down to a social area beside the locked court gate.
for i in range(7):box('Entrance stair',(-26+i*.55,.11*(7-i),-7.8),(.56,.22*(7-i),3.5),concrete)
for z in [-9.5,-6.1]:
    rod('Entrance handrail',(-26,2.5,z),(-22.1,1.05,z),.045,steel)
    for i in [0,3,6]:rod('Entrance baluster',(-26+i*.55,.22*(7-i),z),(-26+i*.55,2.5-i*.21,z),.03,dark)
box('Entrance sign frame',(-21,3,-11.5),(6,1,.18),dark)
text('Welcome sign','THE GULCH',(-21,3,-11.39),.77,cream)
text('Entry rules','OPEN COURT  /  ALL CLUBS WELCOME',(-21,2.35,-11.39),.23,orange)
box('Community noticeboard',(-20,1.5,-12.5),(2.2,1.4,.12),wood)
for i in range(5):box('Community flyer',(-20.8+i*.4,1.5+random.uniform(-.25,.25),-12.42),(.32,.52,.012),cream if i%2 else orange)
for x,z in [(-20,-3),(-10,-11.5),(9,-11.5)]:
    for dz in [-.22,0,.22]:box('Reclaimed bench plank',(x,.47,z+dz),(2.6,.11,.19),wood)
    for dx in [-1,1]:box('Bench block support',(x+dx,.22,z),(.23,.44,.62),concrete)
    box('Equipment bag',(x-.5,.7,z),(.65,.4,.38),teal)
    rod('Bag handle',(x-.66,.91,z),(x-.34,.91,z),.035,dark)
    for dx in [.4,.7]:rod('Water bottle',(x+dx,.52,z),(x+dx,.82,z),.055,glass,8)
box('Water cooler',(-20,.55,1),(.7,1.1,.65),cream)
box('Cooler blue lid',(-20,1.14,1),(.74,.1,.69),teal)
box('Portable speaker',(-20,.65,2),(.65,1.3,.6),dark)
for y in [.35,.9]:rod('Speaker cone',(-20,y,2.31),(-20,y,2.34),.21,steel,12)
for x,z in [(20,6),(20,7),(-20,5)]:
    rod('Industrial barrel',(x,.05,z),(x,.9,z),.36,containerRed,12)
    for y in [.18,.72]:rod('Barrel hoop',(x,y-.025,z),(x,y+.025,z),.37,dark,12)
for i in range(3):
    for j in range(5):box('Stacked pallet',(20+j*.22,.13+i*.16,8),(.18,.08,1.2),wood)
for x,z in [(-18,7),(18,-8),(19,-8)]:
    box('Cone base',(x,.05,z),(.45,.1,.45),rubber)
    for y,r in [(.15,.17),(.3,.13),(.45,.09),(.6,.05)]:rod('Traffic cone',(x,y-.08,z),(x,y+.08,z),r,cream if y==.45 else orange,8)
for x in [-22,22]:
    box('Utility cabinet',(x,.8,11),(.8,1.6,.6),teal)
    text('Utility warning','!',(x,1.1,11.31),.35,cream)
    for z in [-5,4]:rod('Safety bollard',(x,0,z),(x,.9,z),.09,orange)
for x in [-18,-13,15,20]:
    box('Planter curb',(x,.24,-11.8),(1,.48,.65),concrete)
    for _ in range(9):
        dx=random.uniform(-.4,.4);h=random.uniform(.6,1.3)
        rod('Volunteer garden stem',(x,.4,-11.8),(x+dx,h,-11.8),.018,wood,4)
        box('Garden foliage',(x+dx,h,-11.8),(.24,.12,.3),leaf)
# Puddles are behind the boards and have no gameplay colliders.
puddle=material('Gulch background puddle',(.10,.15,.18),.17,.25)
for x,z in [(-19,8),(19,10),(-8,12)]:floor('Background damp patch',x,z,1.8,.75,.003,puddle)

group('ENVIRONMENT_MURALS')
box('Mural field',(0,2.45,-12.82),(17.5,3.8,.035),teal)
text('Gulch mural headline','THE GULCH',(0,2.85,-12.78),1.5,cream)
text('Gulch mural subline','SMALL COURT.  BIG HEART.',(0,1.25,-12.77),.39,orange)
for sign in [-1,1]:
    for i in range(4):
        x=sign*(9.3+i*.72)
        mesh('Mural speed chevron',[(x-.4,1.1,-12.78),(x+.3,2.5,-12.78),(x-.4,3.9,-12.78),(x+.05,3.9,-12.78),(x+.75,2.5,-12.78),(x+.05,1.1,-12.78)],[(0,1,2,3,4,5)],orange if i%2 else cream)
text('Community graffiti','PLAY AFTER WORK',(-17,2.9,-12.78),.49,cream)
text('Street branding','STREET / ATL',(18,3.1,-12.78),.57,orange)
text('Court open hours','NO KEEPERS. NO EXCUSES.',(18,2.25,-12.78),.26,cream)

group('TEAM_CUSTOMIZATION')
for x,label in [(-10,'Home'),(10,'Away')]:
    box('Gulch '+label+' Banner Backing',(x,.48,-Z+.15),(2.6,.72,.02),dark)
    marker('Gulch '+label+' Banner',(x,.48,-Z+.17),width=2.5,height=.68)
marker('Gulch Optional Centre Crest',(0,.02,0),radius=1.5)

group('LIGHTING')
for x in [-13,13]:
    for z in [-11.1,11.1]:
        rod('Industrial flood mast',(x,0,z),(x,6.8,z),.07,dark)
        box('Floodlight crossarm',(x,6.6,z),(1.45,.1,.15),steel)
        for dx in [-.42,.42]:
            box('Floodlight housing',(x+dx,6.6,z),(.64,.3,.35),dark)
            box('Floodlight lens',(x+dx,6.43,z),(.53,.025,.27),light)
        marker('Gulch Flood '+str(x)+' '+str(z),(x,6.35,z))
for x in [-20,0,20]:
    box('Wall sconce housing',(x,3.9,-12.6),(.46,.28,.35),dark)
    box('Wall sconce lens',(x,3.74,-12.6),(.36,.04,.24),light)
marker('Gulch Entrance Lamp',(-21,3.5,-9.8))
group('AUDIO_MARKERS')
marker('Gulch Audio Train',(0,2,17.6),ambience='outdoor rail rumble')
marker('Gulch Audio Speaker',(-20,1,2),ambience='community music')
marker('Gulch Audio Entrance',(-21,1,-8),ambience='small crowd')

group('CAMERA_REFERENCES')
def camera(name,p,target,lens):
    d=bpy.data.cameras.new(name);d.lens=lens
    o=bpy.data.objects.new(name,d);active.objects.link(o);o.location=xyz(p)
    o.rotation_euler=(Vector(xyz(target))-o.location).to_track_quat('-Z','Y').to_euler();return o
scene=bpy.context.scene
scene.camera=camera('Gulch Review Overview',(35,31,38),(0,1,0),45)
camera('Gulch Gameplay Sideline',(0,9,15),(0,0,0),26)
camera('Gulch Gameplay End',(-18,9,0),(0,0,0),26)
camera('Gulch Intro Rail',(25,2.3,21),(-12,2,16),32)
camera('Gulch Intro Reveal',(-25,9,20),(0,1,0),30)
camera('Gulch Intro Entrance',(-23,2,-4),(-15,1,-8),35)
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.23,.33,.48,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
def lamp(name,kind,p,power,color,size=5):
    d=bpy.data.lights.new(name,kind);d.energy=power;d.color=color
    if kind=='AREA':d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);active.objects.link(o);o.location=xyz(p);return o
group('REVIEW_LIGHTING')
sun=lamp('Review dusk sun','SUN',(20,25,12),1.35,(1,.64,.35))
sun.rotation_euler=(.9,-.4,-.5);sun.data.angle=.16
lamp('Review sky fill','AREA',(0,25,0),3500,(.55,.72,1),36)
for x in [-13,13]:
    for z in [-11.1,11.1]:lamp('Review court flood','AREA',(x,6.4,z),400,(.8,.9,1),4)
for x in [-20,0,20]:lamp('Review wall pool','POINT',(x,3.4,-12),100,(1,.52,.20))
scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(OUT/'gulch-preview.png')
# Reverse the environment around the standardized court, keeping gameplay coordinates intact.
# The railway is the far-side backdrop; the retaining wall is on the camera side.
reflection=Matrix.Diagonal((1,-1,1,1))
bpy.context.view_layer.update()
core=set(c.name for c in groups['STREET_COURT'].children)|{'STREET_COURT'}
for name,c in groups.items():
    if name in core or name in {'CAMERA_REFERENCES','DISTANT_SKYLINE','TEAM_CUSTOMIZATION'}:continue
    for obj in c.objects:obj.matrix_world=reflection@obj.matrix_world
scene['venue']='THE GULCH | STREET 3v3 / 5v5'
scene['court_spec']=json.dumps(SPEC)
scene['units']='Metres. Blender X = runtime X; Blender Z = runtime height; Blender -Y = runtime Z.'
scene.unit_settings.system='METRIC'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.color_type='MATERIAL'
notes=bpy.data.texts.new('READ ME - The Gulch')
notes.write('THE GULCH\nAppend STREET_COURT into future venues; scenery lives in independent collections.\nDimensions come from src/streetArena.json, shared with the game.\nGOALS are review geometry; runtime builds the same dimensions with animated nets.\nGAMEPLAY_COLLISION is a hidden wire guide; runtime uses swept analytic boundaries.\nPaint tint is independent of grayscale concrete grain and wear. All textures are packed.\nNo environment lettering. Railway scenery faces the default sideline camera. Four fence and four rebound collections cover all sides; only the goalmouths are open.\nRuntime controls foreground fence visibility, outdoor lighting, signals and the freight train.\nIntro camera and audio markers are supplied; the full cinematic/audio pass is deferred.\nRebuild with Blender --background --python build_gulch.py.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'The Gulch.blend'))
# The reusable source collection can be appended from either .blend file.
bpy.data.libraries.write(str(OUT/'STREET Court Template.blend'),{groups['STREET_COURT']},fake_user=True)
# Export a grayscale paint texture; the tint remains a glTF baseColorFactor.
for m in [paint,asphalt]:
    tree=m.node_tree;tex=tree.nodes.new('ShaderNodeTexImage');tex.image=img
    tree.links.new(tex.outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])
exclude={'STREET_COURT','GOALS','GAMEPLAY_COLLISION','CAMERA_REFERENCES','REVIEW_LIGHTING'}
for name,c in groups.items():
    if name in exclude:continue
    bpy.ops.object.select_all(action='DESELECT')
    objects=[o for o in c.objects if o.type in ('MESH','CURVE','FONT')]
    if not objects:continue
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.make_single_user(type='SELECTED_OBJECTS',object=True,obdata=True,material=False)
    bpy.ops.object.convert(target='MESH');bpy.ops.object.join();bpy.context.object.name=name
bpy.ops.object.select_all(action='DESELECT')
for name,c in groups.items():
    if name not in exclude:
        for o in c.objects:o.select_set(True)
path=OUT/'the-gulch.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_lights=False,export_cameras=False,export_extras=True)
# Standard glTF factors preserve independently editable slate/asphalt paint.
raw=path.read_bytes();n=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+n]);tail=raw[20+n:]
for m in doc.get('materials',[]):
    if m['name'] in [paint.name,asphalt.name]:m['pbrMetallicRoughness']['baseColorFactor']=list(bpy.data.materials[m['name']].diffuse_color)
encoded=json.dumps(doc,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
path.write_bytes(struct.pack('<4sII',b'glTF',2,20+len(encoded)+len(tail))+struct.pack('<I4s',len(encoded),b'JSON')+encoded+tail)
# Restore the Blender material multiplication for the review render.
for m in [paint,asphalt]:
    tree=m.node_tree;mix=next(n for n in tree.nodes if n.type=='MIX_RGB');tree.links.new(mix.outputs[0],tree.nodes.get('Principled BSDF').inputs['Base Color'])
bpy.ops.render.render(write_still=True)
# Smaller menu artwork, generated from the same scene rather than a different concept.
scene.render.resolution_x=640;scene.render.resolution_y=400
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=90
scene.render.filepath=str(OUT.parent.parent/'src/art/stadium-previews/gulch.jpg')
bpy.ops.render.render(write_still=True)
print('GULCH_DONE',path)
