const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1350}});
const which=process.argv[2]!=null&&process.argv[2]!=='all'?[+process.argv[2]]:[0,1,2,3];const mode=process.argv[3]||'pdf';
const shots=process.argv[4]||'.';
for(const i of which){await pg.goto('file://'+path.resolve('board.html')+'?i='+i);await pg.waitForFunction('window.READY');
 const slug=await pg.evaluate(i=>IDEAS[i].slug,i);
 if(mode==='png'){const els=await pg.$$('.pg');for(let k=0;k<els.length;k++)await els[k].screenshot({path:path.join(shots,`${slug}_${k}.png`)});}
 else await pg.pdf({path:`../pdf/${slug}.pdf`,width:'1080px',height:'1350px',printBackground:true,preferCSSPageSize:true});
 console.log('ok',slug);}
await b.close()})();
