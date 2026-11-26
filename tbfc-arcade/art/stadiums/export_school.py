import bpy
from pathlib import Path
source=Path(bpy.data.filepath)
output=globals().get("stadium_output", source.with_name(source.stem.lower().replace(" ", "-") + ".glb"))
# Joins match UV layers by name. Put each mesh's render UVs in the first
# channel before joining, including meshes using Blender's "automap" layer.
preserve_render_uv = source.stem in {'High School Track', 'StationSoccer West End', 'StationSoccer West End-Detail-Pass', 'The Top Deck - Asphalt'}
if preserve_render_uv:
    for mesh in bpy.data.meshes:
        layers = mesh.uv_layers
        active = next((layer for layer in layers if layer.active_render), None)
        if active is None:
            continue
        for layer in list(layers):
            if layer != active:
                layers.remove(layer)
        layers[0].name = 'UVMap'

    # The turf uses two half turns about X and Y, equivalent to one half
    # turn about Z. glTF texture transforms support only the latter.
    if source.stem.startswith('StationSoccer West End'):
        from math import pi, isclose
        for name in ('GreenGrass', 'GreenGrass.001'):
            material = bpy.data.materials.get(name)
            if material is None:
                continue
            mapping = material.node_tree.nodes.get('Mapping')
            rotation = mapping.inputs['Rotation'].default_value
            if all(isclose(abs(a), pi, abs_tol=1e-5) for a in rotation[:2]):
                mapping.inputs['Rotation'].default_value = (0, 0, rotation.z + pi)

    # These Blender metals use generated coordinates or procedural shaders.
    # Direct-lit game equivalents keep their finish without reflection probes.
    for name, color, metalness, roughness in [
        ('Metal', (.54, .59, .62), .32, .32),
        ('Brushed Black Metal', (.068, .075, .083), .25, .42),
        ('Metal with rust and brush', (.27, .22, .18), .30, .50),
    ]:
        material = bpy.data.materials.get(name)
        if material is None:
            continue
        nodes = material.node_tree.nodes
        nodes.clear()
        shader = nodes.new('ShaderNodeBsdfPrincipled')
        shader.inputs['Base Color'].default_value = (*color, 1)
        shader.inputs['Metallic'].default_value = metalness
        shader.inputs['Roughness'].default_value = roughness
        output_node = nodes.new('ShaderNodeOutputMaterial')
        material.node_tree.links.new(shader.outputs['BSDF'], output_node.inputs['Surface'])

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
    if preserve_render_uv and obj.data.uv_layers:
        uv = obj.data.uv_layers[0]
        uv.active_render = True
        # A few background buildings have mapped and unmapped faces
        # in one batch. Tile only the collapsed masonry faces in world meters.
        masonry = {'Stylized stone brick', 'Shingle Roof Tiles Dark Rounded', 'Painted White Brick Wall'}
        slots = {i for i, slot in enumerate(obj.material_slots) if slot.name in masonry}
        for face in obj.data.polygons:
            if face.material_index not in slots:
                continue
            if len({tuple(uv.data[i].uv) for i in face.loop_indices}) >= 3:
                continue
            points = [obj.matrix_world @ obj.data.vertices[i].co for i in face.vertices]
            normal = (points[1]-points[0]).cross(points[2]-points[0])
            axis = max(range(3), key=lambda i: abs(normal[i]))
            axes = ((1, 2), (0, 2), (0, 1))[axis]
            for loop, point in zip(face.loop_indices, points):
                uv.data[loop].uv = (point[axes[0]], point[axes[1]])
    obj.select_set(False)
for o in bpy.context.scene.objects:
    o.select_set((o.name in bpy.data.collections and o.type=='MESH') or o.name.startswith('WestEndAnchor '))
# Some Blender venue revisions keep their lettering directly in the scene root.
for label in bpy.context.scene.collection.objects:
    if label.type == 'FONT' and not label.hide_render:
        font = label.data.font
        if font.filepath and not font.packed_file and not Path(bpy.path.abspath(font.filepath)).is_file():
            fallback = Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
            label.data.font = bpy.data.fonts.load(str(fallback), check_existing=True) if fallback.exists() else bpy.data.fonts.get('Bfont Regular') or font
        label.select_set(True)
        bpy.context.view_layer.objects.active = label
bpy.ops.export_scene.gltf(filepath=str(output),use_selection=True,export_yup=True)
