const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});const out=path.join(os.tmpdir(),'postcardfolio-tower-people');fs.mkdirSync(out,{recursive:true});try{
 for(const route of ['tech-blog']){
  const p=await b.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:5178/'+route+'?repaint=1&check-detail=1');await p.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true',null,{timeout:90000});
  const report=await p.evaluate(()=>window.sceneDetailReport);assert.ok(report.changed>500,route+' receives fine paint');assert.equal(report.leaked,0,route+' changes no pixels outside its detail mask');console.log(route,report);await p.close();
  for(const width of [1600,390]){
   const p=await b.newPage({viewport:{width,height:width===1600?1000:844}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:5178/'+route);await p.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');await p.evaluate(()=>window.pauseScene(true));
   for(const t of [0,6]){await p.evaluate(t=>window.seekScene(t),t);await p.screenshot({path:path.join(out,route+'-'+width+'-t'+t+'.png')});}
   assert.deepEqual(errors,[]);await p.close();
  }
 }
 console.log('Passed localized tower detail and desktop/mobile scenes. '+out);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
