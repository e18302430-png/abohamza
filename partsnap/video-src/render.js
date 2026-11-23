const { chromium } = require('playwright');
const path=require('path'),fs=require('fs');
const [,,mode='test',W='1280',H='1280',out='frames',light='0']=process.argv;
(async()=>{
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:+W,height:+H}});
  p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
  await p.goto('file://'+path.resolve('scene.html')+`?w=${W}&h=${H}&light=${light}`);
  await p.waitForFunction('window.READY===true',{timeout:60000});
  const c=await p.$('canvas');
  const times= mode==='test'?[0,2.6,3.9,6.2,8.6,10.5,11.97]:[...Array(360).keys()].map(i=>i/30);
  fs.mkdirSync(out,{recursive:true});
  const t0=Date.now();
  for(let i=0;i<times.length;i++){await p.evaluate(t=>renderAt(t),times[i]);await c.screenshot({path:`${out}/f${String(i).padStart(4,'0')}.png`});}
  console.log('rendered',times.length,'in',(Date.now()-t0)/1000,'s');
  await b.close();
})();
