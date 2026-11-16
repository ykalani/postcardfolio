const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
 const output=path.join(os.tmpdir(),'postcardfolio-depth');fs.mkdirSync(output,{recursive:true});
 try{
  for(const route of ['', 'writing'])for(const width of [1600,390]){
   const page=await browser.newPage({viewport:{width,height:width===1600?1000:844}});
   await page.goto((process.env.SCENE_URL||'http://127.0.0.1:5178')+'/'+route);
   await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
   await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
   await page.screenshot({path:path.join(output,`${route||'home'}-${width}-t0.png`)});
   if(width===1600){
    const changes=await page.evaluate(route=>{
     const c=document.querySelector('#motion'),g=c.getContext('2d');
     const regions=route?[{name:'pines',x:1200,y:300,w:350,h:320},{name:'water',x:100,y:700,w:700,h:150},{name:'mountain',x:650,y:100,w:200,h:200}]:[{name:'bough',x:800,y:65,w:700,h:230},{name:'left pine',x:0,y:260,w:260,h:520}];
     const first=regions.map(r=>g.getImageData(r.x,r.y,r.w,r.h).data);window.seekScene(4);
     return regions.map((r,index)=>{const next=g.getImageData(r.x,r.y,r.w,r.h).data;let changed=0;for(let k=0;k<next.length;k+=4)if(next[k]!==first[index][k]||next[k+1]!==first[index][k+1]||next[k+2]!==first[index][k+2]||next[k+3]!==first[index][k+3])changed++;return {name:r.name,changed};});
    },route);
    for(const region of changes)if(region.name==='mountain')assert.equal(region.changed,0,'Banff mountain stays fixed');else assert.ok(region.changed>200,`${route||'Home'} ${region.name} visibly moves: ${region.changed}`);
    console.log(route||'Home',changes);
   }else await page.evaluate(()=>window.seekScene(4));
   await page.screenshot({path:path.join(output,`${route||'home'}-${width}-t4.png`)});await page.close();
  }
  console.log('Passed: separate Yosemite bough, Banff pine and water motion; fixed mountain. Screenshots: '+output);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
