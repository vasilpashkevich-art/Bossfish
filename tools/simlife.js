// Сколько живёт одна жизнь: автоигрок без воскрешений.
// Запуск: node tools/simlife.js <склонность> <жизней> <макс. секунд> [файл]
const fs=require('fs'),path=require('path');
const file=process.argv[5]||path.join(__dirname,'..','index.html');
const js=fs.readFileSync(file,'utf8').split('<script>')[1].split('</script>')[0];
const noop=()=>{};const grad={addColorStop:noop};
const ctxP=new Proxy({},{get:(t,k)=>{if(k in t)return t[k];if(/Gradient/.test(k))return ()=>grad;return noop},set:(t,k,v)=>{t[k]=v;return true}});
const els={};function el(id){return els[id]||(els[id]={id,hidden:false,style:{setProperty:noop},classList:{add:noop,remove:noop,toggle:noop},textContent:'',innerHTML:'',value:'',children:[],firstElementChild:{style:{}},addEventListener:noop,getContext:()=>ctxP,appendChild(c){this.children.push(c)},removeChild(){this.children.shift()},focus:noop,setAttribute:noop,insertAdjacentHTML:noop,width:432,height:144,remove:noop})}
global.document={addEventListener:()=>{},getElementById:el,createElement:()=>({style:{},remove:noop,set onclick(f){this._c=f},click(){this._c&&this._c()}}),activeElement:null,body:{dataset:{},classList:{toggle:noop,add:noop,remove:noop}},documentElement:{lang:''},hidden:false};
global.window={devicePixelRatio:1,matchMedia:()=>({matches:false})};global.matchMedia=global.window.matchMedia;global.innerWidth=1400;global.innerHeight=850;global.addEventListener=noop;
global.Path2D=class{moveTo(){}quadraticCurveTo(){}closePath(){}lineTo(){}bezierCurveTo(){}};
global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};global.requestAnimationFrame=noop;global.performance={now:()=>0};global.setTimeout=()=>0;
eval(js);const M=window.__malek;M.step(600,1/30,false);
const bias=+(process.argv[2]||0),runs=+(process.argv[3]||10),cap=+(process.argv[4]||900);const res=[];
for(let r=0;r<runs;r++){M.startGame();const p=M.player;p.bot=true;p.bias=bias;let t=0,mx=1;
  while(p.alive&&t<cap){M.step(30,1/30,false);t++;mx=Math.max(mx,p.L)}
  res.push({maxL:mx,min:+(t/60).toFixed(1),cause:p.alive?"alive":(M.death&&M.death.cause),by:M.death&&M.death.byL});
  if(p.alive){p.alive=false;const i=M.fish.indexOf(p);if(i>=0)M.fish.splice(i,1)}M.step(90,1/30,false)}
const L=res.map(r=>r.maxL).sort((a,b)=>a-b);
console.log(JSON.stringify({bias,median:L[L.length>>1],reached20:res.filter(r=>r.maxL>=20).length+'/'+runs,eaten:res.filter(r=>r.cause==='eaten').length,levels:L.join(' '),killers:res.map(r=>r.maxL+'<'+r.by).join(' ')}));
