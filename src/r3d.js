// ═════════ 3D-режим (бета): Three.js рисует мир, логика игры прежняя ═════════
// Камера подобрана так, что плоскость z=0 в 3D совпадает с экраном 2D: всё, что ещё не
// переведено в 3D (подписи, кальмар, трал, взрывы), рисуется поверх прежним 2D-кодом.
const R3=(()=>{
const T=THREE,col=h=>new T.Color(h).convertSRGBToLinear();
const glc=document.createElement('canvas');glc.id='gl';glc.style.cssText='position:fixed;inset:0;width:100%;height:100%;display:block;pointer-events:none';cv.parentNode.insertBefore(glc,cv);
const R=new T.WebGLRenderer({canvas:glc,antialias:!isTouch,powerPreference:'high-performance',alpha:false});
R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
const SHADOW=!isTouch;R.shadowMap.enabled=SHADOW;R.shadowMap.type=T.PCFSoftShadowMap;
const S=new T.Scene(),FOV=40,TANH=Math.tan(FOV/2*Math.PI/180);
const camera=new T.PerspectiveCamera(FOV,1,10,20000);
const fog=new T.FogExp2(0x0e5a86,.0003);S.fog=fog;
const hemi=new T.HemisphereLight(0xc8ecff,0x6b5636,.95);S.add(hemi);
const sun=new T.DirectionalLight(0xfff3d6,1.15);S.add(sun);S.add(sun.target);
if(SHADOW){sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.0005}
const rim=new T.DirectionalLight(0x9fe4ff,.45);rim.position.set(1,.3,-1);S.add(rim);
// ── фон: вертикальный градиент как в 2D, без тумана
const bgc=document.createElement('canvas');bgc.width=8;bgc.height=512;{const x=bgc.getContext('2d'),g=x.createLinearGradient(0,0,0,512);const sky=.12;
  g.addColorStop(0,'#bfe9f7');g.addColorStop(sky-.001,'#d8f6ff');g.addColorStop(sky,'#3fb4cf');g.addColorStop(sky+.22*(1-sky),'#1a7fa6');g.addColorStop(sky+.55*(1-sky),'#0c4670');g.addColorStop(1,'#041a33');x.fillStyle=g;x.fillRect(0,0,8,512)}
const bgTex=new T.CanvasTexture(bgc);bgTex.encoding=T.sRGBEncoding;
const BGZ=-5200,bgH=H/(1-.12);const bg=new T.Mesh(new T.PlaneGeometry(W*6,bgH*3.2),new T.MeshBasicMaterial({map:bgTex,fog:false,depthWrite:false}));
bg.geometry.translate(0,0,0);bg.position.set(W/2,-H/2+bgH*.06,BGZ);bg.renderOrder=-10;S.add(bg);
// поверхность воды снизу
const surf=new T.Mesh(new T.PlaneGeometry(W*3,9000,1,1),new T.MeshBasicMaterial({color:col('#bdeeff'),transparent:true,opacity:.35,side:T.DoubleSide,depthWrite:false,fog:false}));surf.rotation.x=Math.PI/2;surf.position.set(W/2,0,-2500);S.add(surf);
// ── дно: полоса вдоль x, z — глубина сцены; на z=0 точно ground(x)
const ZS=[-4200,-2600,-1600,-1000,-600,-320,-150,-50,0,60,160,320,600],XS=[];for(let x=-800;x<=W+800;x+=60)XS.push(x);
{const pos=[],cl=[],idx=[],nz=ZS.length,sand=col('#cdb084'),dark=col('#9c8560');
  for(let i=0;i<XS.length;i++)for(let j=0;j<nz;j++){const x=XS[i],z=ZS[j],g=ground(clamp(x,0,W));const back=Math.max(0,-z-200);const y=-(g-back*.32+Math.sin(x*.003+z*.002)*30*Math.min(1,back/400)-(z>0?z*.25:0));pos.push(x,y,z);
    const n=.5+.5*Math.sin(x*.05+z*.07)*Math.sin(x*.013-z*.03);const c=sand.clone().lerp(dark,n*.35+Math.min(.4,back/4000));cl.push(c.r,c.g,c.b)}
  for(let i=0;i<XS.length-1;i++)for(let j=0;j<nz-1;j++){const a=i*nz+j,b=a+nz;idx.push(a,a+1,b,b,a+1,b+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cl,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));m.receiveShadow=true;S.add(m)}
// дальние скалы
const farM=new T.MeshStandardMaterial({color:col('#4f6470'),roughness:1,flatShading:true});
function blob(r,det,h,seed){const g=new T.IcosahedronGeometry(r,det),p=g.attributes.position;for(let i=0;i<p.count;i++){const vx=p.getX(i),vy=p.getY(i),vz=p.getZ(i),k=1+(Math.abs(Math.sin(Math.round(vx*7)*12.9898+Math.round(vy*7)*78.233+Math.round(vz*7)*37.719+seed)*43758.5)%1)*.28;p.setXYZ(i,vx*k,vy*k*h,vz*k)}g.computeVertexNormals();return g}
for(let x=-400;x<W+400;x+=rand(500,900)){const z=rand(-3600,-1500),r=rand(300,800),m=new T.Mesh(blob(1,1,rand(.8,1.8),x),farM);m.scale.setScalar(r);const gy=ground(clamp(x,0,W))-Math.max(0,-z-200)*.32;m.position.set(x,-gy+r*.3,z);S.add(m)}
// ── декор на дне: камни, кораллы, анемоны, ракушки
{const rockG=blob(1,1,.7,3),rockM=new T.MeshStandardMaterial({color:col('#6b7a82'),roughness:.95,flatShading:true});const coralG=new T.ConeGeometry(.35,1,6);coralG.translate(0,.5,0);const coralM=new T.MeshStandardMaterial({roughness:.7});const anG=new T.CylinderGeometry(.06,.1,1,5);anG.translate(0,.5,0);const shellG=new T.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2);
  let nr=0,nc=0,na=0;for(const d of decor){if(d.k==='rock')nr+=d.blobs.length;else if(d.k==='coral')nc+=d.segs.length;else if(d.k==='anem')na+=d.n}
  const IR=new T.InstancedMesh(rockG,rockM,nr),IC=new T.InstancedMesh(coralG,coralM,nc),IA=new T.InstancedMesh(anG,new T.MeshStandardMaterial({roughness:.6}),na),ISh=new T.InstancedMesh(shellG,new T.MeshStandardMaterial({color:col('#f1d9c4'),roughness:.4}),decor.filter(d=>d.k==='shell').length);
  const M=new T.Matrix4(),Q=new T.Quaternion(),V=new T.Vector3(),Sc=new T.Vector3(),C=new T.Color();let ir=0,ic=0,ia=0,is=0;
  for(const d of decor){const g=ground(d.x),z=rand(-160,-20);
    if(d.k==='rock')for(const b of d.blobs){V.set(d.x+b[0],-g+b[1]*.25,z+b[2]*4);Q.setFromEuler(new T.Euler(rand(0,3),rand(0,3),0));Sc.set(b[1],b[1]*.8,b[1]);M.compose(V,Q,Sc);IR.setMatrixAt(ir++,M)}
    else if(d.k==='coral'){C.setHSL(d.hue/360,.6,.55).convertSRGBToLinear();for(const sg of d.segs){const [x1,y1,x2,y2,w]=sg,len=Math.hypot(x2-x1,y2-y1);V.set(d.x+x1,-(g+y1),z);Q.setFromEuler(new T.Euler(0,0,Math.atan2(-(y2-y1),x2-x1)-Math.PI/2));Sc.set(w*1.4,len,w*1.4);M.compose(V,Q,Sc);IC.setMatrixAt(ic,M);IC.setColorAt(ic++,C)}}
    else if(d.k==='anem'){C.setHSL(d.hue/360,.65,.6).convertSRGBToLinear();for(let i=0;i<d.n;i++){const a=(i/d.n-.5)*1.4;V.set(d.x+Math.sin(a)*8*d.s,-g,z);Q.setFromEuler(new T.Euler(0,0,-a*.8));Sc.set(10*d.s,26*d.s,10*d.s);M.compose(V,Q,Sc);IA.setMatrixAt(ia,M);IA.setColorAt(ia++,C)}}
    else{V.set(d.x,-g+1,z);Q.identity();Sc.set(9*d.s,6*d.s,9*d.s);M.compose(V,Q,Sc);ISh.setMatrixAt(is++,M)}}
  for(const I of[IR,IC,IA,ISh]){I.castShadow=false;I.receiveShadow=true;S.add(I)}}
// ── водоросли: ленты, точки берём из strandPoint каждый кадр (они качаются и расступаются)
const WMAX=1400,WSEG=8;function ribbon(z){const g=new T.BufferGeometry(),n=WMAX*(WSEG+1)*2;g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(n*3),3).setUsage(T.DynamicDrawUsage));
  g.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(n*3),3).setUsage(T.DynamicDrawUsage));{const nr=new Float32Array(n*3);for(let i=2;i<n*3;i+=3)nr[i]=1;g.setAttribute('normal',new T.Float32BufferAttribute(nr,3))}const idx=[];for(let s=0;s<WMAX;s++)for(let k=0;k<WSEG;k++){const a=s*(WSEG+1)*2+k*2;idx.push(a,a+1,a+2,a+2,a+1,a+3)}g.setIndex(idx);
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.8}));m.frustumCulled=false;m.position.z=z;m.castShadow=SHADOW;S.add(m);return m}
const wBack=ribbon(-40),wFront=ribbon(45);const WC=new T.Color();
function updWeeds(){for(const [mesh,fg] of [[wBack,false],[wFront,true]]){const P=mesh.geometry.attributes.position.array,Cl=mesh.geometry.attributes.color.array;let s=0;
    for(const p of weeds){if(p.x+p.w<vx0||p.x-p.w>vx1)continue;for(const st of p.strands){if(st.fg!==fg||s>=WMAX)continue;if(fg&&(st.wd*13|0)%2)continue;if(LOW&&(st.wd*7|0)%2)continue;WC.setHSL(st.hue/360,.55,st.lt/100).convertSRGBToLinear();
        for(let k=0;k<=WSEG;k++){const fr=k/WSEG,[x,y]=strandPoint(st,fr,now),w=st.wd*(1-fr*.75)*.9,o=(s*(WSEG+1)+k)*6;P[o]=x-w;P[o+1]=-y;P[o+2]=(st.ph-3)*6;P[o+3]=x+w;P[o+4]=-y;P[o+5]=(st.ph-3)*6;
          const l=.75+fr*.35;Cl[o]=WC.r*l;Cl[o+1]=WC.g*l;Cl[o+2]=WC.b*l;Cl[o+3]=WC.r*l;Cl[o+4]=WC.g*l;Cl[o+5]=WC.b*l}s++}}
    mesh.geometry.setDrawRange(0,s*WSEG*6);mesh.geometry.attributes.position.needsUpdate=true;mesh.geometry.attributes.color.needsUpdate=true}}
// ── укрытия на дне: кольцо-арка, сзади тёмный провал
const shelM={rock:new T.MeshStandardMaterial({color:col('#6f7c84'),roughness:.95,flatShading:true}),coral:new T.MeshStandardMaterial({color:col('#d76a6a'),roughness:.75,flatShading:true}),hull:new T.MeshStandardMaterial({color:col('#7a5536'),roughness:.85,flatShading:true})};
const holeM=new T.MeshBasicMaterial({color:col('#04121e')});
for(const sh of shelters){if(sh.float)continue;const g=new T.Group();const ring=new T.Mesh(new T.TorusGeometry(1,.5,8,30),shelM[sh.kind]);ring.scale.set(sh.A+sh.th*.5,sh.B+sh.th*.5,sh.th*.9);ring.geometry.scale(1,1,1);
  const tube=sh.th/(sh.A+sh.th*.5);ring.geometry.dispose();ring.geometry=new T.TorusGeometry(1,Math.min(.45,tube*1.1),8,32);ring.scale.set(sh.A+sh.th*.5,sh.B+sh.th*.5,(sh.A+sh.th*.5)*.55);
  ring.castShadow=SHADOW;ring.receiveShadow=true;g.add(ring);const back=new T.Mesh(new T.CircleGeometry(1,28),holeM);back.scale.set(sh.A,sh.B,1);back.position.z=-sh.th*.6;g.add(back);
  if(sh.kind!=='hull')for(let i=0;i<5;i++){const b=new T.Mesh(blob(1,1,.8,sh.seed+i),shelM[sh.kind]);const a=Math.PI*(.15+i*.18);b.scale.setScalar(sh.th*rand(.6,1.1));b.position.set(Math.cos(a)*(sh.A+sh.th*.6),Math.sin(a)*(sh.B+sh.th*.6),-sh.th*.2);b.castShadow=SHADOW;g.add(b)}
  g.position.set(sh.x,-sh.cy,0);S.add(g)}
// ── скалы-столбы, скалы с раковинами, корабли: фон за плоскостью игры, дыры — тёмные пятна на точных местах
const PZ=-70;const pillarM=new T.MeshStandardMaterial({color:col('#667479'),roughness:.95,flatShading:true});const decals=[];
function extrudePts(pts,depth,mat){const sh=new T.Shape();sh.moveTo(pts[0][0],-pts[0][1]);for(let i=1;i<pts.length;i++)sh.lineTo(pts[i][0],-pts[i][1]);sh.closePath();
  const g=new T.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:30,bevelSize:24,bevelSegments:2,curveSegments:4});g.translate(0,0,PZ-depth);const m=new T.Mesh(g,mat);m.castShadow=SHADOW;m.receiveShadow=true;S.add(m);return m}
function decal(h){const m=new T.Mesh(new T.CircleGeometry(1,28),holeM);m.scale.set(h.A,h.B,1);m.position.set(h.x,-h.cy,PZ+32);S.add(m);decals.push({m,h});return m}
const shellM=new T.MeshStandardMaterial({color:col('#efd2b0'),roughness:.45}),woodM=new T.MeshStandardMaterial({color:col('#6e4a2c'),roughness:.85,flatShading:true});
for(const p of props){if(p.t==='pillar'||p.t==='shellrock'){extrudePts(p.pts,260,pillarM);if(p.t==='pillar')p.holes.forEach(decal);else{
    const lg=new T.Mesh(new T.BoxGeometry(Math.abs(p.ll)*1.05,60,240),pillarM);lg.position.set(p.lx+p.ll*.5,-(p.ly+18),PZ-110);lg.castShadow=SHADOW;S.add(lg);
    for(const h of p.shells){const sg=new T.Group();const lo=new T.Mesh(new T.SphereGeometry(1,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),shellM);lo.scale.set(h.S,h.S*.35,h.S*.8);sg.add(lo);
      const lid=new T.Mesh(new T.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),shellM);lid.scale.set(h.S,h.S*.85,h.S*.8);lid.rotation.z=-h.open*.35*h.sd;sg.add(lid);sg.position.set(h.x,-h.sy,PZ-40);sg.castShadow=SHADOW;S.add(sg);decal(h)}}}
  else if(p.t==='ship'){const L=p.L,Hh=p.Hh,pts=[[0,-Hh*.8],[L*.8,-Hh*.8],[L*.97,-Hh*.4],[L,0],[L*.85,Hh*.55],[L*.7,Hh*.7],[30,Hh*.75],[-6,0]];
    const sh=new T.Shape();const tr=(px,py)=>{const c=Math.cos(p.a),s2=Math.sin(p.a),ux=p.sd*px;return [p.bx+ux*c-py*s2,p.by+ux*s2+py*c]};pts.forEach((q,i)=>{const [x,y]=tr(q[0],q[1]);i?sh.lineTo(x,-y):sh.moveTo(x,-y)});sh.closePath();
    const g=new T.ExtrudeGeometry(sh,{depth:220,bevelEnabled:true,bevelThickness:20,bevelSize:16,bevelSegments:2});g.translate(0,0,PZ-220);const m=new T.Mesh(g,woodM);m.castShadow=SHADOW;m.receiveShadow=true;S.add(m);p.holes.forEach(decal)}}
// ── еда: по одной InstancedMesh на вид
const FT={speck:{g:new T.SphereGeometry(1,6,4),c:'#7fe08e',k:1},clump:{g:new T.IcosahedronGeometry(1,0),c:'#5cbf5a',k:1},fruit:{g:new T.SphereGeometry(1,10,8),c:'#b6e04a',k:1},kelp:{g:new T.IcosahedronGeometry(1,1),c:'#4f9a4a',k:1},
  sarg:{g:new T.CylinderGeometry(1,1,.25,9),c:'#c9a23a',k:1},bug:{g:new T.SphereGeometry(1,8,6),c:'#e8473a',k:1,sx:1.3},minnow:{g:new T.SphereGeometry(1,8,6),c:'#cfe3ee',k:1,sx:2.2,face:1},
  shrimp:{g:T.CapsuleGeometry?new T.CapsuleGeometry(.5,1,4,6):new T.SphereGeometry(1,8,6),c:'#ff8a6a',k:1,sx:1.6,face:1},crab:{g:new T.SphereGeometry(1,10,6),c:'#d8452c',k:1,sx:1.5,sy:.6},squid:{g:new T.ConeGeometry(.6,2.2,8),c:'#e05a3c',k:1,face:1,cone:1}};
const FI={};for(const k in FT){const d=FT[k],m=new T.InstancedMesh(d.g,new T.MeshStandardMaterial({color:col(d.c),roughness:.55,emissive:col(d.c),emissiveIntensity:k==='speck'||k==='bug'?.25:.08}),(FOOD[k]?FOOD[k].n:100)*2+50);m.count=0;m.frustumCulled=false;S.add(m);FI[k]=m}
const foodTypes=new Set(Object.keys(FT));const M4=new T.Matrix4(),Q4=new T.Quaternion(),V3=new T.Vector3(),S3=new T.Vector3(),E3=new T.Euler();
function updFood(){const n={};for(const k in FI)n[k]=0;for(const fd of foods){const m=FI[fd.t];if(!m)continue;const r=fd.s*1.3;if(fd.x<vx0-r||fd.x>vx1+r||fd.y<vy0-r||fd.y>vy1+r)continue;if(n[fd.t]>=m.instanceMatrix.count)continue;const d=FT[fd.t];
    let a=0,rx=0;if(d.face){a=Math.atan2(-(fd.vy||0),fd.vx||1);if((fd.vx||1)<0){rx=Math.PI}}const bob=fd.t==='speck'?Math.sin(now*2+fd.ph)*.15:0;
    E3.set(rx+(d.cone?0:0),0,a+(d.cone?Math.PI/2:0)+bob,'ZYX');Q4.setFromEuler(E3);const s=fd.s*(fd.t==='speck'?.9:.75);S3.set(s*(d.sx||1),s*(d.sy||1),s);V3.set(fd.x,-fd.y,0);M4.compose(V3,Q4,S3);m.setMatrixAt(n[fd.t]++,M4)}
  for(const k in FI){FI[k].count=n[k];FI[k].instanceMatrix.needsUpdate=true}}
// ── рыбы: тело гнётся в вершинном шейдере (видеокарта), плавники — дочерние детали
function bodyGeo(kind,seg,rad){const pos=[],cl=[],tt=[],idx=[];const hR=kind==='h'?.3:kind==='c'?.2:.25,wR=hR*.48;
  for(let i=0;i<=seg;i++){const t=i/seg,x=.5-t,nose=t<.12?Math.sqrt(t/.12):1,k=Math.pow(Math.sin(Math.PI*Math.min(.99,t*.88+.07)),.78)*nose,pe=t>.82?1-(t-.82)/.18*.45:1;
    for(let j=0;j<=rad;j++){const a=j/rad*Math.PI*2,sa=Math.sin(a),ca=Math.cos(a);pos.push(x,sa*hR*k*pe*(sa<0?.9:1),ca*wR*k*pe);tt.push(t);const b=sa>.1?.62+(.25*(1-sa)):sa>-.15?.9:1.25;cl.push(b,b,b)}}
  for(let i=0;i<seg;i++)for(let j=0;j<rad;j++){const a=i*(rad+1)+j,b=a+rad+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cl,3));g.setAttribute('tt',new T.Float32BufferAttribute(tt,1));g.setIndex(idx);g.computeVertexNormals();g.userData.h=hR;return g}
const BODY={};for(const k of['h','o','c'])BODY[k]={hi:bodyGeo(k,36,16),lo:bodyGeo(k,18,10)};
function finShape(pts){const sh=new T.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i+=2){const c=pts[i],e=pts[i+1]||pts[0];sh.quadraticCurveTo(c[0],c[1],e[0],e[1])}return new T.ShapeGeometry(sh,6)}
const TAILG=finShape([[0,0],[-.06,.08],[-.22,.2],[-.16,.07],[-.12,0],[-.16,-.07],[-.22,-.2],[-.06,-.08],[0,0]]),DORG=finShape([[.08,0],[.02,.12],[-.12,.13],[-.12,.05],[-.16,0]]),PECG=finShape([[.02,0],[-.04,-.05],[-.12,-.07],[-.08,-.01],[-.08,0]]);
const eyeG=new T.SphereGeometry(1,12,10),pupM=new T.MeshPhysicalMaterial({color:col('#0a0f14'),roughness:.1,clearcoat:1}),sclM=new T.MeshStandardMaterial({color:col('#f8fbff'),roughness:.3});
function bendMat(mat){mat.onBeforeCompile=sh=>{sh.uniforms.uPh=mat.userData.uPh;sh.uniforms.uAmp=mat.userData.uAmp;sh.vertexShader='attribute float tt;uniform float uPh;uniform float uAmp;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=sin(uPh-tt*4.1)*uAmp*pow(tt,1.7);')};mat.userData.uPh={value:0};mat.userData.uAmp={value:0};return mat}
const pool=new Map();
function makeFish(f){const g=new T.Group();g.rotation.order='ZYX';const kind=ty(f),lod=f===player?'hi':'lo';
  const bm=bendMat(new T.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:.02,transparent:true}));const body=new T.Mesh(BODY[kind][lod],bm);body.castShadow=SHADOW;g.add(body);
  const fm=new T.MeshStandardMaterial({roughness:.5,side:T.DoubleSide,transparent:true,opacity:.92});const hR=BODY[kind][lod].userData.h;
  const tail=new T.Group();tail.position.x=-.5;const tm=new T.Mesh(TAILG,fm);tm.scale.setScalar(kind==='h'?1.05:1);tail.add(tm);g.add(tail);
  const dor=new T.Mesh(DORG,fm);dor.position.set(.02,hR*.86,0);dor.scale.set(1,kind==='c'?1.2:1,1);g.add(dor);
  const pecs=[];for(const s of[-1,1]){const p=new T.Mesh(PECG,fm);p.position.set(.22,-hR*.35,s*hR*.42);p.rotation.x=s*-.6;g.add(p);pecs.push(p)}
  for(const s of[-1,1]){const sc=new T.Mesh(eyeG,sclM);sc.scale.set(.034,.034,.018);sc.position.set(.36,hR*.25,s*hR*.36);g.add(sc);const pu=new T.Mesh(eyeG,pupM);pu.scale.setScalar(.019);pu.position.set(.37,hR*.25,s*(hR*.36+.012));g.add(pu)}
  g.userData={f,bm,fm,tail,pecs,kind,ph:Math.random()*6};S.add(g);return g}
const FC=new T.Color();
function fishHue(f){const SK=f.skin&&f.skin!=='none'?f.skin:null;return SK==='clown'?[22,96]:SK==='tiger'?[205,16]:SK==='neon'?[228,40]:SK==='gold'?[44,92]:SK==='rainbow'?[(now*70+f.id*37)%360,85]:SK==='shark'?[205,20]:SK==='mecha'?[210,12]:SK==='lion'?[10,62]:SK==='betta'?[320+Math.sin(now*.6+f.id)*28,78]:[f.hue,58]}
function updFish(dt){const seen=new Set();
  for(const f of fish){if(!f.alive){continue}const Lb=f.r*2.5;if(f.x+Lb<vx0||f.x-Lb>vx1||f.y+Lb<vy0||f.y-Lb>vy1)continue;seen.add(f);
    let g=pool.get(f);if(!g||g.userData.kind!==ty(f)){if(g){S.remove(g)}g=makeFish(f);pool.set(f,g)}g.visible=true;const u=g.userData;
    const [h,sat]=fishHue(f);FC.setHSL((h%360)/360,sat/100,.5).convertSRGBToLinear();u.bm.color.copy(FC);FC.setHSL(((h+8)%360)/360,sat/100,.42).convertSRGBToLinear();u.fm.color.copy(FC);
    let a=1;if(f.hidden&&f!==player)a=(f.pw.invis>0||(f.evo.cham&&f.still>.8))?.16:.42;if(f===player&&f.hidden)a=.75;if(f.protect>0)a*=.55+.35*Math.sin(now*20);if(player&&player.alive&&f!==player&&tooSmall(player,f))a*=.45;
    u.bm.opacity=a;u.fm.opacity=a*.92;u.bm.depthWrite=a>.9;
    const sw=Math.min(1.3,f.swim||0);u.ph+=dt*(5+sw*7)*(f.stun>0?.3:1);const amp=(.035+.07*sw);u.bm.userData.uPh.value=u.ph;u.bm.userData.uAmp.value=amp;
    const tz=Math.sin(u.ph-4.1)*amp;u.tail.position.z=tz;u.tail.rotation.y=-Math.cos(u.ph-4.1)*amp*4;for(const [i,p] of u.pecs.entries())p.rotation.y=Math.sin(now*3+i)*.3;
    g.position.set(f.x,-f.y,0);g.scale.setScalar(Lb);g.rotation.set(Math.acos(clamp(f.roll,-1,1)),0,-f.ang)}
  for(const [f,g] of pool){if(!seen.has(f)){g.visible=false;if(!f.alive){S.remove(g);pool.delete(f)}}}}
// ── кадр
function resize(){R.setPixelRatio(Math.min(dpr,isTouch?1.25:1.75));R.setSize(cw,ch,false)}
let lw=0,lh=0;
function render(dt){if(cw!==lw||ch!==lh){lw=cw;lh=ch;resize()}
  const z=cam.z,vh=ch/z,D=vh/(2*TANH);camera.aspect=cw/ch;camera.near=Math.max(10,D*.2);camera.far=D+9000;camera.position.set(cam.x,-cam.y,D);camera.lookAt(cam.x,-cam.y,0);camera.updateProjectionMatrix();
  const dk=clamp(cam.y/H,0,1);fog.color.copy(col('#1f86b0')).lerp(col('#062a4a'),dk);fog.density=.42/D;hemi.intensity=1.05-dk*.45;sun.intensity=1.25-dk*.7;
  sun.position.set(cam.x-D*.6,-cam.y+D*1.2,D*.8);sun.target.position.set(cam.x,-cam.y,0);if(SHADOW){const sc=sun.shadow.camera,hw=vh*cw/ch*.6;sc.left=-hw;sc.right=hw;sc.top=vh*.7;sc.bottom=-vh*.7;sc.near=10;sc.far=D*4;sc.updateProjectionMatrix()}
  surf.visible=cam.y-vh<400;
  for(const d of decals){const k=(D-(PZ+32))/D;d.m.position.set(cam.x+(d.h.x-cam.x)*k,-(cam.y+(d.h.cy-cam.y)*k),PZ+32);d.m.scale.set(d.h.A*k,d.h.B*k,1)}
  updWeeds();updFood();updFish(dt||1/60);R.render(S,camera)}
return {render,foodTypes}})();
