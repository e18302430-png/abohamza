const {chromium}=require('playwright');
(async()=>{const [,,file,out,...ts]=process.argv;const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
await pg.goto('file://'+require('path').resolve(file));await pg.waitForFunction('window.READY');
for(const t of ts){await pg.evaluate(t=>render(+t),t);await pg.screenshot({path:`${out}/f_${t}.jpg`,type:'jpeg',quality:80});}
await b.close()})();
