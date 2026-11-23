window.PS3D=(function(){
  /* Light studio scene of a modern US top-load washer. Chapters: 0 washer · 1 lid opens, label · 2 AI read · 3 exploded · 4 pump · 5 exact part. */
  const cv=$("#world");
  if(!window.THREE||!cv){document.documentElement.classList.add("no3d");return null}
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:"high-performance"})}catch(e){document.documentElement.classList.add("no3d");return null}
  const PHONE=Math.min(innerWidth,innerHeight)<700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,PHONE?1.25:1.75));
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.shadowMap.enabled=!PHONE;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const BG=0xEEF0EE;let blobMesh=null,floorMesh=null;
  const scene=new THREE.Scene();scene.background=new THREE.Color(BG);scene.fog=new THREE.Fog(BG,16,34);
  const camera=new THREE.PerspectiveCamera(30,1,.05,100);
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);

  // studio reflections from emissive panels (no add-ons needed)
  {const env=new THREE.Scene();
   const room=new THREE.Mesh(new THREE.BoxGeometry(20,10,20),new THREE.MeshBasicMaterial({color:0xBFC3C2,side:THREE.BackSide}));env.add(room);
   const panel=(w,h,pos,k,c=0xffffff)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(k),side:THREE.DoubleSide}));m.position.copy(pos);m.lookAt(0,0,0);env.add(m)};
   panel(8,6,V(0,4.9,0),6);panel(1.2,7,V(-6,1,5),4);panel(1.2,7,V(7,1,-2),3);panel(10,3,V(0,1,-9.9),1.5);panel(20,20,V(0,-4.9,0),.6,0xD8D8D4);
   const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.02).texture;pm.dispose()}
  scene.add(new THREE.HemisphereLight(0xffffff,0xC9CCC8,.2));
  const key=new THREE.DirectionalLight(0xFFF6EC,2.2);key.position.set(4,7,5);key.castShadow=true;
  key.shadow.mapSize.set(PHONE?512:1024,PHONE?512:1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:6,bottom:-3,near:1,far:20});key.shadow.bias=-.0006;key.shadow.radius=4;scene.add(key);
  const fill=new THREE.DirectionalLight(0xE8F0F6,.6);fill.position.set(-6,3,4);scene.add(fill);
  const rimL=new THREE.DirectionalLight(0xffffff,1.4);rimL.position.set(-3,4,-6);scene.add(rimL);
  const pumpLight=new THREE.PointLight(0xFF6B2C,0,3,2);scene.add(pumpLight);

  // floor: soft contact shadow + receiving plane
  {const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d");const r=g.createRadialGradient(128,128,10,128,128,128);r.addColorStop(0,"rgba(20,28,34,.38)");r.addColorStop(1,"rgba(20,28,34,0)");g.fillStyle=r;g.fillRect(0,0,256,256);
   const blob=blobMesh=new THREE.Mesh(new THREE.PlaneGeometry(4.6,4.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));blob.rotation.x=-Math.PI/2;blob.position.y=.002;scene.add(blob);
   const floor=floorMesh=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor)}

  // materials
  const P=o=>new THREE.MeshPhysicalMaterial(o);
  const M={
    enamel:P({color:0xF7F7F5,roughness:.38,metalness:0,clearcoat:1,clearcoatRoughness:.08}),
    steel:P({color:0xC9CED2,metalness:1,roughness:.28,side:THREE.DoubleSide}),
    glass:P({color:0x0B0E10,metalness:0,roughness:.06,clearcoat:1,clearcoatRoughness:.02}),
    smoke:P({color:0x2A3238,metalness:0,roughness:.05,transparent:true,opacity:PHONE?.55:.62,clearcoat:1}),
    chrome:P({color:0xffffff,metalness:1,roughness:.08,envMapIntensity:1.4}),
    orange:P({color:0xA8380A,envMapIntensity:.6,roughness:.34,clearcoat:.6,clearcoatRoughness:.18,emissive:0xFF6B2C,emissiveIntensity:0}),
    rubber:P({color:0x1C1F21,roughness:.85,metalness:0}),
    copper:P({color:0xC97A4A,metalness:1,roughness:.32}),
    dark:P({color:0x2B3136,roughness:.45,metalness:.2,clearcoat:.5}),
  };
  // stainless drum hole pattern
  {const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,256,256);g.fillStyle="#000";
   for(let y=0;y<256;y+=24)for(let x=(y/24%2)*12;x<256;x+=24){g.beginPath();g.arc(x+6,y+6,3.2,0,7);g.fill()}
   const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,5);M.steel.alphaMap=t;M.steel.alphaTest=.5}

  function rrect(w,d,r,hole){const s=new THREE.Shape();const x=-w/2,y=-d/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);if(hole)s.holes.push(hole);return s}
  function slab(shape,h,bevel=.04){const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:8});g.rotateX(-Math.PI/2);return g}
  const mesh=(g,m,cast=true)=>{const o=new THREE.Mesh(g,m);o.castShadow=cast;o.receiveShadow=true;return o};

  const washer=new THREE.Group();scene.add(washer);
  const parts=[];const add=(o,off,delay=0)=>{o.userData.base=o.position.clone();o.userData.off=off;o.userData.delay=delay;washer.add(o);parts.push(o);return o};
  // cabinet body (ghosts when exploded)
  const cabMat=M.enamel.clone();cabMat.transparent=true;
  const cab=mesh(slab(rrect(3,3,.18),3.14),cabMat);cab.position.y=.12;washer.add(cab);
  const cabEdge=new THREE.LineSegments(new THREE.EdgesGeometry(cab.geometry,30),new THREE.LineBasicMaterial({color:0x8E989F,transparent:true,opacity:0}));cabEdge.position.copy(cab.position);washer.add(cabEdge);
  const toe=mesh(new THREE.BoxGeometry(2.9,.12,2.9),M.rubber,false);toe.position.y=.06;washer.add(toe);
  // top deck with the tub opening
  const hole=new THREE.Path();hole.absarc(0,.2,.95,0,Math.PI*2,true);
  const deckMat=M.enamel.clone();deckMat.transparent=true;const deck=add(mesh(slab(rrect(3,3,.18,hole),.06,.02),deckMat),V(0,2.0,0),.12);deck.position.y=3.26;deck.userData.base=deck.position.clone();
  // drum + agitator
  const drum=new THREE.Group();const dr=mesh(new THREE.CylinderGeometry(.9,.86,2.5,48,1,true),M.steel);drum.add(dr);
  const agit=mesh(new THREE.CylinderGeometry(.16,.3,1.9,24),M.enamel);agit.position.y=-.2;drum.add(agit);
  const fins=mesh(new THREE.CylinderGeometry(.42,.42,.08,24),M.enamel);fins.position.y=-1.1;drum.add(fins);
  drum.position.set(0,2.0,-.2);add(drum,V(0,1.9,0),.18);
  // lid (hinged at the rear) with smoked glass
  const lidPivot=new THREE.Group();lidPivot.position.set(0,3.36,-1.1);
  const lidFrame=mesh(slab(rrect(2.4,2.0,.16,(()=>{const h=new THREE.Path();const w=1.8,d=1.3,r=.12,x=-w/2,y=-d/2+.05;h.moveTo(x+r,y);h.lineTo(x+w-r,y);h.quadraticCurveTo(x+w,y,x+w,y+r);h.lineTo(x+w,y+d-r);h.quadraticCurveTo(x+w,y+d,x+w-r,y+d);h.lineTo(x+r,y+d);h.quadraticCurveTo(x,y+d,x,y+d-r);h.lineTo(x,y+r);h.quadraticCurveTo(x,y,x+r,y);return h})()),.05,.015),M.enamel);
  lidFrame.position.z=1.0;lidPivot.add(lidFrame);
  const lidGlass=mesh(new THREE.BoxGeometry(1.84,.02,1.34),M.smoke,false);lidGlass.position.set(0,.03,1.0-.05);lidPivot.add(lidGlass);
  const handle=mesh(new THREE.BoxGeometry(.6,.04,.06),M.chrome);handle.position.set(0,.06,1.93);lidPivot.add(handle);
  add(lidPivot,V(0,2.4,-.2),0);
  // console: enamel back, black glass face, chrome knob, LED, buttons
  const con=new THREE.Group();con.position.set(0,3.6,-1.3);
  const cbody=mesh(new THREE.BoxGeometry(3,.58,.4),M.enamel);con.add(cbody);
  const face=new THREE.Group();face.position.set(0,0,.205);face.rotation.x=-.21;con.add(face);
  face.add(mesh(new THREE.BoxGeometry(2.86,.44,.02),M.glass,false));
  const knob=mesh(new THREE.LatheGeometry([V(0,0),V(.2,0),V(.22,.03),V(.22,.11),V(.19,.14),V(0,.14)].map(v=>new THREE.Vector2(v.x,v.y)),40),M.chrome);knob.rotation.x=Math.PI/2;knob.position.set(-.85,0,.01);face.add(knob);
  const led=document.createElement("canvas");led.width=256;led.height=80;{const g=led.getContext("2d");g.fillStyle="#06090b";g.fillRect(0,0,256,80);g.fillStyle="#3FD8F2";g.font="bold 54px 'Courier New',monospace";g.textAlign="center";g.textBaseline="middle";g.fillText("0:52",128,42)}
  const ledT=new THREE.CanvasTexture(led);ledT.encoding=THREE.sRGBEncoding;
  const ledM=new THREE.Mesh(new THREE.PlaneGeometry(.5,.16),new THREE.MeshBasicMaterial({map:ledT,toneMapped:false}));ledM.position.set(.15,.02,.012);face.add(ledM);
  for(let i=0;i<6;i++){const b=mesh(new THREE.CylinderGeometry(.035,.035,.02,16),M.chrome,false);b.rotation.x=Math.PI/2;b.position.set(.62+i*.12,-.02,.012);face.add(b)}
  const trim=mesh(new THREE.BoxGeometry(2.9,.012,.012),M.chrome,false);trim.position.set(0,.24,.012);face.add(trim);
  add(con,V(0,1.6,-.6),.06);

  // rating label: white polyester stock lying on the front rim under the lid
  const PW=.9,PH=.44,CW=2048,CH=1000;
  const lc=document.createElement("canvas");lc.width=CW;lc.height=CH;
  const labelTex=new THREE.CanvasTexture(lc);labelTex.encoding=THREE.sRGBEncoding;labelTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const label=new THREE.Group();label.position.set(0,3.336,1.14);label.rotation.x=-Math.PI/2+.17;washer.add(label);
  const labelMesh=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshStandardMaterial({map:labelTex,roughness:.6}));labelMesh.receiveShadow=true;label.add(labelMesh);
  const LP={x0:-PW/2+700/CW*PW,gy:PH/2-430/CH*PH};
  function layout(n){const gw=Math.min(.04,.5/Math.max(n,1));return {gw,gh:gw*1.3,x0:LP.x0+gw/2,gy:LP.gy}}
  function drawLabel(brand,model,serial,kind){
    const g=lc.getContext("2d");g.fillStyle="#F2F2EE";g.fillRect(0,0,CW,CH);g.strokeStyle="#141A20";g.lineWidth=10;g.strokeRect(30,30,CW-60,CH-60);
    g.fillStyle="#141A20";g.textAlign="left";g.textBaseline="alphabetic";
    g.font="bold 112px Arial, sans-serif";g.fillText(String(brand||"BRAND").toUpperCase().slice(0,14),110,190);
    g.font="bold 50px Arial, sans-serif";g.fillText("MODEL NO.",110,440);g.fillText("SERIAL NO.",110,610);g.fillText("TYPE",110,760);
    g.font="bold 74px 'Courier New', monospace";g.fillText(String(serial||"—").slice(0,14),700,620);g.fillText(String(kind||"APPLIANCE").toUpperCase().slice(0,16),700,770);
    g.font="40px Arial, sans-serif";g.fillText("220-240V~ 50Hz · MADE FOR EGYPT",110,900);
    for(let i=0;i<46;i++){const w=(i*7%3)+3;g.fillRect(1560+i*9,640,w,190)}
    const L=layout(model.length);g.font=`bold ${Math.round(L.gh/PH*CH*.82)}px 'Courier New', monospace`;g.textAlign="center";g.textBaseline="middle";
    [...model].forEach((ch,i)=>{g.fillText(ch,((L.x0+i*L.gw*.98)+PW/2)/PW*CW,(PH/2-L.gy)/PH*CH+4)});
    labelTex.needsUpdate=true;
  }
  // AI-read glyphs: cyan on a dark chip, normal blending (visible on light)
  const glyphGroup=new THREE.Group();label.add(glyphGroup);let glyphs=[];const texCache={};
  const chip=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x0E1316,transparent:true,opacity:0,depthWrite:false}));label.add(chip);
  function glyphTex(ch,glow){const k=ch+(glow?"g":"");if(texCache[k])return texCache[k];const c=document.createElement("canvas");c.width=128;c.height=160;const g=c.getContext("2d");g.font="bold 132px 'Courier New', monospace";g.textAlign="center";g.textBaseline="middle";
    if(glow){g.shadowColor="#3FD8F2";g.shadowBlur=26;g.fillStyle="rgba(63,216,242,.7)";g.fillText(ch,64,84)}else{g.fillStyle="#fff";g.fillText(ch,64,84)}
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return texCache[k]=t}
  const box=new THREE.LineLoop(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x08708A,transparent:true,opacity:0}));label.add(box);
  function buildGlyphs(model){
    glyphGroup.children.slice().forEach(c=>glyphGroup.remove(c));glyphs=[];const L=layout(model.length);
    [...model].forEach((ch,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(L.gw,L.gh),new THREE.MeshBasicMaterial({map:glyphTex(ch),color:0x3FD8F2,transparent:true,opacity:0,depthWrite:false,toneMapped:false}));
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(L.gw*1.5,L.gh*1.35),new THREE.MeshBasicMaterial({map:glyphTex(ch,true),transparent:true,opacity:0,depthWrite:false,toneMapped:false}));
      const g=new THREE.Group();g.add(gl,m);gl.position.z=-.0005;g.position.set(L.x0+i*L.gw*.98,L.gy,.003);glyphGroup.add(g);glyphs.push({g,m,gl})});
    const bw=L.gw*model.length+.03,bh=L.gh+.022,cx=L.x0+L.gw*(model.length-1)/2*.98;
    chip.scale.set(bw,bh,1);chip.position.set(cx,L.gy,.0015);
    box.geometry.setFromPoints([[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>V(x*(bw/2+.01),y*(bh/2+.01),0)));box.position.set(cx,L.gy,.004);
  }
  // viewfinder brackets + scan line (dark cyan / normal blending on light)
  const vf=new THREE.Group();label.add(vf);
  {const m=new THREE.LineBasicMaterial({color:0x08708A,transparent:true,opacity:0});const w=PW/2+.05,h=PH/2+.05,l=.1;
   for(const [sx,sy] of [[-1,1],[1,1],[-1,-1],[1,-1]])vf.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(sx*w,sy*(h-l),.01),V(sx*w,sy*h,.01),V(sx*(w-l),sy*h,.01)]),m));vf.userData.m=m}
  const sc=document.createElement("canvas");sc.width=8;sc.height=64;{const g=sc.getContext("2d");const gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,"rgba(63,216,242,0)");gr.addColorStop(.5,"rgba(63,216,242,.9)");gr.addColorStop(1,"rgba(63,216,242,0)");g.fillStyle=gr;g.fillRect(0,0,8,64)}
  const scan=new THREE.Group();scan.add(new THREE.Mesh(new THREE.PlaneGeometry(PW+.04,.004),new THREE.MeshBasicMaterial({color:0x08708A,toneMapped:false})));
  scan.add(new THREE.Mesh(new THREE.PlaneGeometry(PW+.04,.06),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,opacity:.6,depthWrite:false,toneMapped:false})));scan.position.z=.006;label.add(scan);

  // internals: motor, belt, springs, valve, and the orange drain pump
  const motor=new THREE.Group();{const b=mesh(new THREE.CylinderGeometry(.34,.34,.55,40),M.dark);b.rotation.z=Math.PI/2;motor.add(b);
    for(let i=0;i<5;i++){const f=mesh(new THREE.TorusGeometry(.345,.014,8,40),M.dark,false);f.rotation.y=Math.PI/2;f.position.x=-.2+i*.1;motor.add(f)}
    const coil=mesh(new THREE.TorusGeometry(.24,.06,12,32),M.copper);coil.rotation.y=Math.PI/2;coil.position.x=.3;motor.add(coil)}
  motor.position.set(-.6,.5,-.1);add(motor,V(-1.5,0,.3),.24);
  const belt=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-.9,0,-.15),V(-.9,0,.15),V(.3,0,.42),V(.75,0,0),V(.3,0,-.42)],true),80,.03,8,true),M.rubber);belt.position.set(0,.85,0);add(belt,V(-.9,-.2,1.1),.28);
  function helix(){const pts=[];for(let i=0;i<=110;i++){const a=i/110*Math.PI*2*7;pts.push(V(Math.cos(a)*.07,i/110*.9,Math.sin(a)*.07))}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),220,.013,6,false)}
  [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([x,z],i)=>{const s=mesh(helix(),M.chrome);s.position.set(x*1.12,2.2,z*1.12);add(s,V(x*.8,.5,z*.8),.2+i*.02)});
  const valve=mesh(new THREE.BoxGeometry(.4,.26,.26),M.dark);valve.position.set(.85,2.9,-1.25);add(valve,V(.5,.6,-1.2),.1);
  const pump=new THREE.Group();
  {const vol=mesh(new THREE.TorusGeometry(.26,.08,16,40),M.orange);pump.add(vol);
   const body=mesh(new THREE.CylinderGeometry(.26,.26,.24,40),M.orange);body.rotation.x=Math.PI/2;pump.add(body);
   const out=mesh(new THREE.CylinderGeometry(.07,.07,.42,20),M.orange);out.rotation.z=Math.PI/2;out.position.set(.36,.16,0);pump.add(out);
   const inlet=mesh(new THREE.CylinderGeometry(.09,.1,.22,24),M.orange);inlet.rotation.x=Math.PI/2;inlet.position.z=.2;pump.add(inlet);
   const mot=mesh(new THREE.CylinderGeometry(.17,.17,.34,28),M.dark);mot.rotation.x=Math.PI/2;mot.position.z=-.29;pump.add(mot);
   const pins=mesh(new THREE.BoxGeometry(.12,.08,.1),M.dark);pins.position.set(0,.2,-.3);pump.add(pins)}
  pump.position.set(.8,.42,.95);add(pump,V(1.4,.1,1.4),.3);
  const PUMP_FRONT=V(.9,1.75,3.1);
  const fadeables=parts.filter(p=>p!==pump&&p!==deck);


  // ===== Read-Lens: an X-ray circle that follows the pointer/finger in the hero =====
  const xrayMat=new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(0x3FD8F2)},hot:{value:new THREE.Color(0xFF6B2C)}},
    vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform vec3 c;varying vec3 vN;varying vec3 vV;void main(){float r=pow(1.-abs(dot(vN,vV)),1.6);gl_FragColor=vec4(vec3(.03,.07,.09)+c*clamp(.22+r*1.15,0.,1.2),1.);}`});
  const rt=new THREE.WebGLRenderTarget(2,2,{depthBuffer:true});
  const quadCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const lensMat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,uniforms:{t:{value:rt.texture},lens:{value:new THREE.Vector2(-999,-999)},R:{value:120},res:{value:new THREE.Vector2(1,1)},a:{value:0}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader:`uniform sampler2D t;uniform vec2 lens;uniform float R;uniform vec2 res;uniform float a;varying vec2 vUv;
      void main(){vec2 px=vUv*res;float d=distance(px,lens);if(d>R+3.)discard;vec3 x=texture2D(t,vUv).rgb;
      float ring=smoothstep(R+3.,R,d)*smoothstep(R-3.,R,d);float inside=smoothstep(R,R-1.5,d);
      vec3 col=mix(vec3(.24,.85,.95),x,inside*(1.-ring));
      float scan=.06*step(.5,fract(px.y/3.));col+=vec3(.25,.85,.95)*scan*inside;
      gl_FragColor=vec4(col,a*max(inside,ring));}`});
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),lensMat);const quadScene=new THREE.Scene();quadScene.add(quad);
  const lensHud=$("#lensHud"),LENS_PARTS=[["البرميل",drum],["طرمبة الصرف",pump],["الموتور",motor],["السير",belt],["بلف المية",valve],["لوحة التحكم",con],["الغطا",lidPivot]];
  const ptr={x:-1,y:-1,last:-1e9,has:false},lensPos=new THREE.Vector2(-999,-999),gyro={x:0,y:0,on:false};
  addEventListener("pointermove",e=>{ptr.x=e.clientX;ptr.y=e.clientY;ptr.last=performance.now();ptr.has=true},{passive:true});
  addEventListener("pointerdown",e=>{ptr.x=e.clientX;ptr.y=e.clientY;ptr.last=performance.now();ptr.has=true},{passive:true});
  function enableGyro(){const on=()=>{gyro.on=true;addEventListener("deviceorientation",ev=>{gyro.x=Math.max(-1,Math.min(1,(ev.gamma||0)/20));gyro.y=Math.max(-1,Math.min(1,((ev.beta||45)-45)/20))},{passive:true})};
    if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"){DeviceOrientationEvent.requestPermission().then(r=>{if(r==="granted")on()}).catch(()=>{})}else on()}
  const tiltBtn=$("#tiltBtn");if(tiltBtn){if(!("DeviceOrientationEvent" in window)||!matchMedia("(hover:none)").matches)tiltBtn.hidden=true;tiltBtn.addEventListener("click",()=>{enableGyro();tiltBtn.hidden=true})}
  const center=V(0,1.6,0),BGc=new THREE.Color(BG),DARKc=new THREE.Color(0x0B1418),bgNow=new THREE.Color();
  let parX=0,parY=0,lastHud="";

  // HTML leader tags for the exploded view
  const tagsEl=$("#tags");const TAGS=[["البرميل",drum,V(0,.9,0)],["الموتور",motor,V(0,.35,0)],["السير",belt,V(-.9,.1,0)],["طرمبة الصرف",pump,V(0,.4,0)]];
  if(tagsEl) tagsEl.innerHTML=TAGS.map(([t],i)=>`<span class="tag${i===3?" hot":""}"><i></i>${t}</span>`).join("");
  const tagNodes=tagsEl?[...tagsEl.children]:[];

  // timeline
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,outC=x=>1-Math.pow(1-x,3),seg=(t,a,b)=>ease(clamp((t-a)/(b-a)));
  const LBL=V(0,3.34,1.14);
  const POSES=[[V(5.5,4.4,8.8),V(0,1.6,0)],[V(.12,4.85,2.85),LBL],[V(.08,4.6,2.55),LBL],[V(6.6,5.8,10.4),V(0,2.0,0)],[V(5.8,2.4,7.8),V(1.8,.7,2.1)],[V(2.8,2.6,8.4),V(.7,1.6,2.6)],[V(6.6,4.8,11.4),V(0,1.6,0)]];
  const cp=V(0,0,0),ct=V(0,0,0),tmp=V(0,0,0),tmp2=V(0,0,0);let MOBILE=false;
  function poseAt(t){const i=Math.min(5,Math.floor(t)),k=seg(t-i,0,1);cp.copy(POSES[i][0]).lerp(POSES[i+1][0],k);ct.copy(POSES[i][1]).lerp(POSES[i+1][1],k);cp.sub(ct).multiplyScalar(MOBILE?1.36:1.14).add(ct)}
  let lastE=-1;
  function frame(t,now){
    if(!MOBILE){const w=innerWidth,h=innerHeight,k=seg(t,.3,.9)*(1-seg(t,2.3,2.9));camera.setViewOffset(w,h,w*(.24-.1*k),0,w,h);camera.updateProjectionMatrix()}
    poseAt(t);const br=Math.sin(now/2800)*.05;camera.position.set(cp.x+br,cp.y+br*.4,cp.z);camera.lookAt(ct);
    // ch1: lid opens; closes again by ch3
    const open=seg(t,.15,.75)*(1-seg(t,2.55,3.0));lidPivot.rotation.x=-open*1.25;
    // scan, decode, lift
    const s=clamp((t-.6)/.5);scan.visible=t>.55&&t<1.15;scan.position.y=PH/2-s*PH;
    const vis=1-seg(t,2.6,3.0);
    glyphs.forEach((G,i)=>{const on=seg(t,1.0+i*.03,1.15+i*.03);G.m.material.opacity=on*Math.max(vis,t>5.5?1:0);G.gl.material.opacity=on*.5*vis;const lift=seg(t,1.4+i*.02,1.9+i*.02)*(1-seg(t,2.5,2.9));G.g.position.z=.003+lift*.05;G.g.scale.setScalar(1+lift*.15)});
    chip.material.opacity=.85*seg(t,.95,1.15);box.material.opacity=seg(t,1.25,1.45);
    vf.userData.m.opacity=seg(t,.35,.75)*(1-seg(t,2.2,2.6));const vs=1+(1-seg(t,.35,.75))*.15;vf.scale.set(vs,vs,1);
    // staggered explode 2.5→3.5, reassemble 5.4→6
    const back=seg(t,5.4,6.0);
    parts.forEach(p=>{const d=p.userData.delay;const e=outC(clamp((t-2.5-d)/(.85)))*(1-back);p.position.copy(p.userData.base).addScaledVector(p.userData.off,e)});
    const e=seg(t,2.5,3.4)*(1-back);
    cabMat.opacity=1-e*.93;toe.visible=e<.3;cabMat.depthWrite=e<.05;deckMat.opacity=1-e*.75;deckMat.depthWrite=e<.05;cab.castShadow=e<.5;cabEdge.material.opacity=e*.4;
    // focus on the pump
    const f=seg(t,3.55,4.05)*(1-seg(t,5.4,5.9));
    fadeables.forEach(p=>p.traverse(o=>{if(o.isMesh&&o.material&&!o.material.isMeshBasicMaterial){if(!o.userData.m0){o.userData.m0=o.material;o.material=o.material.clone();o.material.transparent=true}o.material.opacity=1-f*.5;o.material.envMapIntensity=1-f*.5}}));
    const pulse=.8+.2*Math.sin(now/140);M.orange.emissiveIntensity=f*.18*pulse;pumpLight.intensity=f*1.2*pulse;
    const fly=seg(t,4.4,5.0)*(1-back);pump.position.lerp(PUMP_FRONT,fly);pump.scale.setScalar(1+fly*.6);pump.rotation.y=fly*((now/1600)%(Math.PI*2));
    pumpLight.position.copy(pump.position).add(tmp.set(.3,.5,.8));washer.localToWorld(pumpLight.position);
    // shadows only re-render while things move
    // pointer / gyro parallax, strongest in the hero
    const hero=1-seg(t,.6,1.2);let tx=0,ty=0;
    if(gyro.on){tx=gyro.x;ty=gyro.y}else if(ptr.has){tx=ptr.x/innerWidth*2-1;ty=ptr.y/innerHeight*2-1}
    parX+=(tx-parX)*.06;parY+=(ty-parY)*.06;washer.rotation.y=RM?0:parX*.32*hero;washer.rotation.x=RM?0:parY*.05*hero;
    key.position.set(4+parX*3,7,5-parY*2);
    // dark contrast moment while the washer is open (chapters 3–4)
    const dk=seg(t,2.55,3.05)*(1-seg(t,4.55,5.05));
    bgNow.copy(BGc).lerp(DARKc,dk);scene.background=bgNow;scene.fog.color.copy(bgNow);
    document.documentElement.classList.toggle("dark-moment",dk>.5);
    renderer.shadowMap.autoUpdate=t<6&&!PHONE;lastE=e;
    renderer.render(scene,camera);
    // Read-Lens pass (hero only)
    const la=(1-seg(t,.5,.9));lensMat.uniforms.a.value=la;
    if(la>.01){const w=innerWidth,h=innerHeight,now2=performance.now();
      center.set(0,1.7,0);washer.localToWorld(center);center.project(camera);const cx=(center.x*.5+.5)*w,cy=(-center.y*.5+.5)*h;
      let gx,gy;if(ptr.has&&now2-ptr.last<1400){gx=ptr.x;gy=ptr.y}else{const k=now2/1000;gx=cx+Math.sin(k*.9)*w*(MOBILE?.18:.09);gy=cy+Math.sin(k*1.3)*h*.12}
      if(RM){gx=cx;gy=cy}
      if(lensPos.x<-900)lensPos.set(gx,gy);else lensPos.set(lensPos.x+(gx-lensPos.x)*.18,lensPos.y+(gy-lensPos.y)*.18);
      const pr=renderer.getPixelRatio();const bw=Math.max(2,Math.floor(w*pr*.5)),bh=Math.max(2,Math.floor(h*pr*.5));if(rt.width!==bw||rt.height!==bh)rt.setSize(bw,bh);
      const hid=[cab,toe,cabEdge,label,blobMesh,floorMesh];const vis0=hid.map(o=>o.visible);hid.forEach(o=>o.visible=false);
      scene.overrideMaterial=xrayMat;const bg0=scene.background;scene.background=DARKc;renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,camera);
      renderer.setRenderTarget(null);scene.overrideMaterial=null;scene.background=bg0;hid.forEach((o,i)=>o.visible=vis0[i]);
      const R=MOBILE?92:124;lensMat.uniforms.R.value=R;lensMat.uniforms.res.value.set(w,h);lensMat.uniforms.lens.value.set(lensPos.x,h-lensPos.y);
      const ac=renderer.autoClear;renderer.autoClear=false;renderer.render(quadScene,quadCam);renderer.autoClear=ac;
      if(lensHud){const found=[];LENS_PARTS.forEach(([n,o])=>{o.getWorldPosition(tmp2);tmp2.project(camera);const x=(tmp2.x*.5+.5)*w,y=(-tmp2.y*.5+.5)*h;if(Math.hypot(x-lensPos.x,y-lensPos.y)<R)found.push(n)});
        const txt=found.length?found.map(n=>`<li${n==="طرمبة الصرف"?' class="hot"':""}>✓ ${n}</li>`).join(""):"<li>حرّك على الغسالة</li>";
        if(txt!==lastHud){lensHud.querySelector("ul").innerHTML=txt;lastHud=txt}
        lensHud.style.opacity=la.toFixed(2);lensHud.style.transform=`translate(${Math.min(w-200,lensPos.x+R+14).toFixed(0)}px,${(lensPos.y-R*.6).toFixed(0)}px)`}
    } else if(lensHud) lensHud.style.opacity="0";
    // leader tags
    const tv=seg(t,3.0,3.4)*(1-seg(t,4.8,5.2));
    if(tagNodes.length){const w=innerWidth,h=innerHeight;TAGS.forEach(([n,o,off],i)=>{const el=tagNodes[i];const op=i===3?Math.max(tv,0):tv*(1-f*.7);el.style.opacity=op.toFixed(3);if(op<.01)return;
      o.getWorldPosition(tmp2);tmp2.add(off);tmp2.project(camera);const x=(tmp2.x*.5+.5)*w,y=(-tmp2.y*.5+.5)*h;el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`})}
  }
  function size(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;MOBILE=w<900;camera.fov=MOBILE?38:30;
    camera.setViewOffset(w,h,MOBILE?0:w*.24,MOBILE?h*.18:0,w,h);camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true}
  addEventListener("resize",()=>{size();dirty=true});size();

  const chaps=$$("[data-chap]"),dots=$$("#railnav a"),rail=$("#railnav");
  function target(){let t=0;for(let i=0;i<chaps.length;i++){const r=chaps[i].getBoundingClientRect();if(r.top<=1)t=i+Math.min(1,-r.top/Math.max(1,r.height))}return Math.max(0,Math.min(6,t))}
  dots.forEach(d=>d.addEventListener("click",ev=>{ev.preventDefault();const c=chaps[+d.dataset.to];if(c)scrollTo({top:c.offsetTop,behavior:RM?"auto":"smooth"})}));
  let tCur=target(),tGoal=tCur,dirty=true,lbl={brand:"Northgate",model:"NGT5000DW1",serial:"C91234567",type:"Washer"};
  addEventListener("scroll",()=>{tGoal=target()},{passive:true});
  let slow=0,lastNow=0;
  const hud=$("#scanHud"),hudBar=$("#scanHud i"),hudNum=$("#hudNum"),hudName=$("#hudName");let hudIdx=-1;
  const HUD_NAMES=["الجهاز","الملصق","بيقرا","جوه الجهاز","القطعة","السعر الصح"];
  function loop(now){
    const d=tGoal-tCur;tCur=RM?tGoal:tCur+d*.1;if(Math.abs(d)<.0005)tCur=tGoal;
    if(document.documentElement.classList.contains("appv")){requestAnimationFrame(loop);return}
    if((tCur<6||Math.abs(d)>.0005||dirty)&&!document.hidden){frame(tCur,RM?0:now);dirty=false;
      const dt=now-lastNow;lastNow=now;if(dt>24){slow++;if(slow>60&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);size();slow=0}}else slow=Math.max(0,slow-1)}
    cv.style.opacity=String(1-.55*seg(tCur,5.2,6));
    const idx=Math.min(5,Math.round(tCur));dots.forEach((x,i)=>x.classList.toggle("on",i===idx));rail&&rail.classList.toggle("off",tCur>5.6);
    if(hud){hud.classList.toggle("off",tCur>5.6);hudBar.style.transform=`scaleX(${(tCur/6).toFixed(3)})`;if(idx!==hudIdx){hudIdx=idx;hudNum.textContent=String(idx+1).padStart(2,"0");hudName.textContent=HUD_NAMES[idx]}}
    requestAnimationFrame(loop);
  }
  function setLabel(a){if(a)lbl={brand:a.brand||"",model:(a.model||"").slice(0,16)||"—",serial:a.serial||"",type:a.type||"Washer"};drawLabel(lbl.brand||"Your brand",lbl.model,lbl.serial,lbl.type);buildGlyphs(lbl.model);dirty=true}
  setLabel(null);renderer.shadowMap.needsUpdate=true;requestAnimationFrame(loop);
  return {setLabel,wake(){dirty=true;size();tGoal=target();tCur=tGoal}};
})();