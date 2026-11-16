/* AXEBOUND 0.3: self-contained WebGL2 low-poly scene renderer.
   All geometry is actual 3D triangle meshes; battle simulation lives in index.html.
   No CDN, library, external textures, or network connection required. */
(function(){'use strict';
class MeadowRenderer {
 constructor(canvas){this.canvas=canvas;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,depth:true,powerPreference:'high-performance'});if(!this.gl)throw Error('WebGL2 unavailable');const gl=this.gl;
 const vert=`#version 300 es
 precision highp float;
 in vec3 aPosition;in vec3 aColor;in float aShade;
 uniform vec2 uResolution;uniform vec2 uCamera;uniform float uScale;
 out vec3 vColor;out float vShade;out float vFog;out vec2 vWorld;
 void main(){float dx=aPosition.x-uCamera.x;float dz=aPosition.z-uCamera.y;
 float sx=uResolution.x*.5+(dx-dz)*uScale*.89;
 float sy=uResolution.y*.51+(dx+dz)*uScale*.425-aPosition.y*uScale*1.13;
 gl_Position=vec4(sx/uResolution.x*2.-1.,1.-sy/uResolution.y*2.,clamp((dx+dz-aPosition.y*4.0)/85.,-.95,.95),1.);
 vColor=aColor;vShade=aShade;vFog=clamp(length(vec2(dx,dz))/31.,0.,1.);vWorld=aPosition.xz;
 }`;
 const frag=`#version 300 es
 precision highp float;
 in vec3 vColor;in float vShade;in float vFog;in vec2 vWorld;out vec4 fragColor;
 uniform float uTime;uniform float uPixel;
 void main(){vec3 col=vColor*(.66+.34*vShade);
 float grain=fract(sin(dot(floor(vWorld*6.5),vec2(127.1,311.7)))*43758.5453);
 col*=.94+grain*.075;
 // Light retro texture quantization; geometry silhouette remains sharp.
 col=floor(col*18.+.5)/18.;
 col=mix(col,vec3(.48,.56,.48),vFog*vFog*.31);
 float screenDither=fract(sin(dot(floor(gl_FragCoord.xy/max(1.,uPixel)),vec2(12.9898,78.233)))*43758.5453);
 col+= (screenDither-.5)*.018;
 fragColor=vec4(pow(max(col,vec3(0.)),vec3(.93)),1.);
 }`;
 function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 const prog=gl.createProgram();gl.attachShader(prog,compile(gl.VERTEX_SHADER,vert));gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));this.program=prog;
 this.loc={pos:gl.getAttribLocation(prog,'aPosition'),color:gl.getAttribLocation(prog,'aColor'),shade:gl.getAttribLocation(prog,'aShade'),res:gl.getUniformLocation(prog,'uResolution'),cam:gl.getUniformLocation(prog,'uCamera'),scale:gl.getUniformLocation(prog,'uScale'),time:gl.getUniformLocation(prog,'uTime'),pixel:gl.getUniformLocation(prog,'uPixel')};
 this.buf=gl.createBuffer();this.data=[];this.staticData=[];this.staticReady=false;this.seed=871234;this.triangles=0;gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(.43,.53,.44,1);
 canvas.addEventListener('webglcontextlost',e=>e.preventDefault());
 }
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)|0;return (this.seed>>>0)/4294967296}
 rgb(hex){const n=parseInt(hex.replace('#',''),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}
 mat(hex,shade=1){let c=this.rgb(hex);return [c[0],c[1],c[2],shade]}
 tri(a,b,c,color){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,mag=Math.hypot(nx,ny,nz)||1;let lighting=Math.max(.13,(nx*.29+ny*.88+nz*.34)/mag);const shade=.65+lighting*.48;for(const p of [a,b,c])this.data.push(...p,color[0],color[1],color[2],shade*(color[3]||1));this.triangles++}
 quad(a,b,c,d,col){this.tri(a,b,c,col);this.tri(a,c,d,col)}
 box(x,y,z,w,h,d,col,yaw=0){let cx=Math.cos(yaw),sn=Math.sin(yaw);const p=(a,b,c)=>[x+a*cx-c*sn,y+b,z+a*sn+c*cx];let a=p(-w/2,-h/2,-d/2),b=p(w/2,-h/2,-d/2),c=p(w/2,h/2,-d/2),f=p(-w/2,h/2,-d/2),e=p(-w/2,-h/2,d/2),g=p(w/2,-h/2,d/2),h1=p(w/2,h/2,d/2),i=p(-w/2,h/2,d/2);this.quad(a,b,c,f,col);this.quad(g,e,i,h1,col);this.quad(e,a,f,i,col);this.quad(b,g,h1,c,col);this.quad(f,c,h1,i,col);this.quad(e,g,b,a,col)}
 cylinder(x,y,z,rx,h,rz,col,segments=7,angle=0){const ca=Math.cos(angle),sa=Math.sin(angle);let bot=[],top=[];for(let i=0;i<segments;i++){let a=i/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a);bot.push([x+rx*c*ca-rz*s*sa,y,z+rx*c*sa+rz*s*ca]);top.push([x+rx*c*ca-rz*s*sa,y+h,z+rx*c*sa+rz*s*ca])}for(let i=0;i<segments;i++){const j=(i+1)%segments;this.quad(bot[i],bot[j],top[j],top[i],col);this.tri([x,y+h,z],top[i],top[j],col)}}
 segment(a,b,r,col,ns=6){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||1;let ax=Math.abs(dy/L)<.86?[0,1,0]:[1,0,0];let ux=dy*ax[2]-dz*ax[1],uy=dz*ax[0]-dx*ax[2],uz=dx*ax[1]-dy*ax[0],M=Math.hypot(ux,uy,uz)||1;ux/=M;uy/=M;uz/=M;let vx=dy*uz-dz*uy,vy=dz*ux-dx*uz,vz=dx*uy-dy*ux;let ringA=[],ringB=[];for(let i=0;i<ns;i++){let c=Math.cos(i*2*Math.PI/ns)*r,s=Math.sin(i*2*Math.PI/ns)*r;let off=[ux*c+vx*s,uy*c+vy*s,uz*c+vz*s];ringA.push(a.map((v,j)=>v+off[j]));ringB.push(b.map((v,j)=>v+off[j]))}for(let i=0;i<ns;i++)this.quad(ringA[i],ringA[(i+1)%ns],ringB[(i+1)%ns],ringB[i],col)}
 wedge(x,y,z,sz,color,ang=0){const c=Math.cos(ang),s=Math.sin(ang),P=(u,v,w)=>[x+u*c-w*s,y+v,z+u*s+w*c],a=P(-sz,0,-sz),b=P(sz,0,-sz),d=P(sz,0,sz),e=P(-sz,0,sz),t=P(0,sz*.85,0);this.tri(a,b,t,color);this.tri(b,d,t,color);this.tri(d,e,t,color);this.tri(e,a,t,color)}
 ring(x,z,r,col,w=.07,segments=24){for(let i=0;i<segments;i++){let a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;const p=(t,rad)=>[x+Math.cos(t)*rad,.04,z+Math.sin(t)*rad];this.quad(p(a,r-w),p(b,r-w),p(b,r),p(a,r),col)}}
 buildStatic(decor){this.data=[];this.seed=5127;const c0=this.mat('#4b6551'),cols=['#516d55','#59745a','#627a5a','#4e6951','#617657','#536a52','#6b8060'];const N=46,size=1.9;for(let ix=-N;ix<N;ix++)for(let iz=-N;iz<N;iz++){let x=ix*size,z=iz*size,c=this.mat(cols[Math.floor(this.random()*cols.length)]);let p=[x,-.035,z],q=[x+size,-.035,z],r=[x+size,-.035,z+size],s=[x,-.035,z+size];this.quad(p,q,r,s,c)}
 for(const d of decor){let x=d.x,z=d.z,s=d.size;if(d.type==='grass'||d.type==='tuft'){let count=d.type==='tuft'?4:2;for(let i=0;i<count;i++){let a=d.seed+i*2.3,cc=Math.cos(a),ss=Math.sin(a),j=(i-count/2)*.15;let h=(.20+this.random()*.38)*s;let b=[x+cc*j,0,z+ss*j],p=[b[0]+cc*.12*s,.01,b[2]+ss*.12*s],tip=[b[0]+cc*.10*s,h,b[2]+ss*.10*s];this.tri(b,p,tip,this.mat(['#82966a','#a3a878','#6c865f','#b1aa74'][Math.floor(this.random()*4)]))}}
 else if(d.type==='flower'){this.segment([x,0,z],[x,.3*s,z],.018,this.mat('#526e4a'),4);this.box(x,.33*s,z,.085*s,.08*s,.085*s,this.mat('#dbb77e'),d.seed)}
 else if(d.type==='stone'||d.type==='rock'){let w=(d.type==='rock'?1.1:.34)*s;this.box(x,w*.32,z,w,w*.6,w*.8,this.mat(d.shade%2?'#849087':'#748578'),d.seed)}
 else if(d.type==='pillar'){this.cylinder(x,0,z,.37*s,1.3*s,.34*s,this.mat('#8a9182'),6,d.seed);this.box(x,1.36*s,z,.82*s,.21*s,.72*s,this.mat('#a0a392'),d.seed)}
 else if(d.type==='ruin'){this.box(x,.5*s,z,1.7*s,1*s,.45*s,this.mat('#888f80'),d.seed);this.box(x+.8*s,1.2*s,z,.37*s,2.4*s,.5*s,this.mat('#a1a695'),d.seed)}
 }
 this.staticData=new Float32Array(this.data);this.data=[];this.staticReady=true}
 actor(a,isPlayer,t){if(a.dead>1.0)return;const x=a.x,z=a.z,face=a.face||0,scale=isPlayer?1:t.scale*.93,walking=isPlayer?Math.min(1,Math.hypot(a.vx,a.vz)/4.9):a.wind>0?0:.75;
 const run=Math.sin((a.step||0)*1.6),phase=Math.cos((a.step||0)*1.6),atk=isPlayer?a.attacking>0?1-a.attacking/a.attackDuration:0:a.wind>0?1-a.wind/t.wind:0;
 const parry=isPlayer?a.parry>0: false, dodge=isPlayer?a.dodge>0:false, crouch=dodge?.55*Math.sin((1-a.dodge/.39)*Math.PI):0;
 const bob=(walking?Math.abs(run)*.034:Math.sin((a.breath||a.step||0)*2)*.014)-crouch;const yaw=face;const forw=[Math.cos(yaw),Math.sin(yaw)],side=[-Math.sin(yaw),Math.cos(yaw)];
 const pos=(r,h,f)=>[x+side[0]*r*scale+forw[0]*f*scale,(h+bob)*scale,z+side[1]*r*scale+forw[1]*f*scale];
 let armor=isPlayer?'#9aa9a3':a.type==='bastion'?'#747e80':a.type==='riven'?'#8f766a':a.type==='harrower'?'#756b65':'#8a9181',metal=this.mat(armor),edge=this.mat(isPlayer?'#c6c5ad':'#a5a594'),dark=this.mat('#263d3d'),leather=this.mat(isPlayer?'#5a483d':'#55473f'),hide=this.mat(a.type==='riven'?'#a48a7b':'#8d9280'),glow=this.mat('#7ee7e6');
 if(a.dead>0){let shrink=Math.min(.9,a.dead*.65);this.cylinder(x,.03,z,.48*scale*(1-shrink),.03,.37*scale*(1-shrink),this.mat('#252d27'),8);return}
 // Shadow silhouette lives in world, projected beneath the actual mesh.
 this.cylinder(x,.004,z,.55*scale,.012,.38*scale,this.mat('#283b32',.82),10);
 const waist=pos(0,.87,0),chest=pos(0,1.30,0);
 // Legs with independent gait, dodge tuck and stance separation.
 for(const sideSign of [-1,1]){let swing=run*walking*.22*sideSign;let knee=pos(sideSign*.19,.61,.04+swing*.52),hip=pos(sideSign*.2,.92,0),foot=pos(sideSign*.20,.13,.04+swing-(dodge?.18:0));this.segment(hip,knee,.135*scale,leather);this.segment(knee,foot,.14*scale,metal);let boot=pos(sideSign*.20,.10,.19+swing);this.segment(foot,boot,.15*scale,dark)}
 // Coat panels and layered torso.
 this.box(...pos(0,1.04,-.12),.62*scale,.48*scale,.37*scale,leather,yaw);this.box(...pos(0,1.38,.015),.72*scale,.68*scale,.44*scale,metal,yaw);
 this.box(...pos(0,1.45,.27),.25*scale,.39*scale,.05*scale,isPlayer?glow:dark,yaw);
 this.box(...pos(0,1.08,.23),.67*scale,.09*scale,.46*scale,edge,yaw);
 // Helmet with forehead ridge and eye slit.
 this.box(...pos(0,1.86,0),.48*scale,.43*scale,.47*scale,edge,yaw);
 this.box(...pos(0,1.87,.26),.43*scale,.10*scale,.05*scale,dark,yaw);
 this.box(...pos(0,2.08,-.04),.16*scale,.22*scale,.55*scale,isPlayer?metal:edge,yaw);
 if(isPlayer)this.wedge(...pos(0,2.22,-.02),.17*scale,glow,yaw);
 if(a.type==='harrower'||a.type==='riven'){this.segment(pos(-.25,2.05,-.05),pos(-.58,2.42,-.08),.12*scale,hide);this.segment(pos(.25,2.05,-.05),pos(.58,2.42,-.08),.12*scale,hide)}
 // Weapon arm action is a pose, not a recolored flash.
 let swing=atk>0?Math.sin(Math.PI*atk)*1.06:0;let armRaise=parry?.66:0;
 for(const ss of [-1,1]){const shoulder=pos(ss*.45,1.55,0),elbow=pos(ss*.62,1.17+(ss===1?swing*.28:armRaise*.4),.03+(ss===1?swing*.32:0)),hand=pos(ss*.61, .98+(ss===1?swing*.65:armRaise*.85),.24+(ss===1?swing*.55:parry?.45:0));this.segment(shoulder,elbow,.19*scale,edge);this.segment(elbow,hand,.135*scale,metal);this.cylinder(...hand,.105*scale,.12*scale,.10*scale,hide,6);
 if(ss===-1&&(parry||a.type==='bastion')){let shield=pos(-.68,1.48+(parry?.23:0),.38+(parry?.22:0));this.box(...shield,.75*scale,.85*scale,.12*scale,this.mat(parry?'#83cdd5':'#82918e'),yaw);this.box(...pos(-.68,1.48+(parry?.23:0),.47+(parry?.22:0)),.38*scale,.38*scale,.05*scale,edge,yaw)}
 if(ss===1&&isPlayer&&a.axe.state==='held'){this.weapon(hand,scale,face,swing,glow)}
 if(ss===1&&a.type==='harrower')this.weapon(hand,scale*1.1,face,swing,this.mat('#db9877'));
 }
 if(a.hurt>0)this.box(...pos(0,1.38,.35),.39*scale,.18*scale,.06*scale,this.mat('#d8ae87'),yaw);
 if(dodge){const p=pos(0, .09,0);this.ring(p[0],p[2],.8,this.mat('#aabf9a'),.055)}
 if(parry){const p=pos(0,.07,0);this.ring(p[0],p[2],1.1,this.mat('#9ce8f0'),.075)}
 if(a.wind>0){let dangerous=a.type==='riven'||a.type==='harrower';let radius=t.range+.45;this.ring(x,z,radius,this.mat(dangerous?'#df7868':'#e5d6a0'),.095);this.ring(x,z,.55,this.mat(dangerous?'#c86b5d':'#d8b978'),.04)}
 if(a.type==='bastion'&&a.guard>0)this.ring(x,z,.74,this.mat('#a1d4dd'),.055);
 }
 weapon(hand,scale,face,attack,glow){const dir=[Math.cos(face),Math.sin(face)];let bottom=[hand[0],hand[1]-.18*scale,hand[2]],top=[hand[0]+dir[0]*(.15+attack*.18)*scale,hand[1]+(.86-attack*.35)*scale,hand[2]+dir[1]*(.15+attack*.18)*scale];this.segment(bottom,top,.058*scale,this.mat('#634b3b'));
 const blade=[top[0],top[1]+.035*scale,top[2]];this.box(...blade,.48*scale,.32*scale,.16*scale,this.mat('#b6c8c5'),face);this.box(blade[0],blade[1],blade[2],.31*scale,.055*scale,.18*scale,glow,face)}
 render(scene){const {w,h,dpr,scale,camera,decor,player,entities,types,clock}=scene;const gl=this.gl;let ww=Math.floor(w*dpr),hh=Math.floor(h*dpr);if(this.canvas.width!==ww||this.canvas.height!==hh){this.canvas.width=ww;this.canvas.height=hh;this.canvas.style.width=w+'px';this.canvas.style.height=h+'px'}gl.viewport(0,0,ww,hh);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);if(!this.staticReady)this.buildStatic(decor);this.data=[];
 // World scenery only. All actors use the guaranteed-visible Canvas2D foreground.
const a=player.axe;
 const dynamic=new Float32Array(this.data);gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);gl.bufferData(gl.ARRAY_BUFFER,this.staticData,gl.DYNAMIC_DRAW);
 const stride=7*4;gl.enableVertexAttribArray(this.loc.pos);gl.vertexAttribPointer(this.loc.pos,3,gl.FLOAT,false,stride,0);gl.enableVertexAttribArray(this.loc.color);gl.vertexAttribPointer(this.loc.color,3,gl.FLOAT,false,stride,12);gl.enableVertexAttribArray(this.loc.shade);gl.vertexAttribPointer(this.loc.shade,1,gl.FLOAT,false,stride,24);gl.uniform2f(this.loc.res,w,h);gl.uniform2f(this.loc.cam,camera.x,camera.z);gl.uniform1f(this.loc.scale,scale);gl.uniform1f(this.loc.time,clock);gl.uniform1f(this.loc.pixel,1.3*dpr);gl.drawArrays(gl.TRIANGLES,0,this.staticData.length/7);
 // Characters must be composited over the ground plane. The old shared depth
 // buffer let terrain fragments hide actors entirely on mobile Safari.
 gl.clear(gl.DEPTH_BUFFER_BIT);
 gl.bufferData(gl.ARRAY_BUFFER,dynamic,gl.DYNAMIC_DRAW);
 gl.drawArrays(gl.TRIANGLES,0,dynamic.length/7);
 }
}
window.MeadowRenderer=MeadowRenderer;
})();
