const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
const prods=[['أرز بسمتي ٥ كجم','بقالة',210,245,40],['زيت عباد ١ لتر','زيوت',62,72,55],['سكر ١ كجم','بقالة',30,35,120],['شاي ٢٥٠ جم','مشروبات',48,58,3],['مكرونة ٤٠٠ جم','بقالة',11,14,200],['جبنة بيضاء ١ كجم','ألبان',95,115,18],['لبن ١ لتر','ألبان',32,38,4],['صابون غسيل','منظفات',38,45,30],['تونة','معلبات',42,52,60],['بسكويت','حلويات',5,7,2],['عسل ٥٠٠ جم','بقالة',120,150,9],['فول معلب','معلبات',14,18,80]];
const S={products:[],sales:[],customers:[{id:'c1',name:'أبو محمد',phone:'010',debt:850},{id:'c2',name:'أم سارة',phone:'011',debt:320}],expenses:[],seq:0,promos:[],adjust:[],suppliers:[{id:'s1',name:'شركة النور للتوزيع',phone:'012',bal:4200}],buys:[],held:[],shopOn:true,menuAt:'',
 settings:{store:'ماركت أبو حمزة',phone:'',addr:'',cur:'ج.م',lyEarn:1,lyVal:0.05},auth:'1234',cloud:{url:'',key:'',code:''},updatedAt:'',lastBackup:''};
prods.forEach((p,i)=>S.products.push({id:'p'+i,name:p[0],cat:p[1],unit:'حبة',cost:p[2],price:p[3],qty:p[4],min:5}));
let seed=7;const r=()=>(seed=(seed*9301+49297)%233280)/233280;
for(let d=0;d<30;d++)for(let k=0;k<6+Math.floor(r()*8);k++){const items=[];for(let j=0;j<1+Math.floor(r()*4);j++){const p=S.products[Math.floor(r()*10)];items.push({id:p.id,name:p.name,price:p.price,cost:p.cost,unit:'حبة',qty:1+Math.floor(r()*3)})}
 const tot=items.reduce((a,i)=>a+i.price*i.qty,0);const dt=new Date(Date.now()-d*864e5);dt.setHours(9+Math.floor(r()*12));S.seq++;
 S.sales.push({id:'s'+S.seq,no:S.seq,date:dt.toISOString(),items,sub:tot,dis:0,tot,pay:r()<.2?'credit':'cash',mode:'retail',cust:'',cash:tot})}
for(const [w,h,tag] of [[1440,900,'d'],[390,844,'m']]){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});const pg=await ctx.newPage();
 await pg.addInitScript(s=>{localStorage.setItem('ahz_market_v2',s)},JSON.stringify(S));
 await pg.goto('file://'+path.resolve('../../index.html'));await pg.waitForTimeout(800);
 await pg.evaluate(()=>{locked=false;document.getElementById('lock').classList.add('off')});
 for(const v of ['pos','an','stock','ord','loy']){await pg.evaluate(v=>go(v),v);await pg.waitForTimeout(400);await pg.screenshot({path:`../profile/shots/${tag}-${v}.jpg`,type:'jpeg',quality:85});}
 await ctx.close()}
await b.close()})();
