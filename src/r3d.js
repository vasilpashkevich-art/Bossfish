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
// ── сборка модели из простых деталей с цветом на вершинах
const _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_v=new T.Vector3(),_s=new T.Vector3();
function mx(x,y,z,rx,ry,rz,sx,sy,sz){_e.set(rx||0,ry||0,rz||0,'ZYX');_q.setFromEuler(_e);_v.set(x||0,y||0,z||0);_s.set(sx??1,sy??sx??1,sz??sx??1);return new T.Matrix4().compose(_v,_q,_s)}
function merge(parts){const pos=[],nor=[],cl=[];for(const [g0,c,m] of parts){const g=(g0.index?g0.toNonIndexed():g0.clone());if(!g.attributes.normal)g.computeVertexNormals();g.applyMatrix4(m);const p=g.attributes.position.array,n=g.attributes.normal.array,C=col(c);
    for(let i=0;i<p.length;i+=3){pos.push(p[i],p[i+1],p[i+2]);nor.push(n[i],n[i+1],n[i+2]);cl.push(C.r,C.g,C.b)}}
  const G=new T.BufferGeometry();G.setAttribute('position',new T.Float32BufferAttribute(pos,3));G.setAttribute('normal',new T.Float32BufferAttribute(nor,3));G.setAttribute('color',new T.Float32BufferAttribute(cl,3));return G}
const SPH=new T.SphereGeometry(1,10,8),SPHl=new T.SphereGeometry(1,6,5),CYL=new T.CylinderGeometry(1,1,1,6),CONE=new T.ConeGeometry(1,1,7),BOX=new T.BoxGeometry(1,1,1);
const LEAF=(()=>{const sh=new T.Shape();sh.moveTo(0,0);sh.quadraticCurveTo(.35,.45,0,1);sh.quadraticCurveTo(-.35,.45,0,0);return new T.ShapeGeometry(sh,5)})();
const BUMPY=(()=>{const g=new T.IcosahedronGeometry(1,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.12*Math.sin(x*9+y*7)*Math.sin(z*8-x*5);p.setXYZ(i,x*k,y*k,z*k)}g.computeVertexNormals();return g})();
// ── еда: у каждого вида своя модель (размер 1 = радиус еды), InstancedMesh на вид
const FOODM={
 speck:merge([[LEAF,'#8fe89a',mx(0,-.5,0,0,0,0,1.9,1.3,1)],[LEAF,'#5cbf5a',mx(0,-.5,0,0,Math.PI/2,.6,1.7,1.1,1)],[LEAF,'#6fd06a',mx(0,-.5,0,0,Math.PI/4,-.7,1.6,1,1)]]),
 clump:merge([0,1,2,3,4,5].map(i=>[LEAF,i%2?'#4fae52':'#6fd06a',mx(0,-.6,0,0,i*1.05,(i-2.5)*.28,1.1,1.9,1)]).concat([[SPHl,'#3f8f45',mx(0,-.55,0,0,0,0,.35)]])),
 fruit:merge([[CYL,'#4f8f3a',mx(0,.75,0,0,0,0,.08,.6,.08)],[LEAF,'#6fbf4a',mx(.05,.95,0,0,0,-1,.7,.9,1)],[SPH,'#d9e45a',mx(-.28,-.05,0,0,0,0,.52)],[SPH,'#c8d94a',mx(.3,0,.1,0,0,0,.5)],[SPH,'#e8ec6a',mx(0,.32,-.1,0,0,0,.45)]]),
 kelp:merge([[BUMPY,'#3f8a3a',mx(0,0,0,0,0,0,1)],...[0,1,2,3,4,5,6,7].map(i=>[SPHl,'#79c96a',mx(Math.cos(i*2.4)*.9,Math.sin(i*1.7)*.85,Math.sin(i*2.4)*.45,0,0,0,.12)])]),
 sarg:merge([[SPH,'#a88a3a',mx(0,0,0,0,0,0,1,.16,.75)],...[0,1,2,3,4,5,6].map(i=>[SPH,'#d7b54a',mx(Math.cos(i*.9)*.6,.16,Math.sin(i*1.9)*.4,0,0,0,.14)]),...[0,1,2,3,4].map(i=>[LEAF,'#8a7a2a',mx(-.8+i*.4,-.05,.2,Math.PI/2.3,0,i,.35,.6,1)])]),
 bug:merge([[SPH,'#d8382c',mx(-.1,0,0,0,0,0,.75,.55,.6)],[SPH,'#1d1414',mx(.6,.02,0,0,0,0,.32,.3,.32)],[BOX,'#6a1612',mx(-.1,.5,0,0,0,0,1.3,.04,.04)],
   ...[-1,1].flatMap(s=>[-.4,-.05,.3].map(x=>[CYL,'#1d1414',mx(x,-.3,s*.55,s*-.9,0,0,.04,.55,.04)])),[CYL,'#1d1414',mx(.95,.25,.12,0,0,-.7,.03,.45,.03)],[CYL,'#1d1414',mx(.95,.25,-.12,0,0,-.7,.03,.45,.03)]]),
 minnow:merge([[SPH,'#cfe3ee',mx(0,0,0,0,0,0,1,.36,.22)],[SPH,'#7c99ad',mx(0,.13,0,0,0,0,.9,.18,.2)],[CONE,'#a9c3d2',mx(-1.15,0,0,0,0,Math.PI/2,.32,.5,.06)],[SPHl,'#0b1016',mx(.62,.07,.15,0,0,0,.09)],[SPHl,'#0b1016',mx(.62,.07,-.15,0,0,0,.09)]]),
 shrimp:merge([...[0,1,2,3,4,5].map(i=>{const a=-.4+i*.42,r=.95;return [SPH,i%2?'#ff9a76':'#ff7f5c',mx(Math.cos(a+Math.PI)*-r*.6+.2,Math.sin(a)*-.45,0,0,0,a,.34-i*.03,.3-i*.025,.26-i*.02)]}),[CONE,'#ff9f82',mx(-.75,-.55,0,0,0,-2.6,.28,.35,.08)],
   [CYL,'#ffb39a',mx(.9,.25,.08,0,0,-.9,.02,1.2,.02)],[CYL,'#ffb39a',mx(.9,.25,-.08,0,0,-1.1,.02,1.2,.02)],...[0,1,2,3].map(i=>[CYL,'#e86a4a',mx(.4-i*.22,-.32,0,0,0,.25,.025,.35,.025)]),[SPHl,'#0b1016',mx(.72,.15,.13,0,0,0,.07)],[SPHl,'#0b1016',mx(.72,.15,-.13,0,0,0,.07)]]),
 crab:merge([[SPH,'#d8452c',mx(0,0,0,0,0,0,1,.45,.75)],[SPH,'#f07a52',mx(0,.15,0,0,0,0,.7,.25,.55)],...[-1,1].flatMap(s=>[[CYL,'#c23a24',mx(s*.95,.05,.55,0,0,s*.9,.09,.55,.09)],[SPH,'#e0532f',mx(s*1.35,.35,.6,0,0,0,.32,.24,.22)],[CONE,'#e0532f',mx(s*1.62,.48,.6,0,0,-s*1.2,.12,.35,.12)],
   ...[0,1,2].map(i=>[CYL,'#b0331f',mx(s*(.55+i*.12),-.25,-.2+i*.25,0,0,s*1.1,.05,.75,.05)])]),[CYL,'#b0331f',mx(.25,.45,.35,0,0,0,.04,.35,.04)],[CYL,'#b0331f',mx(-.25,.45,.35,0,0,0,.04,.35,.04)],[SPHl,'#111',mx(.25,.65,.35,0,0,0,.09)],[SPHl,'#111',mx(-.25,.65,.35,0,0,0,.09)]]),
 squid:merge([[CONE,'#e86a48',mx(.5,0,0,0,0,-Math.PI/2,.34,1.3,.3)],[SPH,'#e06040',mx(-.15,0,0,0,0,0,.4,.36,.32)],[LEAF,'#f08060',mx(1.1,0,.02,0,0,Math.PI/2+.5,.5,.5,1)],[LEAF,'#f08060',mx(1.1,0,.02,0,0,Math.PI/2-.5+Math.PI,.5,.5,1)],
   ...[0,1,2,3,4,5].map(i=>[CYL,'#c84a30',mx(-.75,(i-2.5)*.08,(i%2?.06:-.06),0,0,Math.PI/2+(i-2.5)*.08,.035,.9,.035)]),[SPHl,'#fff6e0',mx(-.05,.12,.22,0,0,0,.12)],[SPHl,'#111',mx(-.02,.12,.27,0,0,0,.06)]])};
const FT={speck:{k:1},clump:{k:1},fruit:{k:1},kelp:{k:1},sarg:{k:1},bug:{k:1,face:1,wig:1},minnow:{k:1,face:1},shrimp:{k:1,face:1},crab:{k:1,walk:1},squid:{k:1,face:1}};
const FI={};const foodMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.5,side:T.DoubleSide});
for(const k in FT){const m=new T.InstancedMesh(FOODM[k],foodMat,(FOOD[k]?FOOD[k].n:100)*2+50);m.count=0;m.frustumCulled=false;m.castShadow=false;S.add(m);FI[k]=m}
const foodTypes=new Set(Object.keys(FT));const M4=new T.Matrix4(),Q4=new T.Quaternion(),V3=new T.Vector3(),S3=new T.Vector3(),E3=new T.Euler();
function updFood(){const n={};for(const k in FI)n[k]=0;for(const fd of foods){const m=FI[fd.t];if(!m)continue;const r=fd.s*1.6;if(fd.x<vx0-r||fd.x>vx1+r||fd.y<vy0-r||fd.y>vy1+r)continue;if(n[fd.t]>=m.instanceMatrix.count)continue;const d=FT[fd.t];
    let a=0,rx=0,ry=0;if(d.face){const vx=fd.vx||.01,vy=fd.vy||0;a=Math.atan2(-vy,Math.abs(vx));if(vx<0)ry=Math.PI}
    if(fd.t==='speck'||fd.t==='clump'){a=Math.sin(now*1.3+fd.ph)*.25;ry=fd.ph}else if(fd.t==='kelp'||fd.t==='fruit'){ry=now*.3+fd.ph;a=Math.sin(now+fd.ph)*.1}else if(fd.t==='sarg'){a=Math.sin(now*.6+fd.ph)*.05;ry=fd.ph}else if(d.walk){ry=fd.vx<0?Math.PI:0;a=Math.sin(now*8+fd.ph)*.05}
    if(d.wig)a+=Math.sin(now*14+fd.ph)*.12;E3.set(rx,ry,a,'ZYX');Q4.setFromEuler(E3);const s=fd.s*(fd.t==='speck'?1.3:fd.t==='minnow'?.9:fd.t==='shrimp'?1.15:.85);S3.set(s,s,s);V3.set(fd.x,-fd.y,fd.t==='crab'?20:0);M4.compose(V3,Q4,S3);m.setMatrixAt(n[fd.t]++,M4)}
  for(const k in FI){FI[k].count=n[k];FI[k].instanceMatrix.needsUpdate=true}}
// ── рыбы: тело с узором и светлым брюхом, гнётся в шейдере; глаза, челюсть, зубы, плавники — детали
const PATS=['none','bands','spots','clown','tiger'];
function bodyGeo(kind,pat,seg,rad,fat){const pos=[],cl=[],bw=[],tt=[],idx=[];const hR=kind==='h'?.3:kind==='c'?.21:.25,wR=hR*.5,headK=kind==='c'?.9:1.05;
  for(let i=0;i<=seg;i++){const t=i/seg,x=.5-t,nose=t<.14?Math.pow(t/.14,kind==='c'?.6:.45):1,k=Math.pow(Math.sin(Math.PI*Math.min(.99,t*.88+.07)),.78)*nose*(t<.3?lerp(headK,1,t/.3):1),pe=t>.82?1-(t-.82)/.18*.5:1;
    for(let j=0;j<=rad;j++){const a=j/rad*Math.PI*2,sa=Math.sin(a),ca=Math.cos(a);const fb=fat?1+.5*Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,(t-.12)/.68))),1.5):1;const y=sa*hR*k*pe*(sa<0?.92*fb:1)+(t<.2?(.2-t)*.12:0);pos.push(x,y,ca*wR*k*pe);tt.push(t);
      let b=sa>.25?.72:sa>-.2?.95:1,w=sa<-.25?.85:sa<-.05?.4:0;
      if(pat==='bands'&&sa>-.4&&[.3,.48,.66].some(c=>Math.abs(t-c)<.035))b*=.62;
      if(pat==='spots'&&sa>0&&Math.sin(t*46)*Math.sin(a*7)>.72){w=Math.max(w,.55)}
      if(pat==='clown'&&[.2,.47,.74].some(c=>Math.abs(t-c)<.045)){w=1;b=1}if(pat==='clown'&&[.2,.47,.74].some(c=>Math.abs(Math.abs(t-c)-.05)<.008))b=.25;
      if(pat==='tiger'&&sa>-.5&&Math.abs(((t*13+sa*.6)%1))<.18)b*=.45;
      cl.push(b,b,b);bw.push(w)}}
  for(let i=0;i<seg;i++)for(let j=0;j<rad;j++){const a=i*(rad+1)+j,b=a+rad+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cl,3));g.setAttribute('bw',new T.Float32BufferAttribute(bw,1));g.setAttribute('tt',new T.Float32BufferAttribute(tt,1));g.setIndex(idx);g.computeVertexNormals();g.userData.h=hR;return g}
const BODY={};const bodyFor=(kind,pat,lod,fat)=>{const k=kind+pat+lod+(fat?'f':'');return BODY[k]||(BODY[k]=lod==='hi'?bodyGeo(kind,pat,40,18,fat):bodyGeo(kind,pat,22,12,fat))};
function finShape(pts){const sh=new T.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i+=2){const c=pts[i],e=pts[i+1]||pts[0];sh.quadraticCurveTo(c[0],c[1],e[0],e[1])}return new T.ShapeGeometry(sh,6)}
const TAILG={h:finShape([[0,0],[-.08,.1],[-.24,.2],[-.2,.07],[-.17,0],[-.2,-.07],[-.24,-.2],[-.08,-.1],[0,0]]),o:finShape([[0,0],[-.06,.08],[-.24,.2],[-.16,.07],[-.12,0],[-.16,-.07],[-.24,-.2],[-.06,-.08],[0,0]]),c:finShape([[0,0],[-.05,.07],[-.26,.22],[-.15,.06],[-.1,0],[-.15,-.06],[-.26,-.22],[-.05,-.07],[0,0]])};
const DORG={h:finShape([[.12,0],[.06,.11],[-.1,.12],[-.16,.06],[-.2,0]]),o:finShape([[.08,0],[.02,.12],[-.12,.13],[-.12,.05],[-.16,0]]),c:finShape([[.06,0],[0,.16],[-.14,.2],[-.1,.06],[-.14,0]])};
const PECG=finShape([[.02,0],[-.04,-.05],[-.13,-.08],[-.08,-.01],[-.08,0]]),ANALG=finShape([[.04,0],[-.02,-.06],[-.12,-.07],[-.1,0]]);
const eyeG=new T.SphereGeometry(1,14,10),pupM=new T.MeshPhysicalMaterial({color:col('#0a0f14'),roughness:.08,clearcoat:1}),sclM=new T.MeshStandardMaterial({color:col('#f8fbff'),roughness:.3}),hlM=new T.MeshBasicMaterial({color:0xffffff}),
  mouthM=new T.MeshStandardMaterial({color:col('#2a0c0c'),roughness:.8,side:T.DoubleSide}),toothM=new T.MeshStandardMaterial({color:col('#fffaf0'),roughness:.35}),browM=new T.MeshStandardMaterial({color:col('#1a2026'),roughness:.8});
const JAWG=(()=>{const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(-.14,.004);sh.quadraticCurveTo(-.13,-.035,-.04,-.04);sh.quadraticCurveTo(.01,-.03,0,0);return new T.ExtrudeGeometry(sh,{depth:.07,bevelEnabled:false})})();JAWG.translate(0,0,-.035);
const TOOTHG=new T.ConeGeometry(.008,.024,4);
function bendMat(mat){mat.onBeforeCompile=sh=>{sh.uniforms.uPh=mat.userData.uPh;sh.uniforms.uAmp=mat.userData.uAmp;
    sh.vertexShader='attribute float tt;attribute float bw;varying float vBw;uniform float uPh;uniform float uAmp;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBw=bw;float wv=pow(tt,1.7)*uAmp;transformed.z+=sin(uPh-tt*4.1)*wv;transformed.y+=cos(uPh-tt*4.1)*wv*.18;');
    sh.fragmentShader='varying float vBw;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.92,.94,.95),vBw);')};mat.userData.uPh={value:0};mat.userData.uAmp={value:0};return mat}
// ── эволюции на теле: детали собираются в одну модель, гнутся вместе с телом (tt считаем из x)
function bodyProf(kind,t){const hR=kind==='h'?.3:kind==='c'?.21:.25,wR=hR*.5,headK=kind==='c'?.9:1.05,nose=t<.14?Math.pow(t/.14,kind==='c'?.6:.45):1,k=Math.pow(Math.sin(Math.PI*Math.min(.99,t*.88+.07)),.78)*nose*(t<.3?lerp(headK,1,t/.3):1),pe=t>.82?1-(t-.82)/.18*.5:1;return {h:hR*k*pe,w:wR*k*pe,y0:t<.2?(.2-t)*.12:0}}
const CYL16=new T.CylinderGeometry(1,1,1,14),DOME=new T.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),HEX=new T.CylinderGeometry(1,1,1,6);
function evoGeo(kind,keys,spk){const parts=[],E=new Set(keys);
  if(E.has('armor')){const band=(t0,t1,sp,c)=>{const a=bodyProf(kind,t0),b=bodyProf(kind,t1),g=new T.CylinderGeometry(a.h*1.1,b.h*1.12,1,18,1,true,Math.PI*1.5-sp,sp*2);parts.push([g,c,mx(.5-(t0+t1)/2,(a.y0+b.y0)/2,0,0,0,-Math.PI/2,1,t1-t0,.5*1.12)])};
    for(let i=5;i>=0;i--){const t0=.17+i*.095;band(t0,t0+.13,1.25,i%2?'#a9b4bd':'#c8d1d7');const p=bodyProf(kind,t0+.11);parts.push([SPHl,'#56626d',mx(.5-t0-.11,p.y0+p.h*1.1,0,0,0,0,.011)])}
    band(.03,.18,.95,'#dbe2e7');const p=bodyProf(kind,.1);parts.push([CONE,'#dbe2e7',mx(.42,p.y0+p.h*1.05,0,0,0,-.6,.025,.05,.02)])}
  if(E.has('shell')){const p=bodyProf(kind,.5),x=-.02;const sy=p.y0+p.h*.1,H=p.h*1.3,Lx=.3,W=p.w*1.35;parts.push([DOME,'#7a6436',mx(x,sy,0,0,0,0,Lx,H,W)]);parts.push([CYL,'#5a4826',mx(x,sy,0,0,0,0,Lx*1.03,.025,W*1.04)]);
    for(const [u,v] of [[0,0],[-.5,0],[.5,0],[-.25,.5],[.25,.5],[-.25,-.5],[.25,-.5],[-.75,.45],[.75,.45],[-.75,-.45],[.75,-.45],[0,.85],[0,-.85]]){const dx=u*Lx,dz=v*W,e=Math.max(0,1-u*u-v*v);if(e<.05)continue;const h=Math.sqrt(e),nx=u/Lx,nz=v/W,ny=h/H,nl=Math.hypot(nx,ny,nz);parts.push([HEX,'#c9a965',mx(x+dx,sy+H*h,dz,Math.atan2(nz,ny),0,-Math.atan2(nx,ny),.062,.016,.062*W/Lx*.9)])}}
  if(spk){const n=spk===2?8:5,len=spk===2?.16:.1;for(let i=0;i<n;i++){const t=.16+i*(.55/(n-1)),p=bodyProf(kind,t),k=1-Math.abs(i-(n-1)/2)/n*.5;let by=p.y0+p.h*.92;if(E.has('shell')){const sp=bodyProf(kind,.5),u=(.5-t+.02)/.3;if(Math.abs(u)<1)by=Math.max(by,sp.y0+sp.h*.1+sp.h*1.3*Math.sqrt(1-u*u)-.01)}parts.push([CONE,'#ece3c4',mx(.5-t,by+len*k*.45,0,0,0,.5,.022,len*k,.022)])}
    if(spk===2)for(let i=0;i<4;i++){const t=.3+i*.12,p=bodyProf(kind,t);parts.push([CONE,'#ece3c4',mx(.5-t,p.y0-p.h*.88-.05,0,0,0,Math.PI-.5,.018,.1,.018)])}}
  const hR=kind==='h'?.3:kind==='c'?.21:.25,wR=hR*.5;
  if(E.has('remora')){const p=bodyProf(kind,.19),y=p.y0+p.h*.97;parts.push([SPH,'#76858f',mx(.29,y,0,0,0,-.15,.15,.034,p.w*.85)]);for(let i=-4;i<=4;i++)parts.push([BOX,'#36424a',mx(.29+i*.028,y+.022-Math.abs(i)*.003,0,0,0,-.15,.009,.016,p.w*1.35*Math.sqrt(1-(i/5)**2))])}
  if(E.has('filter')){parts.push([SPH,'#2a1a10',mx(.37,-hR*.18,0,0,0,-.08,.14,hR*.2,wR*.97)]);for(let i=0;i<8;i++)for(const sz of[-1,1])parts.push([BOX,'#efe6c8',mx(.47-i*.024,-hR*.22,sz*wR*.84*(1-i*.03),0,0,0,.009,hR*.36,.01)]);}
  if(E.has('torpedo')){const p=bodyProf(kind,.44),x=.06,y=p.y0+p.h+.035,tr=.045,tl=.34;
    parts.push([CYL16,'#8d9aa3',mx(x,y,0,0,0,Math.PI/2,tr,tl,tr)],[SPH,'#8d9aa3',mx(x-tl/2,y,0,0,0,0,tr*1.4,tr,tr)],[CYL16,'#ffc75a',mx(x-.06,y,0,0,0,Math.PI/2,tr*1.05,.022,tr*1.05)],[CYL16,'#ffc75a',mx(x+.03,y,0,0,0,Math.PI/2,tr*1.05,.022,tr*1.05)],
      [CYL16,'#1c2328',mx(x+tl/2,y,0,0,0,Math.PI/2,tr*.85,.012,tr*.85)],[BOX,'#3a2a1a',mx(x-.07,y-.035,0,0,0,.15,.02,.05,.02)],[BOX,'#3a2a1a',mx(x+.08,y-.035,0,0,0,-.15,.02,.05,.02)],[CYL16,'#dfe6ea',mx(x,y+tr*.55,0,0,0,Math.PI/2,tr*.35,tl*.8,tr*.35)])}
  if(!parts.length)return null;return merge(parts)}
const EVOG={};
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c)})();
const JETG=merge([[CYL16,'#a7b3bb',mx(0,0,0,0,0,Math.PI/2,.048,.26,.048)],[CONE,'#e0493a',mx(.17,0,0,0,0,-Math.PI/2,.048,.08,.048)],[CYL16,'#ffc75a',mx(.04,0,0,0,0,Math.PI/2,.05,.025,.05)],[CYL16,'#3a444b',mx(-.145,0,0,0,0,Math.PI/2,.056,.04,.056)],
  [BOX,'#e0493a',mx(-.1,.055,0,0,0,.5,.06,.05,.008)],[BOX,'#4a3420',mx(.0,0,0,0,0,0,.05,.012,.06)]]);JETG.translate(0,0,0);
const FLAMEG=new T.ConeGeometry(1,1,10);FLAMEG.rotateZ(Math.PI/2);FLAMEG.translate(-.5,0,0);
const RINGG=new T.TorusGeometry(1,.2,6,18),BEAMG=new T.ConeGeometry(1,1,14,1,true);BEAMG.rotateZ(Math.PI/2);BEAMG.translate(.5,0,0);
const WHIPG=new T.CylinderGeometry(.6,1,1,6);WHIPG.rotateZ(Math.PI/2);WHIPG.translate(-.5,0,0);
const lampM=new T.MeshStandardMaterial({color:col('#fff6c0'),emissive:col('#ffe680'),emissiveIntensity:.55,roughness:.2});const evoGeoFor=(kind,keys,spk)=>{const k=kind+'|'+keys.join(',')+'|'+spk;return k in EVOG?EVOG[k]:(EVOG[k]=evoGeo(kind,keys,spk))};
function bendMatX(mat){mat.onBeforeCompile=sh=>{sh.uniforms.uPh=mat.userData.uPh;sh.uniforms.uAmp=mat.userData.uAmp;
    sh.vertexShader='uniform float uPh;uniform float uAmp;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat tt=clamp(.5-position.x,0.,1.);float wv=pow(tt,1.7)*uAmp;transformed.z+=sin(uPh-tt*4.1)*wv;transformed.y+=cos(uPh-tt*4.1)*wv*.18;')};mat.userData.uPh={value:0};mat.userData.uAmp={value:0};return mat}
const EVOVIS=['armor','shell','jaw','fins','remora','filter','torpedo','eyes','lure','jet','tail','venom'];const RIGID=new Set(['belly','jaw','fins','eyes','lure','jet','tail','venom']);const evoSig=f=>{const ks=EVOVIS.filter(k=>f.evo[k]);return ks.join(',')+'|'+(spiky(f)?(f.evo.spikes?2:1):0)};
const pool=new Map();
function patOf(f){return f.skin==='clown'?'clown':f.skin==='tiger'?'tiger':f.skin&&f.skin!=='none'?'none':PATS[f.pat||0]}
function makeFish(f){const g=new T.Group();g.rotation.order='ZYX';const kind=ty(f),lod=f===player&&!f.bot?'hi':'lo',pat=patOf(f),geo=bodyFor(kind,pat,lod,!!f.evo.belly),hR=geo.userData.h;
  const bm=bendMat(new T.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:.03,transparent:true}));const body=new T.Mesh(geo,bm);body.castShadow=SHADOW;g.add(body);
  const fm=new T.MeshStandardMaterial({roughness:.5,side:T.DoubleSide,transparent:true,opacity:.9});
  const E=f.evo,wide=!!E.fins;if(wide){fm.opacity=.75}
  const tail=new T.Group();tail.position.x=-.49;const tmesh=new T.Mesh(TAILG[kind],fm);if(wide)tmesh.scale.set(1.45,1.5,1);tail.add(tmesh);g.add(tail);
  if(!E.shell&&!E.armor&&!E.torpedo&&!spiky(f)){const dor=new T.Mesh(DORG[kind],fm);dor.position.set(.04,hR*.88,0);if(wide)dor.scale.set(1.6,2.1,1);g.add(dor)}const an=new T.Mesh(ANALG,fm);an.position.set(-.22,-hR*.62,0);if(wide)an.scale.set(1.5,1.9,1);g.add(an);
  const pecs=[];for(const s of[-1,1]){const p=new T.Mesh(PECG,fm);p.position.set(.2,-hR*.3,s*hR*.45);p.rotation.x=s*-.7;if(wide)p.scale.setScalar(1.9);g.add(p);pecs.push(p)}
  const spk=spiky(f)?(E.spikes?2:1):0,eg=evoGeoFor(kind,EVOVIS.filter(k=>E[k]&&!RIGID.has(k)),spk);let em=null;if(eg){em=bendMatX(new T.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:E.armor?.35:.05,transparent:true}));const pm=new T.Mesh(eg,em);pm.castShadow=SHADOW;g.add(pm)}
  // глаза: белок, зрачок, блик; у хищника — злая бровь
  const EY=!!E.eyes,ex=kind==='c'?.33:.34,ey=hR*(EY?.4:.32),er=(kind==='h'?.042:.036)*(EY?1.7:1),eyes=[];
  for(const s of[-1,1]){const ez=s*hR*.42;const sc=new T.Mesh(eyeG,EY?lampM:sclM);if(EY){const rg=new T.Mesh(RINGG,browM);rg.scale.setScalar(er*1.05);rg.position.set(ex,ey,ez+s*er*.18);g.add(rg);const gs=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:col('#fff0a0'),transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false}));gs.scale.setScalar(er*5);gs.position.set(ex+er*.3,ey,ez+s*er*.8);g.add(gs)}sc.scale.set(er,er,er*.55);sc.position.set(ex,ey,ez);g.add(sc);const pu=new T.Mesh(eyeG,pupM);pu.scale.setScalar(er*.55);pu.position.set(ex+er*.18,ey,ez+s*er*.38);g.add(pu);
    const hl=new T.Mesh(eyeG,hlM);hl.scale.setScalar(er*.18);hl.position.set(ex+er*.05,ey+er*.28,ez+s*er*.62);g.add(hl);eyes.push(pu);
    if(kind==='c'){const br=new T.Mesh(BOX,browM);br.scale.set(er*2.4,er*.38,er*.5);br.position.set(ex+er*.1,ey+er*1.05,ez+s*er*.2);br.rotation.z=-.42;g.add(br)}}
  // рот: тёмная пасть, нижняя челюсть открывается, у хищника и всеядной — зубы
  const big=!!E.jaw&&kind!=='h';const jaw=new T.Group();jaw.position.set(.47,-hR*.12+(.06*.12),0);const jm=new T.Mesh(JAWG,fm);if(big){const JL=.3;jaw.position.x=.47-JL;jm.scale.set(2.2,2.6,2.1);jm.position.x=JL;const gum=new T.Mesh(JAWG,mouthM);gum.scale.set(2.05,1.9,1.9);gum.position.set(JL-.01,.006,0);jaw.add(gum);const thr=new T.Mesh(new T.CircleGeometry(1,16),mouthM);thr.scale.set(.15,hR*.3,1);thr.position.set(.36,-hR*.25,0);g.add(thr)}jaw.add(jm);g.add(jaw);
  if(big){for(let i=0;i<5;i++)for(const s of[-1,1]){const t=new T.Mesh(TOOTHG,toothM);t.scale.setScalar(2.2);t.position.set(.28-i*.045,.026,s*.055);jaw.add(t)}}
  const mouth=new T.Mesh(new T.CircleGeometry(1,12,Math.PI*.9,Math.PI*.6),mouthM);mouth.scale.set(.09,.05,1);mouth.rotation.y=Math.PI/2;mouth.position.set(.49,-hR*.12+.006,0);g.add(mouth);
  if(kind!=='h'){const nt=big?6:kind==='c'?4:2,ts=big?2.2:1;for(let i=0;i<nt;i++){for(const s of[-1,1]){const t=new T.Mesh(TOOTHG,toothM);t.scale.setScalar(ts);t.rotation.z=Math.PI;t.position.set(.455-i*(big?.045:.025),-hR*.12-.004*ts,s*(big?.06:.025));g.add(t)}}}
  if(big)mouth.visible=false
  const X={};const rm=new T.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.35,transparent:true});X.rm=rm;
  if(E.jet){X.fl=[];const flM=new T.MeshBasicMaterial({color:col('#ffb048'),transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false});X.flM=flM;for(const sz of[-1,1]){const j=new T.Mesh(JETG,rm);j.scale.setScalar(1.3);j.position.set(-.02,-hR*.12,sz*(hR*.5+.06));g.add(j);const fl=new T.Mesh(FLAMEG,flM);fl.position.set(-.235,-hR*.12,sz*(hR*.5+.06));fl.scale.set(.06,.045,.045);g.add(fl);X.fl.push(fl)}}
  if(E.torpedo){const p=bodyProf(kind,.44);const tip=new T.Mesh(CONE,new T.MeshStandardMaterial({color:col('#e0493a'),roughness:.4}));tip.scale.set(.03,.05,.03);tip.rotation.z=-Math.PI/2;tip.position.set(.06+.17+.02,p.y0+p.h+.035,0);g.add(tip);X.tip=tip}
  if(E.lure){const lg=new T.Group();lg.position.set(.3,hR*.85,0);const stM=new T.MeshStandardMaterial({color:col('#5a4a3a'),roughness:.6,transparent:true});X.stM=stM;
    const cv=new T.QuadraticBezierCurve3(new T.Vector3(0,0,0),new T.Vector3(.12,hR*1.5,0),new T.Vector3(.36,hR*1.05,0));lg.add(new T.Mesh(new T.TubeGeometry(cv,14,.011,5),stM));
    const bulb=new T.Mesh(eyeG,lampM);bulb.scale.setScalar(.034);bulb.position.set(.36,hR*1.05-.02,0);lg.add(bulb);const glM=new T.SpriteMaterial({map:glowTex,color:col('#fff6a8'),transparent:true,blending:T.AdditiveBlending,depthWrite:false});const gl=new T.Sprite(glM);gl.scale.setScalar(.32);gl.position.copy(bulb.position);lg.add(gl);X.glM=glM;g.add(lg);X.lure=lg}
  if(E.tail){const wM=new T.MeshStandardMaterial({roughness:.45,transparent:true});X.wM=wM;let par=tail,x0=-.17;X.whip=[];for(let i=0;i<4;i++){const sg=new T.Group();sg.position.x=x0;const m=new T.Mesh(WHIPG,wM);const r0=.026*(1-i*.18);m.scale.set(.11,r0,r0);sg.add(m);par.add(sg);X.whip.push(sg);par=sg;x0=-.11}}
  if(E.venom&&kind!=='h'){const vM=new T.MeshStandardMaterial({color:col('#f2f8e4'),emissive:col('#3c8a20'),emissiveIntensity:.25,roughness:.3});for(const sz of[-1,1]){const fg=new T.Mesh(CONE,vM);fg.scale.set(.017,.085,.017);fg.rotation.z=Math.PI;fg.position.set(.44,-hR*.12-.045,sz*.035);g.add(fg)}
    const dM=new T.MeshBasicMaterial({color:col('#8cff5a'),transparent:true});const dr=new T.Mesh(eyeG,dM);dr.scale.setScalar(.016);g.add(dr);X.drip=dr;X.dM=dM;X.dy=-hR*.12-.095}
  g.userData={f,bm,fm,em,X,tail,pecs,jaw,kind,pat,lod,big,sig:evoSig(f),ph:Math.random()*6};S.add(g);return g}
const FC=new T.Color();
function fishHue(f){const SK=f.skin&&f.skin!=='none'?f.skin:null;return SK==='clown'?[22,96]:SK==='tiger'?[205,16]:SK==='neon'?[228,40]:SK==='gold'?[44,92]:SK==='rainbow'?[(now*70+f.id*37)%360,85]:SK==='shark'?[205,20]:SK==='mecha'?[210,12]:SK==='lion'?[10,62]:SK==='betta'?[320+Math.sin(now*.6+f.id)*28,78]:[f.hue,58]}
function updFish(dt){const seen=new Set();
  for(const f of fish){if(!f.alive){continue}const Lb=f.r*2.5;if(f.x+Lb<vx0||f.x-Lb>vx1||f.y+Lb<vy0||f.y-Lb>vy1)continue;seen.add(f);
    let g=pool.get(f);const lod=f===player&&!f.bot?'hi':'lo';if(!g||g.userData.kind!==ty(f)||g.userData.pat!==patOf(f)||g.userData.lod!==lod||g.userData.sig!==evoSig(f)){if(g){S.remove(g)}g=makeFish(f);pool.set(f,g)}g.visible=true;const u=g.userData;
    const [h,sat]=fishHue(f);FC.setHSL((h%360)/360,sat/100,.5).convertSRGBToLinear();u.bm.color.copy(FC);if(f.evo.hunter)u.fm.color.copy(col('#e0493a'));else{FC.setHSL(((h+8)%360)/360,Math.min(1,sat/100+.05),.4).convertSRGBToLinear();u.fm.color.copy(FC)}
    u.bm.emissive.setRGB(f.flash>0?f.flash*.6:0,f.flash>0?f.flash*.6:0,f.flash>0?f.flash*.6:0);
    let a=1;if(f.hidden&&f!==player)a=(f.pw.invis>0||(f.evo.cham&&f.still>.8))?.16:.42;if(f===player&&f.hidden)a=.75;if(f.protect>0)a*=.55+.35*Math.sin(now*20);if(player&&player.alive&&f!==player&&tooSmall(player,f))a*=.45;
    u.bm.opacity=a;u.fm.opacity=a*(f.evo.fins?.75:.9);u.bm.depthWrite=a>.9;if(u.em){u.em.opacity=a}
    const sw=Math.min(1.3,f.swim||0);u.ph+=dt*(5+sw*7)*(f.stun>0?.3:1);const amp=(.035+.07*sw);u.bm.userData.uPh.value=u.ph;u.bm.userData.uAmp.value=amp;if(u.em){u.em.userData.uPh.value=u.ph;u.em.userData.uAmp.value=amp}
    const tz=Math.sin(u.ph-4.1)*amp,ty2=Math.cos(u.ph-4.1)*amp*.18;u.tail.position.set(-.49,ty2,tz);u.tail.rotation.y=-Math.cos(u.ph-4.1)*amp*4.5;for(const [i,p] of u.pecs.entries())p.rotation.y=Math.sin(now*4+i*1.3)*.35;
    const X=u.X;X.rm.opacity=a;if(X.fl){const k=f.dashT>0?1:0;for(const fl of X.fl)fl.scale.set(k?.2+Math.random()*.1:.04+Math.random()*.025,.045,.045);X.flM.opacity=a*(k?.95:.6)}
    if(X.tip)X.tip.visible=!f.cd||!(f.cd.torpedo>0);if(X.lure){X.lure.rotation.z=Math.sin(now*2.5+f.id)*.07;X.glM.opacity=a*(.75+.25*Math.sin(now*4+f.id));X.stM.opacity=a}
    if(X.whip){const k=f.whipT>0?1:0;X.wM.color.copy(u.fm.color);X.wM.emissive.setRGB(k*.6,k*.5,k*.3);X.wM.opacity=a;for(let i=0;i<X.whip.length;i++)X.whip[i].rotation.y=Math.sin(u.ph*1.3-1-i*.9)*(.35+k*.25)+(k?Math.sin(now*30)*.2:0)}
    if(X.drip){const dr=(now*1.5+f.id*.3)%1;X.drip.position.set(.44,X.dy-dr*.09,0);X.dM.opacity=a*(1-dr)}
    u.jaw.rotation.z=u.big?-(f.jaw||0)*.45-.05:-(f.jaw||0)*.55-.04;
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
return {render,foodTypes,_dbg:{S,T,FOODM,foodMat}}})();
