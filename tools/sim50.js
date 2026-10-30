// Автоигрок для проверки баланса.
// Запуск: node tools/sim50.js <склонность> <забегов> <секунд>
//   склонность: -0.9 травоядная, 0 всеядная, 0.9 хищник
//   пример:     node tools/sim50.js 0.9 2 3600   (два забега по 60 минут игрового времени)
// После гибели игрок продолжает с того же уровня — считаем время по уровням и число смертей.
const fs=require('fs');
const js=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8').split('<script>')[1].split('</script>')[0];
const noop=()=>{};const grad={addColorStop:noop};
const ctxP=new Proxy({},{get:(t,k)=>{if(k in t)return t[k];if(/Gradient/.test(k))return ()=>grad;return noop},set:(t,k,v)=>{t[k]=v;return true}});
const els={};function el(id){return els[id]||(els[id]={id,hidden:false,style:{setProperty:noop},classList:{add:noop,remove:noop,toggle:noop},textContent:'',innerHTML:'',value:'',children:[],firstElementChild:{style:{}},addEventListener:noop,getContext:()=>ctxP,appendChild(c){this.children.push(c)},removeChild(){this.children.shift()},focus:noop,setAttribute:noop,insertAdjacentHTML:noop,width:432,height:144,remove:noop})}
global.document={addEventListener:()=>{},getElementById:el,createElement:()=>({style:{},remove:noop,set onclick(f){this._c=f},click(){this._c&&this._c()}}),activeElement:null,body:{dataset:{},classList:{toggle:noop,add:noop,remove:noop}},documentElement:{lang:''},hidden:false};
global.window={devicePixelRatio:1,matchMedia:()=>({matches:false})};global.matchMedia=global.window.matchMedia;global.innerWidth=1400;global.innerHeight=850;global.addEventListener=noop;
global.Path2D=class{moveTo(){}quadraticCurveTo(){}closePath(){}lineTo(){}bezierCurveTo(){}};
global.localStorage={getItem:()=>null,setItem:noop,removeItem:noop};global.requestAnimationFrame=noop;global.performance={now:()=>0};global.setTimeout=()=>0;
eval(js);const M=window.__malek;M.step(600,1/30,false);
const bias=+(process.argv[2]||0),runs=+(process.argv[3]||3),cap=+(process.argv[4]||3600);
for(let run=0;run<runs;run++){M.startGame();const p=M.player;p.bot=true;p.bias=bias;let t=0,marks={},deaths=0,maxL=1,life1=null;
 // "бессмертный" режим: после гибели продолжаем с того же уровня, считаем гибели
 while(t<cap){M.step(30,1/30,false);t+=1;
   if(!p.alive){if(!life1)life1={L:p.L,min:Math.round(t/6)/10,cause:M.death&&M.death.cause};deaths++;p.alive=true;p.hunger=1;p.protect=3;p.x=Math.random()*11000+500;p.y=1000;M.fish.push(p);}
   maxL=Math.max(maxL,p.L);for(let L=5;L<=50;L+=5)if(p.L>=L&&!marks[L])marks[L]=Math.round(t/60*10)/10;if(p.L>=50)break}
 const top=M.fish.filter(f=>f!==p).map(f=>f.L).sort((a,b)=>b-a).slice(0,6);
 const botL=M.fish.filter(f=>f!==p).map(f=>f.L);const dist=[0,10,20,30,40,50].map((a,i,ar)=>botL.filter(l=>l>=a&&l<(ar[i+1]||99)).length).join('/');
 console.log(JSON.stringify({bias,life1,botsBy10:dist,minutes:Math.round(t/6)/10,L:p.L,maxL,deaths,marks,evo:Object.keys(p.evo).join(','),type:+(p.meat/(p.meat+p.herb)).toFixed(2),topBots:top.join(' ')}));
 p.alive=false;M.fish.splice(M.fish.indexOf(p),1);
}
