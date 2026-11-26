"""Export Cabbagetown with independently switchable pendant bays."""
import bpy
from pathlib import Path

source = Path(bpy.data.filepath)
roof = bpy.data.collections['01 Rafters skylights and pendants']
bpy.context.view_layer.layer_collection.children[roof.name].hide_viewport = False
for obj in roof.objects:
    obj.hide_set(False)
bpy.context.view_layer.update()
lens = bpy.data.materials['Porcelain pendant lens']
bays = [lens.copy() for _ in range(3)]
for index, material in enumerate(bays):
    material.name = f'Mill pendant bay {index + 1}'
for obj in roof.objects:
    if obj.name.startswith('Lamp diffuser'):
        x = obj.matrix_world.translation.x
        obj.material_slots[0].link = 'OBJECT'
        obj.material_slots[0].material = bays[0 if x < -16 else 2 if x > 16 else 1]

def bake_floor():
    # Bake the slab in object space before its geometry is joined to the court.
    slab = bpy.data.objects['Mill foundation']
    mesh = slab.data = slab.data.copy()
    uv = mesh.uv_layers.active
    for face in mesh.polygons:
        for loop in face.loop_indices:
            co = mesh.vertices[mesh.loops[loop].vertex_index].co
            uv.data[loop].uv = (co.x + .5, co.y + .5) if face.normal.z > .9 else (0, 0)

    bpy.ops.object.select_all(action='DESELECT')
    slab.select_set(True)
    bpy.context.view_layer.objects.active = slab
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 1
    mat = slab.active_material
    tree = mat.node_tree
    nodes = tree.nodes
    out = next(n for n in nodes if n.type == 'OUTPUT_MATERIAL' and n.is_active_output).inputs['Surface']
    shader = out.links[0].from_node
    emission = tree.nodes.new('ShaderNodeEmission')
    target = nodes.new('ShaderNodeTexImage')
    nodes.active = target
    baked = {}
    for channel in ('Base Color', 'Roughness'):
        image = bpy.data.images.new('Mill concrete ' + channel, 1536, 1200, alpha=False)
        if channel != 'Base Color':
            image.colorspace_settings.name = 'Non-Color'
        target.image = image
        tree.links.new(shader.inputs[channel].links[0].from_socket, emission.inputs['Color'])
        tree.links.new(emission.outputs[0], out)
        bpy.ops.object.bake(type='EMIT', margin=0)
        image.scale(768, 600)
        image.pack()
        baked[channel] = image

    simple = bpy.data.materials.new('Mill floor • polished concrete')
    simple.use_nodes = True
    tree = simple.node_tree
    surface = tree.nodes.get('Principled BSDF')
    for channel, image in baked.items():
        tex = tree.nodes.new('ShaderNodeTexImage')
        tex.image = image
        tree.links.new(tex.outputs['Color'], surface.inputs[channel])
    slab.active_material = simple

    # The perimeter plinths and loading platform share the slab's procedural
    # material. Use the same bake on their vertical and horizontal faces.
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH' or obj.active_material != mat:
            continue
        mesh = obj.data = obj.data.copy()
        uv = mesh.uv_layers.active or mesh.uv_layers.new()
        normal_matrix = obj.matrix_world.to_3x3().inverted().transposed()
        for face in mesh.polygons:
            normal = normal_matrix @ face.normal
            axis = max(range(3), key=lambda i: abs(normal[i]))
            u, v = ((1, 2), (0, 2), (0, 1))[axis]
            for loop in face.loop_indices:
                point = obj.matrix_world @ mesh.vertices[mesh.loops[loop].vertex_index].co
                uv.data[loop].uv = (point[u] / slab.dimensions.x + .5,
                                    point[v] / slab.dimensions.y + .5)
        obj.active_material = simple

bake_floor()

stadium_output = globals().get('mill_output', source.with_name('cotton-mill-lofts.glb'))
exec((source.parent / 'export_school.py').read_text())
