const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch(),output=path.join(os.tmpdir(),'beaumont-branches-'+(process.env.SCENE_URL?.startsWith('https')?'production':'local'));
 fs.mkdirSync(output,{recursive:true});
 try{for(const width of [1600,390]){
  const page=await browser.newPage({viewport:{width,height:width===1600?1000:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto((process.env.SCENE_URL||'http://127.0.0.1:5180')+'/tech-blog');
  await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
  const report=await page.evaluate(async()=>{
   window.pauseScene(true);
   const meta=await(await fetch('/assets/beaumont/live-v7.json')).json();
   const atlas=new Image();atlas.src='/assets/beaumont/live-v7.webp';await atlas.decode();
   const cache=new Image();cache.src='/assets/beaumont/painting-v7.webp';await cache.decode();
   const c=document.createElement('canvas');c.width=atlas.width;c.height=atlas.height;
   const sample=c.getContext('2d');sample.drawImage(atlas,0,0);
   const branches=meta.state.foliage.filter(b=>b.kind==='blossom');
   const tips=branches.map(b=>{
    const [x,y,w,h]=b.layer.$sprite,pixels=sample.getImageData(x,y,w,h).data;
    let tip={x:0,y:0,d:0},opaque=0;
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(pixels[(yy*w+xx)*4+3]>245){
     opaque++;const d=Math.hypot(xx+b.x-b.anchorX,yy+b.y-b.anchorY);
     if(d>tip.d)tip={x:xx,y:yy,d};
    }
    return {...tip,opaque};
   });
   const bg=meta.state.background.$sprite,background=sample.getImageData(...bg).data;
   c.width=1600;c.height=1000;sample.drawImage(cache,0,0);
   const original=sample.getImageData(0,0,1600,1000).data;
   let cleared=0;for(let at=0;at<original.length;at+=4)if(Math.abs(original[at]-background[at])+Math.abs(original[at+1]-background[at+1])+Math.abs(original[at+2]-background[at+2])>60)cleared++;
   const g=document.querySelector('#motion').getContext('2d'),draw=g.drawImage,rect=g.fillRect;
   const terrain=document.querySelector('#landscape').toDataURL();let positions=[],rects=0;
   g.drawImage=function(...args){const m=this.getTransform();positions.push({m:{a:m.a,b:m.b,c:m.c,d:m.d,e:m.e,f:m.f},x:args[1],y:args[2]});return draw.apply(this,args);};
   g.fillRect=function(...args){rects++;return rect.apply(this,args);};
   const frames=[];
   try{for(let t=0;t<=7;t+=.5){positions=[];window.seekScene(t);frames.push(positions);}}finally{g.drawImage=draw;g.fillRect=rect;}
   const travel=tips.map((tip,i)=>{
    const points=frames.map(f=>{const {m,x,y}=f[i+1];return{x:m.a*(x+tip.x)+m.c*(y+tip.y)+m.e,y:m.b*(x+tip.x)+m.d*(y+tip.y)+m.f};});
    let span=0;for(const a of points)for(const b of points)span=Math.max(span,Math.hypot(a.x-b.x,a.y-b.y));
    return span/frames[0][0].m.a;
   });
   return {opaque:tips.map(p=>p.opaque),cleared,travel,rects,fixed:terrain===document.querySelector('#landscape').toDataURL()};
  });
  console.log({width,...report,travel:report.travel.map(n=>Math.round(n))});
  assert.ok(report.opaque.every(n=>n>1000),'Opaque flowering silhouettes replace faint overlays');
  assert.ok(report.cleared>15000,'Resting blossoms are removed from the live background');
  assert.ok(report.travel.every(n=>n>10),'Each flowering tip moves over ten scene pixels');
  assert.ok(report.fixed);assert.equal(report.rects,0);assert.deepEqual(errors,[]);
  for(const t of [0,1.5,3,4.5]){await page.evaluate(t=>window.seekScene(t),t);await page.screenshot({path:path.join(output,`${width}-${t}.png`)});}
  await page.close();
 }}finally{await browser.close();}
 console.log(output);
})().catch(error=>{console.error(error);process.exitCode=1;});
