const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
 const output=path.join(os.tmpdir(),'postcardfolio-petals-kayaks');fs.mkdirSync(output,{recursive:true});
 try{
  for(const route of ['tech-blog','about'])for(const width of [1600,390]){
   const page=await browser.newPage({viewport:{width,height:width===1600?1000:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto((process.env.SCENE_URL||'http://127.0.0.1:5178')+'/'+route);
   await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
   await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
   await page.screenshot({path:path.join(output,`${route}-${width}-t0.png`)});
   if(width===1600){
    const result=await page.evaluate(route=>{
     const g=document.querySelector('#motion').getContext('2d'),landscape=document.querySelector('#landscape').toDataURL();
     const regions=route==='tech-blog'?[{name:'petal flight',x:300,y:390,w:450,h:300},{name:'flowering branch sway',x:229,y:34,w:278,h:283}]:[
      {name:'falling leaves',x:300,y:330,w:650,h:260},{name:'water',x:200,y:780,w:850,h:200},
      {name:'left kayak',x:60,y:640,w:260,h:110},{name:'middle kayak',x:750,y:635,w:240,h:100},{name:'right kayak',x:1120,y:635,w:320,h:120}];
     const first=regions.map(r=>g.getImageData(r.x,r.y,r.w,r.h).data);window.seekScene(6);
     return {fixed:landscape===document.querySelector('#landscape').toDataURL(),changes:regions.map((r,i)=>{const next=g.getImageData(r.x,r.y,r.w,r.h).data;let changed=0;for(let k=0;k<next.length;k+=4)if(next[k]!==first[i][k]||next[k+1]!==first[i][k+1]||next[k+2]!==first[i][k+2]||next[k+3]!==first[i][k+3])changed++;return{name:r.name,changed};})};
    },route);
    assert.ok(result.fixed,'Architecture, cliff and arch paintings stay fixed');
    for(const region of result.changes)assert.ok(region.changed>40,`${route} ${region.name}: ${region.changed}`);
    console.log(route,result);
   }else await page.evaluate(()=>window.seekScene(6));
   await page.screenshot({path:path.join(output,`${route}-${width}-t6.png`)});assert.deepEqual(errors,[]);await page.close();
  }
  console.log('Passed: falling petals, flowering branch sway, falling leaves, water and three kayaks; fixed underlying paintings. Screenshots: '+output);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
