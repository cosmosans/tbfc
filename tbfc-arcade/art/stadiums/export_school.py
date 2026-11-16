import bpy
from pathlib import Path
source=Path(bpy.data.filepath)
bpy.ops.object.select_all(action='DESELECT')
for group in bpy.data.collections:
    selected=[o for o in group.objects if o.type in {'MESH','CURVE'} and not (group.name.startswith('02') and not o.name.startswith('Faded hash')) and not any(label in o.name for label in ('soccer frame',' • net'))]
    if not selected: continue
    for o in selected:o.select_set(True)
    bpy.context.view_layer.objects.active=selected[0]
    bpy.ops.object.convert(target='MESH')
    # Joining writes into the active mesh. Keep linked instances in other
    # collections independent of this temporary export batch.
    active = bpy.context.view_layer.objects.active
    if active.data.users > 1:
        active.data = active.data.copy()
    if len(selected) > 1:
        bpy.ops.object.join()
    obj=bpy.context.object
    obj.name=group.name
    obj.select_set(False)
for o in bpy.context.scene.objects:
    o.select_set((o.name in bpy.data.collections and o.type=='MESH') or o.name.startswith('WestEndAnchor '))
bpy.ops.export_scene.gltf(filepath=str(source.with_name(source.stem.lower().replace(' ', '-') + '.glb')),use_selection=True,export_yup=True)
