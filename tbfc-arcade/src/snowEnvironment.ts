import * as T from 'three'

// Snow follows the existing scenery geometry: no floating plane over tracks,
// stairs, rooftop edges or streets below the stadium. Installed before players
// and match effects are created, so their artwork is never recoloured.
export function snowEnvironment(scene:T.Scene){
  const amount={value:0},enabled={value:1},color={value:new T.Color(0xe8eef2)}
  const materials=new Map<T.MeshStandardMaterial,T.MeshStandardMaterial>()
  const bindings:{mesh:T.Mesh;original:T.Material|T.Material[]}[]=[]
  function coat(original:T.Material){
    if(!(original instanceof T.MeshStandardMaterial) || original.transparent ||
      original.emissive.getHex()!==0 || original.userData.snow===false)return original
    const previous=materials.get(original)
    if(previous)return previous
    const material=original.clone()
    const compile=original.onBeforeCompile,cacheKey=original.customProgramCacheKey()
    material.onBeforeCompile=(shader,renderer)=>{
      compile.call(material,shader,renderer)
      Object.assign(shader.uniforms,{snowAmount:amount,snowEnabled:enabled,snowColor:color})
      shader.vertexShader='varying vec3 snowWorldPosition;\nvarying vec3 snowWorldNormal;\n'+shader.vertexShader
      shader.vertexShader=shader.vertexShader.replace('#include <defaultnormal_vertex>',`#include <defaultnormal_vertex>
        snowWorldNormal = inverseTransformDirection(transformedNormal, viewMatrix);`)
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
        vec4 snowPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          snowPosition = instanceMatrix * snowPosition;
        #endif
        snowWorldPosition = (modelMatrix * snowPosition).xyz;`)
      shader.fragmentShader=`
        uniform float snowAmount;
        uniform float snowEnabled;
        uniform vec3 snowColor;
        varying vec3 snowWorldPosition;
        varying vec3 snowWorldNormal;
        float snowHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float snowNoise(vec2 p){
          vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
          return mix(mix(snowHash(i),snowHash(i+vec2(1.,0.)),f.x),
            mix(snowHash(i+vec2(0.,1.)),snowHash(i+vec2(1.,1.)),f.x),f.y);
        }
      `+shader.fragmentShader
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        // Upward faces collect snow. Vertical walls, trunks, signs and undersides do not.
        float upward = smoothstep(.35, .85, normalize(snowWorldNormal).y);
        float snowPatch = .68*snowNoise(snowWorldPosition.xz*.28)+.24*snowNoise(snowWorldPosition.xz*.92)+.08*snowNoise(snowWorldPosition.xz*5.);
        float coverage = .10+.84*smoothstep(0., .15, .16+snowAmount-snowPatch);
        // A broad, irregular falloff in the distant scenery, never at the touchline.
        float distanceFade = 1.-smoothstep(.75,1.5,length(snowWorldPosition.xz/vec2(60.,45.))+.05*(snowPatch-.5));
        // The pitch decal owns the central ground snow and its tracks. Blend the
        // two layers over the final two metres; elevated scenery still receives snow.
        float pitchEdge = min(21.-abs(snowWorldPosition.x),12.-abs(snowWorldPosition.z));
        float pitchLayer = smoothstep(0.,2.,pitchEdge)*(1.-smoothstep(.04,.12,abs(snowWorldPosition.y)));
        float snowMix = snowEnabled*coverage*upward*distanceFade*(1.-pitchLayer)/max(.01,1.-coverage*pitchLayer);
        diffuseColor.rgb = mix(diffuseColor.rgb,snowColor*(.96+.04*snowNoise(snowWorldPosition.xz*12.)),snowMix);
      `)
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor,1.,snowMix);`)
      shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
        metalnessFactor *= 1.-snowMix;`)
    }
    material.customProgramCacheKey=()=>cacheKey+'|environment-snow-v1'
    materials.set(original,material)
    return material
  }
  scene.traverse(object=>{
    if(!(object instanceof T.Mesh) || object.userData.snow===false)return
    const original=object.material
    const next=Array.isArray(original)?original.map(coat):coat(original)
    if(next!==original){bindings.push({mesh:object,original});object.material=next}
  })
  return {
    setAccumulation(value:number){amount.value=T.MathUtils.clamp(value,0,1)},
    setVisible(visible:boolean){enabled.value=visible?1:0},
    dispose(){for(const {mesh,original} of bindings)mesh.material=original;for(const material of materials.values())material.dispose()},
  }
}
