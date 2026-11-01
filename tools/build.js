// Сборка: src/game.html (фрагмент, как для артефакта Claude) -> index.html (полная страница для GitHub Pages)
// Запуск: node tools/build.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'src','game.html'),'utf8');
const cut=src.indexOf('</style>')+'</style>'.length;
function page(head,body){return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#03172a">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%230b3452%22/%3E%3Cpath d=%22M12 32c8-12 26-14 36 0-10 14-28 12-36 0z%22 fill=%22%23ffc75a%22/%3E%3Cpath d=%22M46 32l10-8v16z%22 fill=%22%23ff8a5c%22/%3E%3Ccircle cx=%2222%22 cy=%2229%22 r=%223%22 fill=%22%2303172a%22/%3E%3C/svg%3E">
<meta property="og:title" content="Bossfish">
<meta property="og:description" content="Hatch as a tiny fry, eat, evolve and become the master of the deep. Free browser game.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="description" content="Малёк — подводная браузерная игра: вырасти из малька в хозяина глубин.">
${head}
<style>html,body{margin:0;padding:0}</style>
</head>
<body>
${body}
</body>
</html>
`}
const head=src.slice(0,cut),body=src.slice(cut);
const out=page(head,body);
fs.writeFileSync(path.join(root,'index.html'),out);
console.log('index.html собран:',out.length,'байт');
// 3D-бета: та же игра + Three.js и модуль src/r3d.js на месте метки
const r3d=fs.readFileSync(path.join(root,'src','r3d.js'),'utf8');
const THREE_SRC='<script>window.__R3D=1</script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n';
const body3=body.replace('/*@R3D@*/',r3d).replace('<script>',THREE_SRC+'<script>');
const head3=head.replace(/<title>([^<]*)<\/title>/,'<title>$1 3D</title>');
fs.writeFileSync(path.join(root,'3d.html'),page(head3,body3));
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist','game3d.html'),head3+body3);
console.log('3d.html собран:',page(head3,body3).length,'байт');
