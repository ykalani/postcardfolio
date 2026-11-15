(() => {
  const canvas=document.querySelector('#landscape'),ctx=canvas.getContext('2d',{alpha:false});
  const motion=document.querySelector('#motion'),air=motion.getContext('2d');
  const W=1600,H=1000,source=document.createElement('canvas');source.width=W;source.height=H;
  const sample=source.getContext('2d',{willReadFrequently:true});
  const painting=document.createElement('canvas');painting.width=W;painting.height=H;
  const p=painting.getContext('2d',{alpha:false});
  let pixels,skyline=new Uint16Array(W),ready=false,seed=4176,clock=0,last=0,scale=1,ox=0,oy=0;
  const rand=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const range=(a,b)=>a+rand()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function pigment(x,y){
    x=clamp(Math.round(x),0,W-1);y=clamp(Math.round(y),0,H-1);
    const i=(y*W+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
    const sky=y<skyline[x];
    const leaf=!sky&&(g>b*1.08&&g>r*.91||y>720);
    const l=r*.3+g*.55+b*.15;
    // Reduce camera saturation, retaining the actual granite strata and tree shapes.
    return {r:clamp(r*.64+l*.22+28,0,255),g:clamp(g*.66+l*.19+25,0,255),b:clamp(b*.57+l*.22+25,0,255),sky,leaf,l};
  }
  function css(c,j=0,a=1){return `rgba(${Math.round(c.r+j)},${Math.round(c.g+j)},${Math.round(c.b+j)},${a})`;}
  function stroke(c,x,y,length,width,col,angle,opacity=.7,filaments=3){
    const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx;
    c.lineCap='round';
    for(let k=0;k<filaments;k++){
      const off=(k/(filaments-1)-.5)*width,cut=range(-.15,.15)*length,bend=range(-.8,.8);
      c.strokeStyle=css(col,range(-9,9),opacity*range(.45,.95));c.lineWidth=width/filaments*range(.75,1.3);
      c.beginPath();c.moveTo(x+nx*off+dx*cut,y+ny*off+dy*cut);
      c.quadraticCurveTo(x+dx*length*.5+nx*(off+bend),y+dy*length*.5+ny*(off+bend),x+dx*length*range(.8,1.2)+nx*off,y+dy*length*range(.8,1.2)+ny*off);c.stroke();
    }
  }
  function paintMark(x,y,size=1,c=p){
    const col=pigment(x,y);
    if(col.sky)return;
    const angle=col.leaf?range(-2.1,-.8):Math.PI*.5+range(-.18,.18);
    stroke(c,x,y,range(col.leaf?2:4,col.leaf?7:18)*size,range(1.5,5)*size,col,angle,.85,size>2?4:3);
  }
  function sky(c,t){
    const g=c.createLinearGradient(0,0,0,650);g.addColorStop(0,'#7aaac3');g.addColorStop(.6,'#b6cbd0');g.addColorStop(1,'#e3deca');c.fillStyle=g;c.fillRect(0,0,W,H);
    for(let i=0;i<1900;i++){
      const x=range(-100,W),y=range(0,640),col={r:214,g:225,b:221};
      stroke(c,x,y,range(30,140),range(2,9),col,-.035,.08,3);
    }
  }
  async function buildPainting(){
    seed=4176;sky(p,0);
    // Successive coats follow the real landforms. No source photograph is drawn onto the visible canvas.
    for(const [step,size] of [[13,3.5],[6,1.8],[3.6,1]]){
      for(let y=100;y<H;y+=step){
        for(let x=0;x<W;x+=step)paintMark(x+range(-step*.5,step*.5),y+range(-step*.5,step*.5),size);
      }
      await new Promise(requestAnimationFrame);
    }
    for(let i=0;i<85000;i++){
      const x=range(0,W),y=range(0,H);p.fillStyle=i%2?'rgba(255,248,222,.075)':'rgba(38,51,43,.045)';p.fillRect(x,y,range(.3,1),range(.3,1));
    }
    for(let i=0;i<2300;i++){
      const x=range(852,925),y=range(425,485),col=pigment(x,y);
      if(!col.sky&&!col.leaf&&col.l>155){col.r+=10;col.g+=8;col.b+=8;stroke(p,x,y,range(2,8),range(.6,1.7),col,1.57,.8,3);}
    }
    ready=true;fit();document.documentElement.dataset.sceneReady='true';
  }
  function fit(){
    const dpr=Math.min(devicePixelRatio||1,2),w=innerWidth,h=innerHeight;
    scale=Math.max(w/W,h/H);ox=w*.5-W*scale*(w<650?.535:.5);oy=(h-H*scale)*.5;
    for(const c of [canvas,motion]){c.width=w*dpr;c.height=h*dpr;c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}
    ctx.fillStyle='#b0c7ca';ctx.fillRect(0,0,w,h);
    if(ready){
      ctx.drawImage(painting,ox,oy,W*scale,H*scale);
      air.save();air.translate(ox,oy);air.scale(scale,scale);
      driftingClouds(air,clock);waterfall(air,clock);foregroundPine(air,clock,0);air.restore();
    }
  }
  const cloudSprites=[];
  function cacheClouds(){
    const banks=[{x:620,y:72,w:580,h:145,speed:2.6},{x:55,y:155,w:340,h:100,speed:1.5},{x:1240,y:190,w:420,h:110,speed:1.9}];
    for(const bank of banks){
      const sprite=document.createElement('canvas');sprite.width=bank.w;sprite.height=bank.h;
      const c=sprite.getContext('2d');
      for(let i=0;i<4400;i++){
        const x=range(0,bank.w),y=range(0,bank.h),u=x/bank.w,v=y/bank.h;
        const lobes=Math.max(1-((u-.25)/.22)**2-((v-.53)/.3)**2,1-((u-.49)/.25)**2-((v-.39)/.34)**2,1-((u-.73)/.2)**2-((v-.57)/.24)**2);
        if(lobes<range(-.12,.1))continue;
        const col=v>.67?{r:193,g:206,b:207}:{r:248,g:241,b:221};
        stroke(c,x,y,range(5,28),range(1.5,4),col,-.04,range(.15,.4),3);
      }
      cloudSprites.push({...bank,sprite});
    }
  }
  function driftingClouds(c,t){
    c.save();c.beginPath();c.moveTo(0,0);c.lineTo(W,0);
    for(let x=W-1;x>=0;x-=4)c.lineTo(x,skyline[x]-6);
    c.closePath();c.clip();
    for(const cloud of cloudSprites){
      const x=(cloud.x+t*cloud.speed+510)%(W+1020)-510;
      c.globalAlpha=.88;c.drawImage(cloud.sprite,x,cloud.y);
    }
    c.restore();
  }
  function waterfall(c,t){
    // Bridalveil Fall, at its actual position beneath Cathedral Rocks.
    const top=462,bottom=542;
    c.save();
    for(let i=0;i<175;i++){
      const phase=(i/175+t*.19)%1,y=top+phase*(bottom-top),spread=.7+phase*2.4;
      const x=1040+Math.sin(phase*5+t*.6)*spread+phase*2;
      c.strokeStyle=`rgba(233,237,219,${.4+.45*Math.sin(phase*Math.PI)})`;c.lineWidth=.5+(i%4)*.35;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.sin(t+i)*.6,y+3+(i%5));c.stroke();
    }
    // Mist breathes at the base of the falls.
    const mist=c.createRadialGradient(1043,542,0,1043,542,9+Math.sin(t*.6)*2);mist.addColorStop(0,'rgba(240,241,223,.25)');mist.addColorStop(1,'rgba(232,234,218,0)');c.fillStyle=mist;c.fillRect(1025,526,38,36);c.restore();
  }
  const pineLimbs=[];
  let pineTrunk;
  function cachePine(){
    pineTrunk=document.createElement('canvas');pineTrunk.width=90;pineTrunk.height=820;
    const c=pineTrunk.getContext('2d');
    c.fillStyle='#394b3c';c.beginPath();c.moveTo(34,820);c.bezierCurveTo(42,600,48,300,47,0);c.bezierCurveTo(56,300,59,600,67,820);c.closePath();c.fill();
    for(let i=0;i<200;i++)stroke(c,range(40,64),range(80,820),range(10,95),range(.5,2),{r:110,g:107,b:78},-1.56,.42,2);
    for(let i=0;i<25;i++){
      const side=i%2?1:-1,height=15+i*29,length=(12+i*5.8)*range(.8,1.1),sprite=document.createElement('canvas');sprite.width=240;sprite.height=105;
      const c=sprite.getContext('2d');c.strokeStyle='#334c3c';c.lineWidth=2.1;c.beginPath();c.moveTo(8,79);c.bezierCurveTo(length*.3,65,length*.65,83,length,54);c.stroke();
      for(let j=0;j<190;j++){
        const x=range(10,length),u=x/length,y=75-u*13+Math.sin(u*9)*4;
        stroke(c,x,y+range(-8,8),range(4,16),range(1,3),{r:45+range(0,35),g:68+range(0,32),b:46+range(0,22)},range(-2.7,-.3),.75,3);
      }
      pineLimbs.push({sprite,side,y:height,length,phase:range(0,1)});
    }
  }
  function foregroundPine(c,t,gust){
    if(!pineTrunk)return;
    c.save();c.translate(innerWidth<650?650:136,1005);if(innerWidth<650)c.scale(.65,.65);c.drawImage(pineTrunk,-47,-820);
    for(const limb of pineLimbs){
      const wind=(Math.sin(t*.85)+.3*Math.sin(t*1.7)+gust)*.008*(1-limb.y/1100);
      c.save();c.translate(0,-820+limb.y);c.scale(limb.side,1);c.rotate(wind*limb.side);c.drawImage(limb.sprite,-8,-79);c.restore();
    }
    c.restore();
  }
  function animate(now){
    requestAnimationFrame(animate);
    if(!ready||!pixels||document.hidden||window.breezePaused||now-last<40)return;
    const dt=Math.min((now-last)/1000,.08);last=now;clock+=dt;
    air.clearRect(0,0,innerWidth,innerHeight);air.save();air.translate(ox,oy);air.scale(scale,scale);
    const gust=Math.sin(clock*.7)*.5+Math.sin(clock*1.9)*.2;
    driftingClouds(air,clock);
    waterfall(air,clock);
    foregroundPine(air,clock,gust);
    air.restore();
  }
  const img=new Image();img.decoding='async';img.src='assets/yosemite-guide.jpg';
  img.onload=async()=>{
    sample.drawImage(img,0,0,W,H);pixels=sample.getImageData(0,0,W,H).data;
    for(let x=0;x<W;x++){
      let y=0;
      for(;y<650;y++){const i=(y*W+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];if(!(b>160&&b>r*1.3&&b>g*1.04&&b-r>45))break;}
      skyline[x]=y;
    }
    cacheClouds();cachePine();
    const cached=new Image();cached.src='assets/yosemite-painting.webp';
    cached.onload=()=>{p.drawImage(cached,0,0,W,H);ready=true;fit();document.documentElement.dataset.sceneReady='true';};
    cached.onerror=()=>buildPainting();
  };
  img.onerror=()=>{
    const cached=new Image();cached.src='assets/yosemite-painting.webp';
    cached.onload=()=>{p.drawImage(cached,0,0,W,H);ready=true;fit();document.documentElement.dataset.sceneReady='true';};
    cached.onerror=()=>{document.documentElement.dataset.sceneReady='error';};
  };
  window.paintLandscape=buildPainting;
  window.exportPainting=()=>painting.toDataURL('image/webp',.94);
  let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(fit,100);});
  addEventListener('visibilitychange',()=>{last=performance.now();});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  window.breezePaused=reduce.matches;reduce.addEventListener('change',e=>{window.breezePaused=e.matches;if(e.matches)fit();});
  fit();requestAnimationFrame(animate);
})();
