const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});const out=path.join(os.tmpdir(),'postcardfolio-tower-people');fs.mkdirSync(out,{recursive:true});try{
 for(const route of ['tech-blog','about']){
  const p=await b.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:5178/'+route+'?repaint=1&check-detail=1');await p.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true',null,{timeout:90000});
  const report=await p.evaluate(()=>window.sceneDetailReport);assert.ok(report.changed>500,route+' receives fine paint');assert.equal(report.leaked,0,route+' changes no pixels outside its detail mask');console.log(route,report);await p.close();
  for(const width of [1600,390]){
   const p=await b.newPage({viewport:{width,height:width===1600?1000:844}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:5178/'+route);await p.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');await p.evaluate(()=>window.pauseScene(true));
   for(const t of [0,6]){await p.evaluate(t=>window.seekScene(t),t);await p.screenshot({path:path.join(out,route+'-'+width+'-t'+t+'.png')});}
   if(route==='about'&&width===1600){
    for(const t of [0,4,8,13,20]){await p.evaluate(t=>window.seekScene(t),t);await p.screenshot({path:path.join(out,'kayakers-t'+t+'.png'),clip:{x:55,y:625,width:1400,height:140}});}
    const gaps=await p.evaluate(async()=>{const meta=await(await fetch('/assets/sleeping-bear/live-v7.json')).json(),i=new Image();i.src='/assets/sleeping-bear/live-v7.webp';await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);return [[210,680],[832,660],[1237,663],[1250,680]].map(([x,y],index)=>{const boat=meta.state.boats[index],r=boat.sprite.$sprite;return g.getImageData(r[0]+x-boat.x,r[1]+y-boat.y,1,1).data[3]});});assert.deepEqual(gaps,[0,0,0,0],'Cliff and gaps between people never move with the boats');console.log('kayak gaps',gaps);
   }
   assert.deepEqual(errors,[]);await p.close();
  }
 }
 console.log('Passed localized tower/person detail, separate boat silhouettes and desktop/mobile scenes. '+out);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
