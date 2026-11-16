const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
 const output=path.join(os.tmpdir(),'postcardfolio-smoke-dunes');fs.mkdirSync(output,{recursive:true});
 try{
  for(const route of ['projects','experience'])for(const width of [1600,390]){
   const page=await browser.newPage({viewport:{width,height:width===1600?1000:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto((process.env.SCENE_URL||'http://127.0.0.1:5178')+'/'+route);
   await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
   await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
   await page.screenshot({path:path.join(output,`${route}-${width}-t0.png`)});
   if(width===1600){
    const result=await page.evaluate(route=>{
     const g=document.querySelector('#motion').getContext('2d');
     const regions=route==='projects'?[{name:'smoke',x:0,y:0,w:1600,h:230},{name:'rising bristles',x:790,y:330,w:250,h:380}]:[
      {name:'clouds',x:0,y:0,w:1600,h:55},{name:'sand',x:300,y:350,w:280,h:220},
      {name:'river',x:300,y:745,w:900,h:90},{name:'brush',x:0,y:860,w:1600,h:140},
      {name:'mountains',x:450,y:170,w:400,h:80}];
     function read(){return regions.map(r=>g.getImageData(r.x,r.y,r.w,r.h).data);}
     function delta(a,b){let changed=0,energy=0;for(let i=0;i<a.length;i+=4){const d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])+Math.abs(a[i+3]-b[i+3]);if(d>0)changed++;energy+=d;}return{changed,energy};}
     const first=read();window.seekScene(6);const next=read();
     const changes=regions.map((r,i)=>({name:r.name,...delta(first[i],next[i])}));
     const boundary=route==='projects'?28:1/.07;
     window.seekScene(boundary-.001);const before=read();window.seekScene(boundary+.001);const after=read();
     return {changes,boundary:regions.map((r,i)=>({name:r.name,...delta(before[i],after[i])}))};
    },route);
    for(const r of result.changes)if(r.name==='mountains')assert.equal(r.changed,0,'Distant mountain stays fixed');else assert.ok(r.changed>100,`${route}: ${r.name} must visibly move (${r.changed})`);
    for(let i=0;i<result.boundary.length;i++)assert.ok(result.boundary[i].energy<result.changes[i].energy*.2+100,`${route}: ${result.boundary[i].name} has no cycle pop`);
    console.log(route,JSON.stringify(result));
   }else await page.evaluate(()=>window.seekScene(6));
   await page.screenshot({path:path.join(output,`${route}-${width}-t6.png`)});assert.deepEqual(errors,[]);await page.close();
  }
  console.log('Passed: smoke, cloud, sand, water and foreground motion; steady mountain and continuous cycles. Screenshots: '+output);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
