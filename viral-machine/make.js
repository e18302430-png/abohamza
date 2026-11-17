// Viral machine: script JSON -> MP4 (1080x1920, 30fps, music + SFX)
// usage: node make.js scripts/name.json            -> out/name.mp4
//        node make.js scripts/name.json --preview  -> out/name-preview.jpg (contact sheet)
const {chromium}=require('playwright');const {spawn,execFileSync}=require('child_process');
const fs=require('fs'),path=require('path');
const file=process.argv[2];const preview=process.argv.includes('--preview');
const SCRIPT=JSON.parse(fs.readFileSync(file,'utf8'));const name=path.basename(file,'.json');
const OUT=path.join(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
  await pg.addInitScript(s=>{window.SCRIPT=s},SCRIPT);
  await pg.goto('file://'+path.join(__dirname,'engine.html'));await pg.waitForFunction('window.READY');
  const DUR=await pg.evaluate('DUR'),CUES=await pg.evaluate('CUES');
  if(preview){
    const n=12,shots=[];for(let i=0;i<n;i++){const t=(i+.5)*DUR/n;await pg.evaluate(t=>render(t),t);
      shots.push(await pg.screenshot({type:'jpeg',quality:70,clip:{x:0,y:0,width:1080,height:1920}}));}
    shots.forEach((s,i)=>fs.writeFileSync(path.join(OUT,`_p${i}.jpg`),s));
    execFileSync('ffmpeg',['-y','-loglevel','error','-i',path.join(OUT,'_p%d.jpg'),'-vf','scale=216:384,tile=6x2','-frames:v','1',path.join(OUT,name+'-preview.jpg')]);
    shots.forEach((s,i)=>fs.unlinkSync(path.join(OUT,`_p${i}.jpg`)));
    console.log('preview',name,DUR+'s');await b.close();return;
  }
  const FPS=30,N=Math.round(DUR*FPS),raw=path.join(OUT,name+'_noaudio.mp4');
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-',
    '-vf','scale=out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-preset','medium','-b:v','8M','-maxrate','12M','-bufsize','16M','-profile:v','high','-level','4.1',
    '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-r','30',raw],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<N;i++){await pg.evaluate(t=>render(t),i/FPS);const buf=await pg.screenshot({type:'jpeg',quality:92});
    if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150===0)console.log(name,'frame',i,'/',N);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
  const cj=path.join(OUT,name+'.cues.json'),wav=path.join(OUT,name+'.wav');fs.writeFileSync(cj,JSON.stringify(CUES));
  const m=SCRIPT.music||{};const args=[path.join(__dirname,'music.py'),m.style||'action',String(DUR),cj,wav];if(m.drop!=null)args.push(String(m.drop));
  console.log(execFileSync('python3',args).toString().trim());
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',raw,'-i',wav,'-c:v','copy','-af','loudnorm=I=-14:TP=-1.0:LRA=9','-ar','44100','-c:a','aac','-b:a','160k',
    '-shortest','-movflags','+faststart','-brand','mp42',path.join(OUT,name+'.mp4')]);
  [raw,cj,wav].forEach(f=>fs.unlinkSync(f));console.log('done',path.join(OUT,name+'.mp4'));
})();
