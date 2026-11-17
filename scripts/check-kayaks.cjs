const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
 const output=process.env.QA_OUTPUT||path.join(os.tmpdir(),'postcardfolio-kayaks-v12');fs.mkdirSync(output,{recursive:true});
 try{
  for(const width of[1600,390]){
   const page=await browser.newPage({viewport:{width,height:width===1600?1000:844}}),errors=[],authoringRequests=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(/\/(?:gouache-master|kayak-study)\.png/.test(r.url()))authoringRequests.push(r.url());});
   await page.goto((process.env.SCENE_URL||'http://127.0.0.1:5178')+'/about');
   await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
   await page.evaluate(()=>window.pauseScene(true));
   const result=await page.evaluate(async()=>{
    const meta=await(await fetch(new URL('assets/sleeping-bear/live-v12.json',location.href))).json(),boats=meta.state.boats;
    const image=new Image();image.src=new URL('assets/sleeping-bear/live-v12.webp',location.href);await image.decode();
    const atlas=document.createElement('canvas');atlas.width=image.width;atlas.height=image.height;
    const g=atlas.getContext('2d');g.drawImage(image,0,0);
    const backgrounds=[];
    for(const version of[7,12]){
     const art=new Image();art.src=new URL(`assets/sleeping-bear/painting-v${version}.webp`,location.href);await art.decode();
     const c=document.createElement('canvas');c.width=1600;c.height=1000;const brush=c.getContext('2d');brush.drawImage(art,0,0);
     backgrounds.push([[50,40,260,120],[400,300,300,250],[250,800,650,150]].map(r=>brush.getImageData(...r).data));
    }
    const backgroundError=backgrounds[0].map((before,i)=>{const after=backgrounds[1][i];let difference=0;for(let n=0;n<before.length;n++)if(n%4!==3)difference+=Math.abs(before[n]-after[n]);return difference/(before.length*.75);});
    const mask=meta.state.mask.$sprite;
    const waterMask=[[1050,500],[400,850]].map(([x,y])=>g.getImageData(mask[0]+x,mask[1]+y,1,1).data[3]);
    const referenceBounds=boats.map(b=>[b.x,b.y,b.w,b.h]);
    const gaps=[[210,680],[832,660],[1237,663],[1250,680]].map(([x,y],i)=>{
     const b=boats[i],r=b.sprite.$sprite;return g.getImageData(r[0]+x-b.x,r[1]+y-b.y,1,1).data[3];
    });
    const cutouts=boats.map(boat=>{
     const data=g.getImageData(...boat.sprite.$sprite).data;let solid=0,green=0,red=0;
     for(let i=0;i<data.length;i+=4)if(data[i+3]>20){
      solid++;const y=Math.floor(i/4/boat.w),r=data[i],g=data[i+1],b=data[i+2];
      if(y>boat.h*.65&&g>r*1.03&&g>b*1.6)green++;
      if(y<boat.h*.8&&r>g*1.5&&r>b*1.5)red++;
     }
     return{coverage:solid/(boat.w*boat.h),green:green/solid,red:red/solid,corners:[data[3],data[(boat.w-1)*4+3],data[(boat.h-1)*boat.w*4+3],data[data.length-1]]};
    });
    const leafLight=meta.state.leafSprites.map(sprite=>{
     const data=g.getImageData(...sprite.$sprite).data;let light=0,alpha=0;
     for(let i=0;i<data.length;i+=4){light+=(data[i]*.3+data[i+1]*.55+data[i+2]*.15)*data[i+3];alpha+=data[i+3];}
     return light/alpha;
    });
    const motion=document.querySelector('#motion'),ctx=motion.getContext('2d'),draw=ctx.drawImage,frames=[];
    const fixed=document.querySelector('#landscape').toDataURL();
    const hash=()=>{const a=ctx.getImageData(0,0,motion.width,motion.height).data;let n=0;for(let j=0;j<a.length;j+=61)n=(Math.imul(n,31)+a[j])|0;return n;};
    let frame;
    ctx.drawImage=function(sprite,...args){
     const index=boats.findIndex(boat=>boat.w===sprite.width&&boat.h===sprite.height);
     if(index>=0&&!frame[index]){const m=this.getTransform();frame[index]={x:m.e,y:m.f};}
     return draw.call(this,sprite,...args);
    };
    try{for(const t of[0,2,6,13]){frame=[];window.seekScene(t);frames.push(frame);}}
    finally{ctx.drawImage=draw;}
    window.seekScene(0);const first=hash();window.seekScene(6);const moved=hash()!==first;window.seekScene(0);
    return{count:boats.length,depth:boats.map(b=>b.depth),cutouts,referenceBounds,gaps,leafLight,waterMask,backgroundError,frames,moved,repeat:hash()===first,fixed:fixed===document.querySelector('#landscape').toDataURL()};
   });
   assert.equal(result.count,4);assert.deepEqual(result.depth,[1,1,0,2]);assert.ok(result.cutouts.every(s=>s.coverage>.1&&s.coverage<.75&&s.corners.every(a=>a<20)),'Painted boats retain transparent silhouettes');
   assert.deepEqual(result.referenceBounds,[[84,647,212,94],[773,643,216,69],[1151,640,166,63],[1139,631,279,97]],'Unscaled cutouts stay aligned with the reference');
   assert.deepEqual(result.gaps,[0,0,0,0],'Gaps between the actual paddlers remain transparent');
   assert.ok(result.cutouts.every(s=>s.red>.015)&&result.cutouts.filter((_,i)=>i!==2).every(s=>s.green>.1),'Painted cutouts retain reference jacket and foreground hull pigments');
   assert.ok(result.moved&&result.repeat&&result.fixed);
   assert.ok(result.backgroundError.every(error=>error<3),'Original sky, cliffs and water retain their brush painting');
   assert.deepEqual(result.waterMask,[0,255],'Water motion excludes the sky opening');
   assert.deepEqual(authoringRequests,[],'Normal visits load only baked artwork');
   assert.ok(result.leafLight.every(light=>light>0&&light<125),'Leaves use dark olive brush pigments');
   if(width===1600)for(let i=0;i<4;i++){
    const [x,y,w,h]=result.referenceBounds[i],start=result.frames[0][i];
    assert.ok(Math.abs(start.x-(x+w*.5))<.001&&Math.abs(start.y-(y+h*.8))<.001,'Animation starts at the exact reference position');
    const xs=result.frames.map(frame=>frame[i].x);assert.ok(Math.max(...xs)-Math.min(...xs)>5,`Kayak ${i} visibly moves`);
   }
   for(const t of[0,2,6,13]){
    await page.evaluate(t=>window.seekScene(t),t);await page.screenshot({path:path.join(output,`about-${width}-t${t}.png`)});
    if(width===1600)await page.screenshot({path:path.join(output,`kayaks-t${t}.png`),clip:{x:55,y:610,width:1400,height:160}});
   }
   assert.deepEqual(errors,[]);console.log(width,JSON.stringify(result));await page.close();
  }
  console.log('Passed: all four kayaks move, dark painted leaves, transparent silhouettes, deterministic animation and fixed background. '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
