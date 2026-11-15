(() => {
  const canvas=document.querySelector('#landscape'),ctx=canvas.getContext('2d',{alpha:false});
  const motion=document.querySelector('#motion'),air=motion.getContext('2d');
  const W=1600,H=1000,source=document.createElement('canvas');source.width=W;source.height=H;
  let sample;
  const painting=document.createElement('canvas');painting.width=W;painting.height=H;
  const p=painting.getContext('2d',{alpha:false});
  let pixels,skyline=new Uint16Array(W),ready=false,seed=4176,clock=0,last=0,liveReady=false,scale=1,ox=0,oy=0;
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
  function refineCliffs(){
    // Follow the guide's actual light planes and joints; keep distant rock softer.
    const luminance=(x,y)=>{
      const at=(clamp(y,0,H-1)*W+clamp(x,0,W-1))*4;
      return pixels[at]*.3+pixels[at+1]*.55+pixels[at+2]*.15;
    };
    for(let y=130;y<650;y+=2)for(let x=2;x<W-2;x+=2){
      const col=pigment(x,y);
      if(col.sky||col.leaf||y<skyline[x]+2)continue;
      const depth=x>820&&x<1020?.45:1;
      const local=(luminance(x-4,y)+luminance(x+4,y))*.5;
      const definition=clamp(((col.l-142)*.16+(col.l-local)*.32)*depth,-15,17);
      col.r+=definition;col.g+=definition;col.b+=definition*.9;
      stroke(p,x,y,range(2.5,7),range(.65,1.7),col,1.53+range(-.1,.1),.5,2);
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
    refineCliffs();cacheCanopy();ready=true;fit();document.documentElement.dataset.sceneReady='true';
  }
  function drawSprite(c,sprite,x,y,w=sprite.width,h=sprite.height){
    if(sprite.image)c.drawImage(sprite.image,...sprite.rect,x,y,w,h);
    else c.drawImage(sprite,x,y,w,h);
  }
  function fit(){
    const dpr=Math.min(devicePixelRatio||1,2),w=innerWidth,h=document.querySelector('main').clientHeight;
    scale=Math.max(w/W,h/H);ox=w*.5-W*scale*(w<650?.563:.5);oy=(h-H*scale)*.5;
    for(const c of [canvas,motion]){
      if(c.width!==Math.round(w*dpr))c.width=Math.round(w*dpr);
      if(c.height!==Math.round(h*dpr))c.height=Math.round(h*dpr);
      c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
    }
    air.clearRect(0,0,w,h);
    ctx.fillStyle='#b0c7ca';ctx.fillRect(0,0,w,h);
    if(ready){
      ctx.drawImage(painting,ox,oy,W*scale,H*scale);
      if(foreground)ctx.drawImage(foreground,ox,oy,W*scale,H*scale);
      if(liveReady){air.save();air.translate(ox,oy);air.scale(scale,scale);
      driftingClouds(air,clock);waterfall(air,clock);rustlingTrees(air,clock);birds(air,clock);air.restore();}
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
      // Granulated pigment and sparse paper breaks remain fixed as the bank drifts.
      const texture=c.getImageData(0,0,sprite.width,sprite.height);
      for(let k=0;k<texture.data.length;k+=4){
        if(texture.data[k+3]<8)continue;
        const grain=(rand()-.5)*18;
        for(let channel=0;channel<3;channel++)texture.data[k+channel]=clamp(texture.data[k+channel]+grain,0,255);
        if(rand()<.045)texture.data[k+3]*=.5;
      }
      c.putImageData(texture,0,0);
      cloudSprites.push({...bank,sprite});
    }
  }
  function driftingClouds(c,t){
    c.save();c.beginPath();c.moveTo(0,0);c.lineTo(W,0);
    for(let x=W-1;x>=0;x-=4)c.lineTo(x,skyline[x]-6);
    c.closePath();c.clip();
    for(const cloud of cloudSprites){
      const x=(cloud.x+t*cloud.speed+510)%(W+1020)-510;
      c.globalAlpha=.88;drawSprite(c,cloud.sprite,x,cloud.y);
    }
    c.restore();
  }
  const fallMist=[],fallTop=462,fallBase=524,fallHeight=fallBase-fallTop;
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
      const wash=c.createLinearGradient(0,fallTop,0,fallBase);
      wash.addColorStop(0,'rgba(248,246,224,.19)');wash.addColorStop(.32,'rgba(236,242,225,.16)');wash.addColorStop(.73,'rgba(224,236,221,.08)');wash.addColorStop(1,'rgba(218,232,218,0)');
      c.fillStyle=wash;c.beginPath();
      for(let side=-1;side<=1;side+=2){
        for(let k=0;k<=35;k++){
          const q=side===-1?k/35*finish:(35-k)/35*finish;
          const width=1.4+Math.sin(q*1.8)*3.5+q**3*8;
          const edge=Math.sin(q*38+layer*1.7-t*.5)*q*.7;
          const x=fallPosition(q,t)+(offset+side*.55)*width+edge,y=fallTop+q*fallHeight;
          if(side===-1&&k===0)c.moveTo(x,y);else c.lineTo(x,y);
        }
      }
      c.closePath();c.fill();
    }
    for(let i=0;i<35;i++){
      const side=(i/34-.5),start=(i%7)*.008,end=.78+(i%6)*.036;
      // Batch adjacent bristle segments into six tonal bands instead of hundreds of strokes.
      for(let band=0;band<6;band++){
        const from=Math.max(start,end*band/6),to=end*(band+1)/6;if(from>=to)continue;
        const alpha=(.26+(1-Math.abs(side)*2)*.3)*(1-(from+to)/2)**.9;
        c.strokeStyle=i%4===0?`rgba(178,204,201,${alpha*.65})`:`rgba(240,243,224,${alpha})`;
        c.lineWidth=i%3===0?.65:.35;c.beginPath();
        for(let q=from;q<=to+.032;q+=.033){
          const v=Math.min(to,q),width=2.2+v*4.5+v**4*13;
          const x=fallPosition(v,t)+side*width+Math.sin(v*29+i*1.8+t*.7)*v*.35;
          if(q===from)c.moveTo(x,fallTop+v*fallHeight);else c.lineTo(x,fallTop+v*fallHeight);
        }
        c.stroke();
      }
    }
    c.strokeStyle='rgba(250,248,227,.86)';c.lineWidth=1.5;c.beginPath();c.moveTo(1039.6,462);c.quadraticCurveTo(1039.3,468,1040,474);c.stroke();
  }
  function fallingRibbons(c,t){
    c.lineCap='butt';
    for(let i=0;i<115;i++){
      const age=(i*.61803398875+t*(.34+(i%5)*.011))%1,q=age**1.65;
      const side=Math.sin(i*17.31),length=.025+(i%7)*.006,end=Math.min(1,q+length);
      c.beginPath();
      for(let v=q;v<=end;v+=.008){
        const width=1.1+v*4+v**4*11;
        const x=fallPosition(v,t)+side*width*.5+Math.sin(v*38+i)*v*.19,y=fallTop+v*fallHeight;
        if(v===q)c.moveTo(x,y);else c.lineTo(x,y);
      }
      const edgeFade=Math.min(1,(1-q)*3.4);
      c.strokeStyle=i%5===0?`rgba(185,210,207,${edgeFade*.55})`:`rgba(249,247,227,${edgeFade*(.3+(i%4)*.11)})`;
      c.lineWidth=.25+(i%3)*.19;c.stroke();
    }
  }
  function fallingMist(c,t){
    if(!fallMist.length)return;
    // Spray rises from the cliff base and stays above the foreground forest.
    for(let i=0;i<8;i++){
      const age=(t*.11+i/8)%1,wind=1+Math.sin(t*.48)*.5;
      const x=fallPosition(.97,t)+age*wind*13+Math.sin(i*2.4)*age*5,y=fallBase-2-age*8;
      const size=.25+age*.57;
      c.save();c.globalAlpha=Math.sin(age*Math.PI)*.63;c.translate(x,y);c.scale(size,size);c.rotate(-age*.15);drawSprite(c,fallMist[i%4],-27,-19);c.restore();
    }
    // Fine spray follows the same wind; no randomly respawned particles.
    c.fillStyle='rgba(235,242,225,.22)';
    for(let i=0;i<30;i++){
      const age=(t*.22+i*.618)%1,x=fallPosition(.97,t)+Math.sin(i*8)*age*7+age*7,y=fallBase-3-age*7;
      c.globalAlpha=(1-age)*.45;c.fillRect(x,y,.4,.9);
    }
    c.globalAlpha=1;
  }
  function waterfall(c,t){
    c.save();
    c.beginPath();c.rect(0,0,W,fallBase);c.clip();
    fallingVeil(c,t);
    fallingRibbons(c,t);
    fallingMist(c,t);
    c.restore();
  }
  const canopy=[],looseLeaves=[],leafSprites=[];
  let foreground;
  function foregroundDepth(x,y){
    const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
    const pine=(1-smooth(125,285,x))*smooth(110,300,y);
    const right=smooth(1180,1530,x)*smooth(410,790,y);
    const bottom=smooth(650+Math.sin(x*.006)*35,925,y);
    return Math.max(pine,right,bottom);
  }
  function cacheCanopy(){
    canopy.length=0;looseLeaves.length=0;leafSprites.length=0;
    if(!pixels)return;
    const paint=p.getImageData(0,0,W,H).data;
    foreground=document.createElement('canvas');foreground.width=W;foreground.height=H;
    const fc=foreground.getContext('2d'),front=fc.createImageData(W,H);
    // The near trees use the existing pigment, with deeper shadows and warmer needle tips.
    for(let y=140;y<H;y++)for(let x=0;x<W;x++){
      const at=(y*W+x)*4,r=pixels[at],g=pixels[at+1],b=pixels[at+2],depth=foregroundDepth(x,y);
      const foliage=g>b*.94&&g>r*.87,wood=r+g+b<225;
      if(depth<.01||(!foliage&&!wood)||y<skyline[x]+4)continue;
      const brightness=paint[at]*.3+paint[at+1]*.55+paint[at+2]*.15;
      const highlight=clamp((brightness-145)/65,0,1);
      front.data[at]=clamp((paint[at]-115)*1.25+99+highlight*5,0,255);
      front.data[at+1]=clamp((paint[at+1]-115)*1.24+103+highlight*7,0,255);
      front.data[at+2]=clamp((paint[at+2]-115)*1.2+91,0,255);
      const green=clamp((g-b+3)/18,0,1)*clamp((g-r+12)/20,0,1);
      front.data[at+3]=Math.round(225*depth*Math.max(green,wood?.65:0));
    }
    fc.putImageData(front,0,0);
    // Feathered, overlapping cutouts preserve the painted silhouette as branches flex.
    for(let y=140;y<H;y+=95)for(let x=0;x<W;x+=95){
      if(y<615&&x>190&&x<1180)continue;
      const w=Math.min(115,W-x),h=Math.min(115,H-y),sprite=document.createElement('canvas');
      sprite.width=w;sprite.height=h;
      const c=sprite.getContext('2d'),image=c.createImageData(w,h);let visible=0,near=0,leafX=0,leafY=0;
      for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
        const at=((y+yy)*W+x+xx)*4,local=(yy*w+xx)*4,r=pixels[at],g=pixels[at+1],b=pixels[at+2];
        if(g<b*.96||g<r*.88||r+g+b>555||y+yy<skyline[x+xx]+6)continue;
        const edge=Math.min(1,xx/14,yy/14,(w-xx)/14,(h-yy)/14),depth=foregroundDepth(x+xx,y+yy);
        const alpha=front.data[at+3]/255;
        for(let k=0;k<3;k++)image.data[local+k]=paint[at+k]*(1-alpha)+front.data[at+k]*alpha;
        image.data[local+3]=Math.round((150+depth*95)*edge);visible++;near+=depth;
        if(edge===1&&depth>.2&&visible%53===0){leafX=x+xx;leafY=y+yy;}
      }
      if(visible<90)continue;
      c.putImageData(image,0,0);
      if(x<190||near/visible>.12)canopy.push({sprite,x,y,near:near/visible,pine:x<190});
      if(leafY&&x<190&&looseLeaves.length<8)looseLeaves.push({x:leafX,y:leafY,phase:((x*13+y*7)%997)/997,duration:9+(x%7),size:.6+near/visible*.7});
    }
    const savedSeed=seed;seed=7183;
    for(const col of [{r:125,g:139,b:92},{r:166,g:167,b:111},{r:94,g:116,b:81},{r:184,g:171,b:118}]){
      const sprite=document.createElement('canvas');sprite.width=22;sprite.height=14;
      const c=sprite.getContext('2d');
      for(let i=0;i<16;i++)stroke(c,range(7,14),range(5,9),range(2,6),range(.6,1.8),col,range(-.5,.5),.55,2);
      leafSprites.push(sprite);
    }
    seed=savedSeed;
  }
  function rustlingTrees(c,t){
    const viewLeft=-ox/scale,viewRight=(innerWidth-ox)/scale;
    for(const patch of canopy){
      if(patch.x+patch.sprite.width+10<viewLeft||patch.x-10>viewRight)continue;
      // One gust travels across the near canopy; high branches yield more than their trunks.
      const windTime=t-patch.x*.0016;
      const gust=Math.sin(windTime*.75)*.65+Math.sin(windTime*1.55)*.22;
      const flutter=Math.sin(t*3.1+patch.x*.014+patch.y*.009)*.16+Math.sin(t*4.7-patch.x*.021)*patch.near*.1;
      const flex=patch.pine?2.2+(1-patch.y/H)*2.4:.55+patch.near*7;
      const sway=(gust+flutter)*flex;
      const anchor=patch.sprite.height;
      c.save();c.translate(patch.x+patch.sprite.width*.5,patch.y+anchor);
      c.rotate(-sway*.0025);drawSprite(c,patch.sprite,-patch.sprite.width*.5+sway,-anchor+Math.sin(windTime*1.2)*flex*.18);c.restore();
    }
    // Pigment flecks lift from the canopy, turn in the gust, then settle out of sight.
    for(let i=0;i<looseLeaves.length;i++){
      const leaf=looseLeaves[i];if(leaf.x+220<viewLeft||leaf.x-30>viewRight)continue;
      const age=(t/leaf.duration+leaf.phase)%1;
      const breeze=Math.sin((t-leaf.x*.0016)*.75),arc=Math.sin(age*Math.PI);
      const x=leaf.x+age*(100+leaf.size*55)+arc*Math.sin(t*.7+i)*18;
      const y=leaf.y-arc*(28+leaf.size*20)+age*age*90;
      c.save();c.globalAlpha=arc*arc*.72;c.translate(x,y);c.rotate(age*5+Math.sin(t*1.6+i)*.6);
      c.scale(leaf.size*(.25+.75*Math.abs(Math.cos(t*2.2+i))),leaf.size);
      c.transform(1,0,breeze*.25,1,0,0);drawSprite(c,leafSprites[i%leafSprites.length],-11,-7);c.restore();
    }
  }
  function birds(c,t){
    // Two staggered flocks travel only east; they wrap after the last bird leaves the view.
    const visibleLeft=-ox/scale,visibleRight=(innerWidth-ox)/scale;
    const span=visibleRight-visibleLeft+180,spacing=Math.min(24,(visibleRight-visibleLeft)/9);
    for(let flock=0;flock<2;flock++){
      const phase=(t/32+flock*.5+.19)%1,flight=visibleLeft-60+phase*span;
      for(let i=0;i<3;i++){
        const x=flight-i*spacing,y=224+flock*26+i*10+Math.sin(t*.3+flock)*4;
        if(x<visibleLeft-8||x>visibleRight+8||x<0||x>=W||y>skyline[Math.floor(x)]-12)continue;
        const wingPhase=t*5.1-i*.55-flock;
        const glide=(Math.sin(t*.55-i*.3-flock)+1)/2;
        const flap=Math.sin(wingPhase)*3.5*(1-glide*.7)-glide*1.7;
        const size=i===0?6.5:5.5;
        c.strokeStyle='rgba(39,56,57,.86)';c.lineWidth=i===0?1.35:1.1;c.lineCap='round';
        c.beginPath();c.moveTo(x-size,y+flap);c.quadraticCurveTo(x-size*.45,y-1.8,x,y);c.quadraticCurveTo(x+size*.45,y-1.8,x+size,y+flap);c.stroke();
        c.fillStyle='#344b49';c.beginPath();c.ellipse(x,y,.8,1.65,-.3,0,Math.PI*2);c.fill();
      }
    }
  }
  function animate(now){
    requestAnimationFrame(animate);
    if(!ready||!liveReady||document.hidden||window.breezePaused||now-last<40)return;
    const dt=Math.min((now-last)/1000,.08);last=now;clock+=dt;
    air.clearRect(0,0,innerWidth,motion.height/(Math.min(devicePixelRatio||1,2)));air.save();air.translate(ox,oy);air.scale(scale,scale);
    driftingClouds(air,clock);
    waterfall(air,clock);
    rustlingTrees(air,clock);birds(air,clock);
    air.restore();
  }
  function loadImage(url,priority='low'){
    return new Promise((resolve,reject)=>{
      const img=new Image();img.decoding='async';img.fetchPriority=priority;
      img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Image unavailable: '+url));img.src=url;
    });
  }
  function showPainting(img){
    p.drawImage(img,0,0,W,H);ready=true;fit();
    document.documentElement.dataset.sceneReady='true';
    performance.mark('scene-visible');
  }
  async function prepareAuthoring(rebuild=false){
    const img=await loadImage('assets/yosemite-guide.jpg');
    sample??=source.getContext('2d',{willReadFrequently:true});
    sample.drawImage(img,0,0,W,H);pixels=sample.getImageData(0,0,W,H).data;
    for(let x=0;x<W;x++){
      let y=0;
      for(;y<650;y++){const i=(y*W+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];if(!(b>160&&b>r*1.3&&b>g*1.04&&b-r>45))break;}
      skyline[x]=y;
    }
    cloudSprites.length=0;fallMist.length=0;cacheClouds();cacheWaterfall();liveReady=true;
    if(rebuild)await buildPainting();
    else{try{const cached=await loadImage('assets/yosemite-painting.webp?v=cliffs-1');p.drawImage(cached,0,0,W,H);cacheCanopy();showPainting(cached);}catch{await buildPainting();}}
    document.documentElement.dataset.sceneLive='true';
  }
  let foregroundGroups=[],foregroundManifest;
  const foregroundLoads=new Map();
  async function loadVisibleForeground(){
    const left=-ox/scale,right=(innerWidth-ox)/scale;
    const visible=foregroundGroups.filter(group=>group.canopy.some(patch=>Math.min(right,patch.x+patch.rect[2])-Math.max(left,patch.x)>=12));
    const results=await Promise.allSettled(visible.map(group=>{
      if(!foregroundLoads.has(group.atlas))foregroundLoads.set(group.atlas,(async()=>{
        const atlas=await loadImage(new URL(group.atlas,foregroundManifest).href);
        canopy.push(...group.canopy.map(record=>({...record,sprite:{image:atlas,rect:record.rect,width:record.rect[2],height:record.rect[3]}})));
        fit();
      })());
      return foregroundLoads.get(group.atlas);
    }));
    document.documentElement.dataset.sceneComplete=results.every(r=>r.status==='fulfilled')?'true':'partial';
    performance.mark('scene-complete');
  }
  async function loadLiveAssets(){
    try{
      const url=new URL('assets/yosemite-live-p1.json',location.href);
      const response=await fetch(url,{priority:'low'});if(!response.ok)throw new Error('Live manifest unavailable');
      const data=await response.json();if(data.version!==2||data.skyline.length!==W)throw new Error('Invalid scene assets');
      const atlas=await loadImage(new URL(data.atlas,url).href);
      const sprite=record=>({image:atlas,rect:record.rect,width:record.rect[2],height:record.rect[3]});
      skyline.set(data.skyline);
      cloudSprites.push(...data.clouds.map(record=>({...record,sprite:sprite(record)})));
      fallMist.push(...data.mist.map(sprite));
      leafSprites.push(...data.leaves.map(sprite));looseLeaves.push(...data.looseLeaves);
      foregroundGroups=data.foreground;foregroundManifest=url;
      liveReady=true;fit();document.documentElement.dataset.sceneLive='true';performance.mark('scene-live');
      loadVisibleForeground();
    }catch{document.documentElement.dataset.sceneLive='static';}
  }
  async function startScene(){
    if(new URLSearchParams(location.search).has('bake')){await prepareAuthoring();return;}
    try{showPainting(await loadImage('assets/yosemite-display-p1.webp','high'));}
    catch{try{showPainting(await loadImage('assets/yosemite-painting.webp?v=cliffs-1','high'));}catch{document.documentElement.dataset.sceneReady='error';return;}}
    // Yield a frame so the finished painting is visible before preparing live layers.
    requestAnimationFrame(()=>loadLiveAssets());
  }
  startScene().catch(()=>{document.documentElement.dataset.sceneReady='error';});
  window.exportSceneAssets=()=>{
    const display=document.createElement('canvas');display.width=W;display.height=H;
    const dc=display.getContext('2d');dc.drawImage(painting,0,0);if(foreground)dc.drawImage(foreground,0,0);
    const common=[],groups=[[],[],[]],metadata={version:2,atlas:'yosemite-live-p1.webp',skyline:Array.from(skyline),looseLeaves,clouds:[],mist:[],foreground:[],leaves:[]};
    const add=(sprite,props,list,entries)=>{const record={...props};list.push(record);entries.push({sprite,record});};
    cloudSprites.forEach(({sprite,...props})=>add(sprite,props,metadata.clouds,common));
    fallMist.forEach(sprite=>add(sprite,{},metadata.mist,common));
    leafSprites.forEach(sprite=>add(sprite,{},metadata.leaves,common));
    for(let i=0;i<3;i++)metadata.foreground.push({atlas:['yosemite-near-left-p1.webp','yosemite-near-center-p1.webp','yosemite-near-right-p1.webp'][i],canopy:[]});
    canopy.forEach(({sprite,...props})=>{
      const group=Math.min(2,Math.floor((props.x+sprite.width/2)/(W/3)));
      add(sprite,props,metadata.foreground[group].canopy,groups[group]);
    });
    function pack(entries){
      let x=0,y=0,row=0;
      for(const entry of entries){
        const {width:w,height:h}=entry.sprite;
        if(x+w+4>2048){x=0;y+=row+4;row=0;}
        entry.record.rect=[x+2,y+2,w,h];x+=w+4;row=Math.max(row,h);
      }
      const atlas=document.createElement('canvas');atlas.width=2048;atlas.height=y+row+4;
      const ac=atlas.getContext('2d');entries.forEach(({sprite,record})=>ac.drawImage(sprite,record.rect[0],record.rect[1]));
      return atlas.toDataURL('image/webp',.86);
    }
    const atlases={[metadata.atlas]:pack(common)};
    metadata.foreground.forEach((group,i)=>{atlases[group.atlas]=pack(groups[i])});
    return {metadata,display:display.toDataURL('image/webp',.84),atlases};
  };
  window.paintLandscape=()=>prepareAuthoring(true);
  window.exportPainting=()=>painting.toDataURL('image/webp',.94);
  let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(()=>{fit();if(liveReady&&foregroundManifest)loadVisibleForeground();},100);});
  addEventListener('visibilitychange',()=>{last=performance.now();});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  window.breezePaused=reduce.matches;reduce.addEventListener('change',e=>{window.breezePaused=e.matches;if(e.matches)fit();});
  fit();requestAnimationFrame(animate);
  if(matchMedia('(max-width:650px)').matches){
    history.scrollRestoration='manual';
    requestAnimationFrame(()=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)/2,behavior:'instant'}));
  }
})();
