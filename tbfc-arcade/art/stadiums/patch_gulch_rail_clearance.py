"""Add editable railway portals to the CURRENT Gulch, preserving its art pass.

Run with Blender --background --python patch_gulch_rail_clearance.py.
Unlike build_gulch.py this loads the saved source; it never rebuilds the venue.
Coordinates here are Blender coordinates: X along rails, Y across rails, Z up.
"""
from pathlib import Path
import shutil
import bpy
from mathutils import Vector

SOURCE = Path(__file__).resolve().parent / 'The Gulch.blend'
BACKUP = SOURCE.with_name('The Gulch - before rail clearance.blend')
COLLECTION = 'RAIL_UNDERPASSES'
MODIFIER = 'Rail corridor clearance'
# Both lines and wagon bodies fit inside this shared opening (metres).
CROSS_MIN, CROSS_MAX = 12.0, 20.2
CEILING = 6.6

bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
if bpy.data.collections.get(COLLECTION):
    raise RuntimeError('Rail portals already exist; edit their cutters instead of patching twice.')
if not BACKUP.exists():
    shutil.copy2(SOURCE, BACKUP)
materials_before = [(m.name, m.as_pointer()) for m in bpy.data.materials]
collection = bpy.data.collections.new(COLLECTION)
bpy.context.scene.collection.children.link(collection)

def box(name, location, dimensions, material=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    return obj

def bounds(obj):
    points = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
    return ([min(p[i] for p in points) for i in range(3)],
            [max(p[i] for p in points) for i in range(3)])

concrete = bpy.data.materials['Warm concrete']
dark = bpy.data.materials['Charcoal steel']
count = 0
for sign, side in [(-1, 'WEST'), (1, 'EAST')]:
    cutter = box(side+' rail clearance cutter', (sign*42, (CROSS_MIN+CROSS_MAX)/2, (CEILING-1)/2),
                 (15, CROSS_MAX-CROSS_MIN, CEILING+1))
    cutter.display_type = 'WIRE'
    cutter.hide_render = True
    cutter.hide_set(True)
    cutter['purpose'] = 'Editable clearance through warehouse shell and facade; do not export as visible geometry.'
    lo, hi = bounds(cutter)
    for obj in bpy.data.collections['HORIZON_BUILDINGS_'+side].objects:
        if obj.type != 'MESH':
            continue
        a,b = bounds(obj)
        if all(a[i] < hi[i] and b[i] > lo[i] for i in range(3)):
            modifier = obj.modifiers.new(MODIFIER, 'BOOLEAN')
            modifier.operation = 'DIFFERENCE'
            modifier.solver = 'EXACT'
            modifier.object = cutter
            count += 1
    # An industrial concrete frame reads as an intentional underpass, not a cut wall.
    face = sign*35.45
    for y in [CROSS_MIN-.22, CROSS_MAX+.22]:
        box(side+' portal jamb', (face,y,CEILING/2), (.75,.44,CEILING), concrete)
    box(side+' portal lintel', (face,(CROSS_MIN+CROSS_MAX)/2,CEILING+.28),
        (.85,CROSS_MAX-CROSS_MIN+1.1,.56), concrete)
    # Recessed shadow closure hides the finite rail ends, beyond the 45 m track tips.
    box(side+' tunnel shadow end', (sign*49,(CROSS_MIN+CROSS_MAX)/2,CEILING/2),
        (.3,CROSS_MAX-CROSS_MIN,CEILING), dark)

assert materials_before == [(m.name, m.as_pointer()) for m in bpy.data.materials]
scene=bpy.context.scene
scene['rail_clearance_note']='Editable rail underpasses in RAIL_UNDERPASSES; materials preserved from current source.'
# Keep the existing .blend1 from the artist's save history intact.
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE))
print('RAIL_CLEARANCE_DONE', count, 'objects with non-destructive clearance; materials unchanged')
