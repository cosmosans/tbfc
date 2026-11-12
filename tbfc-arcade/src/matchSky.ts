import * as T from 'three'
import type {MatchSettings} from './matchSettings'

export function matchSky(scene:T.Scene,settings:MatchSettings,sun:T.DirectionalLight){
 const night=settings.time==='Night',evening=settings.time==='Evening'
 const cover={Sun:.22,Clouds:.74,Rain:.94,Snow:.87}[settings.weather]
 const horizon=new T.Color(night?0x344362:evening?0xffbf89:0xcfdfdf)
 const zenith=new T.Color(night?0x081326:evening?0x586eaa:0x3984ba)
 const grey=new T.Color(night?0x273345:evening?0xae98a0:0x98a7ad)
 horizon.lerp(grey,cover*.6);zenith.lerp(grey,cover*.65)
 scene.background=horizon
 scene.fog=new T.FogExp2(horizon,settings.weather==='Snow'?.019:settings.weather==='Rain'?.013:.006)
 const sky=new T.Mesh(new T.SphereGeometry(1,40,20),new T.ShaderMaterial({
  side:T.BackSide,depthWrite:false,uniforms:{horizon:{value:horizon},zenith:{value:zenith},cover:{value:cover},night:{value:Number(night)},
   lightDir:{value:sun.position.clone().normalize()},cloudLit:{value:new T.Color(night?0x545e79:evening?0xffccb1:0xffffff)}},
  vertexShader:`varying vec3 ray;
   void main(){ray=position;vec4 clip=projectionMatrix*vec4(mat3(viewMatrix)*position,1.);gl_Position=clip.xyww;}`,
  fragmentShader:`varying vec3 ray;uniform vec3 horizon,zenith,lightDir,cloudLit;uniform float cover,night;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
   float cloud(vec2 p){return .53*noise(p)+.27*noise(p*2.04)+.13*noise(p*4.1)+.07*noise(p*8.2);}
   void main(){vec3 r=normalize(ray);float h=max(r.y,0.);
    vec3 c=mix(horizon,zenith,smoothstep(0.,.75,h));
    vec2 star=r.xz/(1.+h)*420.;float st=hash(floor(star));
    c+=vec3(.76,.83,1.)*night*step(.991,st)*(1.-smoothstep(.03,.3,length(fract(star)-.5)))*smoothstep(.02,.2,h);
    float d=length(r-lightDir);
    c+=mix(vec3(1.,.73,.4),vec3(.75,.83,1.),night)*(exp(-d*12.)*.38+1.-smoothstep(.026,.031,d));
    vec2 p=r.xz/max(.09,h+.09)*1.45+vec2(7.,13.);
    float n=cloud(p);float mask=smoothstep(.74-cover*.44,.87-cover*.44,n)*smoothstep(-.02,.08,r.y);
    c=mix(c,mix(horizon*.73,cloudLit,smoothstep(.32,.79,n)),mask);
    gl_FragColor=vec4(c,1.);
    #include <colorspace_fragment>
   }`
 }))
 sky.frustumCulled=false;sky.renderOrder=-100;scene.add(sky)
 const rain=settings.weather==='Rain'
 if(!rain&&settings.weather!=='Snow')return (_dt:number)=>{}
 const count=rain?760:490,stride=rain?6:3
 const points=new Float32Array(count*stride)
 let seed=2311
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
 for(let i=0;i<points.length;i+=stride){points[i]=(random()-.5)*56;points[i+1]=random()*16;points[i+2]=(random()-.5)*36}
 const geom=new T.BufferGeometry(),attr=new T.BufferAttribute(points,3).setUsage(T.DynamicDrawUsage)
 geom.setAttribute('position',attr)
 const particles=rain?new T.LineSegments(geom,new T.LineBasicMaterial({color:0xc5d8df,transparent:true,opacity:.36,depthWrite:false})):
  new T.Points(geom,new T.PointsMaterial({color:0xf4f8ff,size:.075,transparent:true,opacity:.85,depthWrite:false}))
 particles.frustumCulled=false;scene.add(particles)
 let time=0
 function update(dt:number){
  time+=dt
  for(let i=0;i<points.length;i+=stride){
   points[i]+=dt*(rain?1.8:.35+.32*Math.sin(time+i));if(points[i]>28)points[i]-=56
   points[i+1]-=dt*(rain?11:1.3)
   if(points[i+1]<.03){points[i+1]+=16;points[i]=(random()-.5)*56;points[i+2]=(random()-.5)*36}
   if(rain){points[i+3]=points[i]-.06;points[i+4]=points[i+1]+.36;points[i+5]=points[i+2]}
  }
  attr.needsUpdate=true
 }
 update(0);return update
}
