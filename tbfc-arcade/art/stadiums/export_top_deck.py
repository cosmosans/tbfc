"""Run with The Top Deck - Asphalt.blend open in background Blender."""
import bpy
from pathlib import Path

source = Path(bpy.data.filepath)
assert source.stem == 'The Top Deck - Asphalt'
scene = bpy.context.scene
preview = source.parents[2] / 'src/art/stadium-previews/topdeck.jpg'
scene.render.filepath = str(preview)
bpy.ops.render.render(write_still=True)

# Capture unlit color in court coordinates so the browser lights the chipped
# paint and pavement together. The editable procedural materials stay in Blender.
from tempfile import TemporaryDirectory
with TemporaryDirectory() as scratch:
    panels = [obj for obj in scene.objects if obj.name.startswith('Asphalt surface')]
    markings = list(bpy.data.collections['02 • Field paint'].objects)
    assert len(panels) == 12 and markings
    for obj in scene.objects:
        obj.hide_render = obj not in panels and obj not in markings
    for mat in {obj.material_slots[0].material for obj in panels + markings}:
        nodes = mat.node_tree.nodes
        color = nodes.get('Principled BSDF').inputs['Base Color'].links[0].from_socket
        pigment = nodes.new('ShaderNodeEmission')
        mat.node_tree.links.new(color, pigment.inputs['Color'])
        mat.node_tree.links.new(pigment.outputs[0], nodes.get('Material Output').inputs['Surface'])
    cam = scene.camera
    cam.location = (0, 0, 4)
    cam.rotation_euler = (0, 0, 0)
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 48
    cam.data.sensor_fit = 'HORIZONTAL'
    scene.render.resolution_x, scene.render.resolution_y = 3072, 1856
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0
    scene.cycles.samples = 4
    scene.cycles.use_denoising = False
    texture = Path(scratch) / 'Weathered asphalt and painted lines.jpg'
    scene.render.image_settings.quality = 94
    scene.render.filepath = str(texture)
    bpy.ops.render.render(write_still=True)

    bpy.ops.wm.open_mainfile(filepath=str(source))
    panels = [obj for obj in bpy.context.scene.objects if obj.name.startswith('Asphalt surface')]
    # Keep the court's full-field UVs separate from the garage's multiple UV maps.
    collection = bpy.data.collections.new('Painted rooftop court')
    bpy.context.scene.collection.children.link(collection)
    for obj in panels:
        bpy.data.objects.remove(obj, do_unlink=True)
    mesh = bpy.data.meshes.new('Court surface')
    mesh.from_pydata([(-24,-14.5,.004),(24,-14.5,.004),(24,14.5,.004),(-24,14.5,.004)], [], [(0,1,2,3)])
    uv = mesh.uv_layers.new()
    for corner, coords in zip(uv.data, [(0,0),(1,0),(1,1),(0,1)]):
        corner.uv = coords
    court = bpy.data.objects.new('Painted asphalt court', mesh)
    collection.objects.link(court)
    material = bpy.data.materials.new('Weathered asphalt and yellow paint')
    material.use_nodes = True
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value = .88
    image_node = material.node_tree.nodes.new('ShaderNodeTexImage')
    image_node.image = bpy.data.images.load(str(texture))
    material.node_tree.links.new(image_node.outputs['Color'], shader.inputs['Base Color'])
    mesh.materials.append(material)
    # Use the original venue's runtime filename.
    exec((source.parent / 'export_school.py').read_text(), {'stadium_output': source.with_name('the-top-deck.glb')})
