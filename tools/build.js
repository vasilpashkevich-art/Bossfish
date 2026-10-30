// Сборка: src/game.html (фрагмент, как для артефакта Claude) -> index.html (полная страница для GitHub Pages)
// Запуск: node tools/build.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'src','game.html'),'utf8');
const cut=src.indexOf('</style>')+'</style>'.length;
const head=src.slice(0,cut),body=src.slice(cut);
const out=`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#03172a">
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
`;
fs.writeFileSync(path.join(root,'index.html'),out);
console.log('index.html собран:',out.length,'байт');
