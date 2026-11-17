const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const FPS=30,DUR=48.5,N=Math.round(FPS*DUR);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r','30','video_noaudio.mp4'],{stdio:['pipe','inherit','inherit']});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
await pg.goto('file://'+require('path').resolve('film.html'));await pg.waitForFunction('window.READY');
for(let i=0;i<N;i++){await pg.evaluate(t=>render(t),i/FPS);const buf=await pg.screenshot({type:'jpeg',quality:92});
 if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150==0)console.log('frame',i,'/',N);}
ff.stdin.end();await b.close();ff.on('close',c=>console.log('ffmpeg done',c));})();
