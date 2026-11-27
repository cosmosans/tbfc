"""Bake the current artist-authored Gulch for glTF without saving over its source.

Run: Blender --factory-startup --background --python export_gulch.py
Bakes material channels, never scene lighting. Original UVs/generated coordinates
remain available while a separate packed UV layer receives the game atlases.
"""
import bpy
import math
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'The Gulch.blend'
CACHE=ROOT/'gulch-baked'
CACHE.mkdir(exist_ok=True)
source_hash=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=8
scene.render.bake.margin=8;scene.render.bake.use_clear=False
EXCLUDE={'STREET_COURT','GOALS','GAMEPLAY_COLLISION','CAMERA_REFERENCES','REVIEW_LIGHTING'}
export_objects=[]
for c in bpy.data.collections:
 if c.name in EXCLUDE:continue
 export_objects.extend(o for o in c.objects if not o.hide_render and o.type in {'MESH','CURVE','EMPTY'})
export_objects=list(dict.fromkeys(export_objects))
# Evaluate underpass modifiers before packing UVs. Never touch the saved source.
meshes=[o for o in export_objects if o.type in {'MESH','CURVE'}]
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0]
bpy.ops.object.make_single_user(type='SELECTED_OBJECTS',object=True,obdata=True,material=False)
bpy.ops.object.convert(target='MESH')
meshes=[o for o in meshes if o.type=='MESH' and len(o.data.polygons)]
# Exported meshes use one material per object in this source; fail explicitly if
# an artist adds a multi-material mesh so its atlas cannot silently overwrite another.
material_objects={}
for o in meshes:
 mats={s.material for s in o.material_slots if s.material}
 for m in mats:material_objects.setdefault(m,[]).append(o)

def channel(tree, shader, name):
 """Resolve a Principled/Mix Shader channel, including the procedural rust blend."""
 if shader.type=='BSDF_PRINCIPLED':
  socket=shader.inputs[name]
  if socket.is_linked:return socket.links[0].from_socket
  n=tree.nodes.new('ShaderNodeRGB' if name=='Base Color' else 'ShaderNodeValue')
  n.outputs[0].default_value=socket.default_value
  return n.outputs[0]
 if shader.type=='MIX_SHADER':
  mix=tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MIX'
  factor=shader.inputs[0]
  if factor.is_linked:tree.links.new(factor.links[0].from_socket,mix.inputs[0])
  else:mix.inputs[0].default_value=factor.default_value
  for i in [1,2]:tree.links.new(channel(tree,shader.inputs[i].links[0].from_node,name),mix.inputs[i])
  return mix.outputs[0]
 raise RuntimeError('Unsupported surface shader: '+shader.type)

report=[]
for material,objects in material_objects.items():
 if not material.use_nodes:continue
 tree=material.node_tree
 # Solid Principled colours already export losslessly; bake only textured graphs.
 if not any(n.type in {'TEX_IMAGE','TEX_NOISE','GROUP','MIX_SHADER'} for n in tree.nodes):continue
 assert all(len({s.material for s in o.material_slots if s.material})==1 for o in objects),material.name
 print('BAKE_START',material.name,len(objects),flush=True)
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:
  o.select_set(True)
  original=next((uv for uv in o.data.uv_layers if uv.active_render),None)
  if original is None:original=o.data.uv_layers.new(name='SourceUV')
  original.active_render=True
  layer=o.data.uv_layers.new(name='GameBakeUV');o.data.uv_layers.active=layer
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
 bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.008)
 bpy.ops.object.mode_set(mode='OBJECT')
 output=next(n for n in tree.nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output)
 surface=output.inputs['Surface'].links[0].from_socket
 shader=surface.node
 # The gym tiles have a uniform authored tint. Keep it as a material factor,
 # not a blue bitmap, so the runtime palette changes only the tile colour.
 tile_tint=None
 if material.name=='rubber_tiles':
  socket=shader.inputs['Base Color']
  if socket.is_linked and socket.links[0].from_node.type=='RGB':
   tile_tint=tuple(socket.links[0].from_node.outputs[0].default_value)
 # Preserve full shader normal evaluation before substituting channel emissions.
 resolution=2048 if material.name in {'Wood','Concrete used','Old concrete road scan','rubber_tiles'} else 1024
 maps={}
 for name in ['Normal','Base Color','Roughness','Metallic']:
  image=bpy.data.images.new(material.name+' '+name,width=resolution,height=resolution,alpha=False)
  image.colorspace_settings.name='sRGB' if name=='Base Color' else 'Non-Color'
  target=tree.nodes.new('ShaderNodeTexImage');target.image=image
  for n in tree.nodes:n.select=False
  target.select=True;tree.nodes.active=target
  if name!='Normal':
   emit=tree.nodes.new('ShaderNodeEmission')
   tree.links.new(channel(tree,shader,name),emit.inputs['Color'])
   tree.links.new(emit.outputs[0],output.inputs['Surface'])
  bpy.ops.object.bake(type='NORMAL' if name=='Normal' else 'EMIT',uv_layer='GameBakeUV',use_clear=False)
  if name!='Normal':tree.links.new(surface,output.inputs['Surface']);tree.nodes.remove(emit)
  image.filepath_raw=str(CACHE/(material.name.replace(' ','_')+'_'+name.replace(' ','_')+'.png'))
  image.file_format='PNG';image.save();image.pack();maps[name]=image
 # Replace only the in-memory export material with its portable PBR equivalent.
 tree.nodes.clear();p=tree.nodes.new('ShaderNodeBsdfPrincipled');out=tree.nodes.new('ShaderNodeOutputMaterial');tree.links.new(p.outputs[0],out.inputs['Surface'])
 if tile_tint:p.inputs['Base Color'].default_value=tile_tint
 for name,img in maps.items():
  if name=='Base Color' and tile_tint:continue
  tex=tree.nodes.new('ShaderNodeTexImage');tex.image=img
  if name=='Normal':
   normal=tree.nodes.new('ShaderNodeNormalMap');tree.links.new(tex.outputs['Color'],normal.inputs['Color']);tree.links.new(normal.outputs[0],p.inputs['Normal'])
  else:tree.links.new(tex.outputs['Color'],p.inputs[name])
 for o in objects:
  uv=o.data.uv_layers.get('GameBakeUV')
  for layer in list(o.data.uv_layers):
   if layer!=uv:o.data.uv_layers.remove(layer)
  uv.name='UVMap';uv.active_render=True
 report.append({'material':material.name,'objects':len(objects),'resolution':resolution})
 print('BAKE_DONE',material.name,flush=True)
# Join only within the original semantic collections, preserving runtime names.
for c in bpy.data.collections:
 if c.name in EXCLUDE:continue
 batch=[o for o in c.objects if o in meshes]
 if not batch:continue
 bpy.ops.object.select_all(action='DESELECT')
 for o in batch:o.select_set(True)
 bpy.context.view_layer.objects.active=batch[0]
 bpy.ops.object.join();bpy.context.object.name=c.name
bpy.ops.object.select_all(action='DESELECT')
for c in bpy.data.collections:
 if c.name not in EXCLUDE:
  for o in c.objects:
   if not o.hide_render and o.type in {'MESH','EMPTY'}:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'the-gulch.glb'),export_format='GLB',use_selection=True,export_lights=False,export_cameras=False,export_extras=True)
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==source_hash,'Source changed during export'
(ROOT/'gulch-bake-report.json').write_text(json.dumps({'source_sha256':source_hash,'materials':report},indent=2)+'\n')
print('GULCH_EXPORT_DONE',flush=True)
