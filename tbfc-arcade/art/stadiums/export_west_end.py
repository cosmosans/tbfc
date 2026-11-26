"""Export the West End venue with its platform sign fitted for the game."""
from pathlib import Path
import bpy
from mathutils import Vector

source = Path(bpy.data.filepath)
sign = bpy.data.collections['west-end-sign']
label = next(obj for obj in sign.objects if obj.type == 'FONT')
panel = sign.objects['Cube']
stripes = [obj for obj in sign.objects if obj not in (panel, label)]

font = label.data.font
if font.filepath and not font.packed_file and not Path(bpy.path.abspath(font.filepath)).is_file():
    for path in ('/Applications/BuhoCleaner.app/Contents/Resources/Lato-Bol.otf',
                 '/System/Library/Fonts/Supplemental/Arial Bold.ttf'):
        if Path(path).is_file():
            label.data.font = bpy.data.fonts.load(path, check_existing=True)
            break

def corners(obj):
    return [obj.matrix_world @ Vector(point) for point in obj.bound_box]

# In Blender the sign faces -Y. Fit the wordmark in the space beside the stripes.
bpy.context.view_layer.update()
# The source stripes share venue materials, one of which match branding recolors.
# Preserve their authored colors under station-specific material names.
stripes.sort(key=lambda stripe: min(point.x for point in corners(stripe)))
for stripe, color in zip(stripes, ('orange', 'gold', 'blue'), strict=True):
    slot = stripe.material_slots[0]
    ink = slot.material.copy()
    ink.name = 'West End station stripe • ' + color
    slot.link = 'OBJECT'
    slot.material = ink

face = corners(panel)
stripe_points = [p for stripe in stripes for p in corners(stripe)]
outer_padding = min(p.x for p in stripe_points) - min(p.x for p in face)
left = max(p.x for p in stripe_points) + .13
right = max(p.x for p in face) - outer_padding
center_z = (min(p.z for p in face) + max(p.z for p in face)) / 2
label.data.extrude = 0
label.data.bevel_depth = 0
bpy.context.view_layer.update()
points = corners(label)
label.scale *= (right-left) / (max(p.x for p in points)-min(p.x for p in points))
bpy.context.view_layer.update()
points = corners(label)
label.location += Vector((left-min(p.x for p in points),
                          min(p.y for p in face)-.012-max(p.y for p in points),
                          center_z-(min(p.z for p in points)+max(p.z for p in points))/2))
ink = bpy.data.materials.new('West End station lettering • cream')
ink.use_nodes = True
shader = ink.node_tree.nodes.get('Principled BSDF')
shader.inputs['Base Color'].default_value = (.99, .92, .76, 1)
shader.inputs['Emission Color'].default_value = (.99, .92, .76, 1)
shader.inputs['Emission Strength'].default_value = .65
label.data.materials.clear()
label.data.materials.append(ink)
bpy.ops.object.select_all(action='DESELECT')
label.select_set(True)
bpy.context.view_layer.objects.active = label
bpy.ops.object.convert(target='MESH')
stadium_output = source.with_name('stationsoccer-west-end.glb')
exec((source.parent / 'export_school.py').read_text())
