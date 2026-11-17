const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1350}});
for(const n of [1,2,3]){await pg.goto('file://'+path.resolve('posters.html')+'?p='+n);await pg.waitForFunction('window.READY');
await pg.screenshot({path:`../poster-${n}.png`});}await b.close()})();
