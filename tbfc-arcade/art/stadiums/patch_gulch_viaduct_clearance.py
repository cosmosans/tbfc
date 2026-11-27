"""Move the west elevated deck clear of the current warehouse material pass.
Run with Blender --factory-startup --background --python this_file.py.
Loads the saved scene, moves the complete west viaduct assembly, preserves materials.
"""
from pathlib import Path
import shutil
import bpy
from mathutils import Vector

source = Path(__file__).resolve().parent / 'The Gulch.blend'
bpy.ops.wm.open_mainfile(filepath=str(source))
scene = bpy.context.scene
if scene.get('west_viaduct_clearance_fixed'):
    raise RuntimeError('Already repaired; edit the west viaduct directly for further adjustments.')
backup = source.with_name('The Gulch - before viaduct clearance.blend')
if not backup.exists():
    shutil.copy2(source, backup)
# Match the east deck's 31 m centreline. Moving the entire assembly preserves
# pillar alignment and leaves a visible gap to the projecting facade details.
west = [o for o in bpy.data.objects if o.name.startswith('Viaduct ') and o.location.x < 0]
assert len(west) == 5, [o.name for o in west]
for obj in west:
    obj.location.x += 4
bpy.context.view_layer.update()
deck = next(o for o in west if o.name.startswith('Viaduct deck'))
outer_edge = min((deck.matrix_world @ Vector(v)).x for v in deck.bound_box)
# The west facade's closest trim is beyond -35 m; deck now stops at -34.5 m.
assert abs(outer_edge + 34.5) < .001, outer_edge
scene['west_viaduct_clearance_fixed'] = True
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(source))
print('VIADUCT_FIXED', [o.name for o in west], 'outer edge', outer_edge)
# Render only after saving; the artist's stored camera and render settings stay intact.
scene.render.engine='CYCLES';scene.cycles.samples=16
scene.render.resolution_x=1100;scene.render.resolution_y=750;scene.render.resolution_percentage=100
camera=scene.camera;camera.location=(-20,-25,18)
camera.rotation_euler=(Vector((-34,7,7))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.lens=35
scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(source.with_name('gulch-west-viaduct-clearance.png'))
bpy.ops.render.render(write_still=True)
