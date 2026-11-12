import * as T from 'three'

export function goalCannons(scene:T.Scene,line:number){
 const effects=new T.Group()
 scene.add(effects)
 const age={value:0}
 const housing=new T.MeshStandardMaterial({color:0x303338,roughness:.8})
 const nozzle=new T.CylinderGeometry(.2,.28,.47,8)
 const plane=new T.PlaneGeometry(1,1)
 for(const side of [-1,1]){
  const x=line+Math.sign(line)*.85,z=side*2.9
  const base=new T.Mesh(nozzle,housing)
  base.position.set(x,.235,z);scene.add(base)
  const material=new T.ShaderMaterial({
   uniforms:{age,seed:{value:side===1?3.2:16.4}},transparent:true,depthWrite:false,
   vertexShader:`varying vec2 v;void main(){v=uv;vec4 p=modelViewMatrix*vec4(0.,0.,0.,1.);p.xy+=vec2(position.x*3.6,uv.y*6.);gl_Position=projectionMatrix*p;}`,
   fragmentShader:`varying vec2 v;uniform float age,seed;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
    void main(){
     float y=v.y,x=(v.x-.5)*1.9;
     float n=noise(vec2(x*9.+seed,y*12.-age*7.))*.7+noise(vec2(x*20.,y*30.-age*12.))*.3;
     float height=clamp(age*5.,0.,1.)*(1.-smoothstep(2.55,3.,age))*(.65+.22*n);
     float width=(.075+.15*y)*(1.-smoothstep(.05,max(.051,height),y));
     float fire=(1.-smoothstep(width*.3,width+.02,abs(x+(n-.5)*.19*y)))*(1.-smoothstep(height*.75,height+.001,y))*step(.002,height);
     float sy=y-age*.068;
     float cloud=noise(vec2(x*5.+seed,y*7.-age*.85))*.65+noise(vec2(x*12.,y*19.-age*1.65))*.35;
     float smoke=smoothstep(-.06,.22,sy)*(1.-smoothstep(.48,.82,sy))*
       (1.-smoothstep(.03,.08+y*.38,abs(x-y*.26-(cloud-.5)*.34)))*
       smoothstep(.32,.72,cloud)*smoothstep(.15,1.2,age)*(1.-smoothstep(4.,7.,age))*(1.-smoothstep(.87,1.,y))*.60;
     vec3 flame=mix(vec3(1.,.17,.015),vec3(1.,.93,.56),smoothstep(.2,.9,fire)*(1.-y*.8));
     float alpha=fire+smoke*(1.-fire);if(alpha<.008)discard;
     gl_FragColor=vec4(mix(vec3(.53,.51,.5),flame,fire/max(alpha,.001)),alpha);
    }`
  })
  const plume=new T.Mesh(plane,material);plume.position.set(x,.47,z);plume.frustumCulled=false;effects.add(plume)
 }
 effects.visible=false
 return (seconds:number)=>{effects.visible=seconds>=0&&seconds<7;age.value=seconds}
}
