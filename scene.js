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
    cacheCanopy();ready=true;fit();document.documentElement.dataset.sceneReady='true';
  }
  function fit(){
    const dpr=Math.min(devicePixelRatio||1,2),w=innerWidth,h=document.querySelector('main').clientHeight;
    scale=Math.max(w/W,h/H);ox=w*.5-W*scale*(w<650?.563:.5);oy=(h-H*scale)*.5;
    for(const c of [canvas,motion]){c.width=w*dpr;c.height=h*dpr;c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}
    ctx.fillStyle='#b0c7ca';ctx.fillRect(0,0,w,h);
    if(ready){
      ctx.drawImage(painting,ox,oy,W*scale,H*scale);
      air.save();air.translate(ox,oy);air.scale(scale,scale);
      driftingClouds(air,clock);waterfall(air,clock);rustlingTrees(air,clock);birds(air,clock);air.restore();
    }
  }
  const cloudSprites=[];
  function cacheClouds(){
    const banks=[{x:620,y:72,w:580,h:145,speed:10.4},{x:55,y:155,w:340,h:100,speed:6.5},{x:1240,y:190,w:420,h:110,speed:8.1}];
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
  const fallMist=[];
  function cacheWaterfall(){
    const savedSeed=seed;seed=4910;
    // Chalk-like spray keeps the same dry pigment edges as the landscape.
    for(let n=0;n<4;n++){
      const sprite=document.createElement('canvas');sprite.width=54;sprite.height=38;
      const c=sprite.getContext('2d');
      for(let i=0;i<190;i++){
        const x=range(3,47),y=range(3,33),distance=((x-26)/22)**2+((y-19)/14)**2;
        if(distance>range(.4,1))continue;
        stroke(c,x,y,range(1,7),range(.3,1.3),{r:224+n*3,g:231+n*2,b:217+n*3},range(-.3,.15),.085,2);
      }
      fallMist.push(sprite);
    }
    seed=savedSeed;
  }
  function fallPosition(q,t){
    // The lip is fixed. The falling sheet increasingly yields to the valley wind.
    return 1040+q*q*(8.5+Math.sin(t*.48)*3.2)+Math.sin(q*6-t*.8)*q*.9;
  }
  function fallingVeil(c,t){
    c.lineCap='round';
    // Thin, overlapping washes open into an asymmetric, wind-blown veil.
    for(let layer=0;layer<7;layer++){
      const offset=(layer-3)*.27,finish=.83+(layer%3)*.055;
      const wash=c.createLinearGradient(0,462,0,565);
      wash.addColorStop(0,'rgba(248,246,224,.19)');wash.addColorStop(.32,'rgba(236,242,225,.16)');wash.addColorStop(.73,'rgba(224,236,221,.08)');wash.addColorStop(1,'rgba(218,232,218,0)');
      c.fillStyle=wash;c.beginPath();
      for(let side=-1;side<=1;side+=2){
        for(let k=0;k<=35;k++){
          const q=side===-1?k/35*finish:(35-k)/35*finish;
          const width=1.4+Math.sin(q*1.8)*3.5+q**3*8;
          const edge=Math.sin(q*38+layer*1.7-t*.5)*q*.7;
          const x=fallPosition(q,t)+(offset+side*.55)*width+edge,y=462+q*99;
          if(side===-1&&k===0)c.moveTo(x,y);else c.lineTo(x,y);
        }
      }
      c.closePath();c.fill();
    }
    for(let i=0;i<35;i++){
      const side=(i/34-.5),end=.78+(i%6)*.036;
      for(let q=(i%7)*.008;q<end;q+=.033){
        const v=Math.min(end,q+.04),width=2.2+q*4.5+q**4*13;
        const x=fallPosition(q,t)+side*width+Math.sin(q*29+i*1.8+t*.7)*q*.35;
        const xx=fallPosition(v,t)+side*(2.2+v*4.5+v**4*13);
        const alpha=(.26+(1-Math.abs(side)*2)*.3)*(1-q)**.9;
        c.strokeStyle=i%4===0?`rgba(178,204,201,${alpha*.65})`:`rgba(240,243,224,${alpha})`;
        c.lineWidth=i%3===0?.65:.35;c.beginPath();c.moveTo(x,462+q*99);c.lineTo(xx,462+v*99);c.stroke();
      }
    }
    c.strokeStyle='rgba(250,248,227,.86)';c.lineWidth=1.5;c.beginPath();c.moveTo(1039.6,462);c.quadraticCurveTo(1039.3,468,1040,474);c.stroke();
  }
  function fallingRibbons(c,t){
    c.lineCap='butt';
    for(let i=0;i<115;i++){
      const age=(i*.61803398875+t*(.34+(i%5)*.011))%1,q=age**1.65;
      const side=Math.sin(i*17.31),length=.025+(i%7)*.006,end=Math.min(1.02,q+length);
      c.beginPath();
      for(let v=q;v<=end;v+=.008){
        const width=1.1+v*4+v**4*11;
        const x=fallPosition(v,t)+side*width*.5+Math.sin(v*38+i)*v*.19,y=462+v*99;
        if(v===q)c.moveTo(x,y);else c.lineTo(x,y);
      }
      const edgeFade=Math.min(1,(1.02-q)*3.4);
      c.strokeStyle=i%5===0?`rgba(185,210,207,${edgeFade*.55})`:`rgba(249,247,227,${edgeFade*(.3+(i%4)*.11)})`;
      c.lineWidth=.25+(i%3)*.19;c.stroke();
    }
  }
  function fallingMist(c,t){
    if(!fallMist.length)return;
    // Spray is born at the foot, then rises sideways and thins into the forest.
    for(let i=0;i<8;i++){
      const age=(t*.11+i/8)%1,wind=1+Math.sin(t*.48)*.5;
      const x=fallPosition(.97,t)+age*wind*13+Math.sin(i*2.4)*age*5,y=559-age*8;
      const size=.25+age*.57;
      c.save();c.globalAlpha=Math.sin(age*Math.PI)*.63;c.translate(x,y);c.scale(size,size);c.rotate(-age*.15);c.drawImage(fallMist[i%4],-27,-19);c.restore();
    }
    // Fine spray follows the same wind; no randomly respawned particles.
    c.fillStyle='rgba(235,242,225,.22)';
    for(let i=0;i<30;i++){
      const age=(t*.22+i*.618)%1,x=fallPosition(.97,t)+Math.sin(i*8)*age*7+age*7,y=554+age*13;
      c.globalAlpha=(1-age)*.45;c.fillRect(x,y,.4,.9);
    }
    c.globalAlpha=1;
  }
  function waterfall(c,t){
    c.save();
    fallingVeil(c,t);
    fallingRibbons(c,t);
    fallingMist(c,t);
    c.restore();
  }
  const canopy=[];
  function cacheCanopy(){
    canopy.length=0;
    if(!pixels)return;
    const paint=p.getImageData(0,0,W,H).data;
    // Lift actual painted foliage out of the terrain. Its texture and palette stay identical.
    for(let y=150;y<H;y+=95)for(let x=0;x<W;x+=95){
      if(y<625&&x>160)continue;
      const w=Math.min(115,W-x),h=Math.min(115,H-y),sprite=document.createElement('canvas');
      sprite.width=w;sprite.height=h;
      const c=sprite.getContext('2d'),image=c.createImageData(w,h);let visible=0;
      for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
        const at=((y+yy)*W+x+xx)*4,local=(yy*w+xx)*4,r=pixels[at],g=pixels[at+1],b=pixels[at+2];
        if(g<b*.96||g<r*.88||r+g+b>535||y+yy<skyline[x+xx]+6)continue;
        const edge=Math.min(1,xx/12,yy/12,(w-xx)/12,(h-yy)/12);
        image.data[local]=paint[at];image.data[local+1]=paint[at+1];image.data[local+2]=paint[at+2];image.data[local+3]=Math.round(220*edge);visible++;
      }
      if(visible<90)continue;
      c.putImageData(image,0,0);
      canopy.push({sprite,x,y,depth:(y/H)**2,phase:x*.005+y*.002,pine:x<170});
    }
  }
  function rustlingTrees(c,t){
    const gust=Math.sin(t*.8)*.65+Math.sin(t*1.7)*.25;
    for(const patch of canopy){
      const breeze=Math.sin(t*2.1+patch.phase)*.45+gust;
      const flex=patch.pine?1.7+(1-patch.y/H)*2:patch.depth*2.2;
      c.drawImage(patch.sprite,patch.x+breeze*flex,patch.y+Math.sin(t*1.3+patch.phase)*flex*.24);
    }
  }
  function birds(c,t){
    // A small group crosses the open sky together, alternately flapping and gliding.
    const flight=(t*21+860)%(W+440)-220;
    for(let i=0;i<3;i++){
      const x=flight+i*31,y=270+i*16+Math.sin(t*.25+i*.7)*17;
      if(x<0||x>=W||y>skyline[Math.floor(x)]-15)continue;
      const glide=Math.sin(t*.8+i)>.35,flap=glide?-1.4:Math.sin(t*5.2+i*.65)*4.5,size=i===0?7:5.5;
      c.strokeStyle='rgba(39,56,57,.88)';c.lineWidth=i===0?1.5:1.2;c.lineCap='round';
      c.beginPath();c.moveTo(x-size,y+flap);c.quadraticCurveTo(x-size*.45,y-2,x,y);c.quadraticCurveTo(x+size*.45,y-2,x+size,y+flap);c.stroke();
      c.fillStyle='#344b49';c.beginPath();c.ellipse(x,y,.9,1.8,-.35,0,Math.PI*2);c.fill();
    }
  }
  function animate(now){
    requestAnimationFrame(animate);
    if(!ready||!pixels||document.hidden||window.breezePaused||now-last<40)return;
    const dt=Math.min((now-last)/1000,.08);last=now;clock+=dt;
    air.clearRect(0,0,innerWidth,motion.height/(Math.min(devicePixelRatio||1,2)));air.save();air.translate(ox,oy);air.scale(scale,scale);
    driftingClouds(air,clock);
    waterfall(air,clock);
    rustlingTrees(air,clock);birds(air,clock);
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
    cacheClouds();cacheWaterfall();
    const cached=new Image();cached.src='assets/yosemite-painting.webp';
    cached.onload=()=>{p.drawImage(cached,0,0,W,H);cacheCanopy();ready=true;fit();document.documentElement.dataset.sceneReady='true';};
    cached.onerror=()=>buildPainting();
  };
  img.onerror=()=>{
    const cached=new Image();cached.src='assets/yosemite-painting.webp';
    cached.onload=()=>{p.drawImage(cached,0,0,W,H);cacheCanopy();ready=true;fit();document.documentElement.dataset.sceneReady='true';};
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
