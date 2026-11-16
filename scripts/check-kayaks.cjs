const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
 const output=process.env.QA_OUTPUT||path.join(os.tmpdir(),'postcardfolio-kayaks-v7');fs.mkdirSync(output,{recursive:true});
 try{
  for(const width of[1600,390]){
   const page=await browser.newPage({viewport:{width,height:width===1600?1000:844}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto((process.env.SCENE_URL||'http://127.0.0.1:5178')+'/about');
   await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
   await page.evaluate(()=>window.pauseScene(true));
   const result=await page.evaluate(async()=>{
    const meta=await(await fetch(new URL('assets/sleeping-bear/live-v7.json',location.href))).json(),boats=meta.state.boats;
    const image=new Image();image.src=new URL('assets/sleeping-bear/live-v7.webp',location.href);await image.decode();
    const atlas=document.createElement('canvas');atlas.width=image.width;atlas.height=image.height;
    const g=atlas.getContext('2d');g.drawImage(image,0,0);
    const gaps=[[210,680],[832,660],[1237,663],[1250,680]].map(([x,y],index)=>{
     const boat=boats[index],r=boat.sprite.$sprite;return g.getImageData(r[0]+x-boat.x,r[1]+y-boat.y,1,1).data[3];
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
     if(index>=0){const m=this.getTransform();frame[index]={x:m.e,y:m.f};}
     return draw.call(this,sprite,...args);
    };
    try{for(const t of[0,2,6,13]){frame=[];window.seekScene(t);frames.push(frame);}}
    finally{ctx.drawImage=draw;}
    window.seekScene(0);const first=hash();window.seekScene(6);const moved=hash()!==first;window.seekScene(0);
    return{count:boats.length,depth:boats.map(b=>b.depth),gaps,leafLight,frames,moved,repeat:hash()===first,fixed:fixed===document.querySelector('#landscape').toDataURL()};
   });
   assert.equal(result.count,4);assert.deepEqual(result.depth,[1,1,0,2]);assert.deepEqual(result.gaps,[0,0,0,0]);
   assert.ok(result.moved&&result.repeat&&result.fixed);
   assert.ok(result.leafLight.every(light=>light>0&&light<125),'Leaves use dark olive brush pigments');
   if(width===1600)for(let i=0;i<4;i++){
    const xs=result.frames.map(frame=>frame[i].x);assert.ok(Math.max(...xs)-Math.min(...xs)>5,`Kayak ${i} visibly moves`);
   }
   for(const t of[0,2,6,13]){
    await page.evaluate(t=>window.seekScene(t),t);await page.screenshot({path:path.join(output,`about-${width}-t${t}.png`)});
    if(width===1600)await page.screenshot({path:path.join(output,`kayaks-t${t}.png`),clip:{x:55,y:625,width:1400,height:140}});
   }
   assert.deepEqual(errors,[]);console.log(width,JSON.stringify(result));await page.close();
  }
  console.log('Passed: all four kayaks move, dark painted leaves, transparent gaps, deterministic animation and fixed background. '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
