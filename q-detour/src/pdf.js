const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1920,height:1080}});
await pg.goto('file://'+path.resolve('deck.html'));await pg.waitForFunction('window.READY');
await pg.pdf({path:'../q-campaign.pdf',width:'1920px',height:'1080px',printBackground:true,preferCSSPageSize:true});await b.close()})();
