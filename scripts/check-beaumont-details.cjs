const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch(),output=path.join(os.tmpdir(),'beaumont-focal-detail');fs.mkdirSync(output,{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  const base=process.env.SCENE_URL||'http://127.0.0.1:5196';
  await page.goto(base+'/tech-blog?repaint=1&check-detail=1');
  await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true',null,{timeout:90000});
  const report=await page.evaluate(()=>({focus:window.beaumontDetailReport,tower:window.sceneDetailReport}));
  assert.ok(report.focus.clock>1000,'Clock receives finer pigment');
  assert.ok(report.focus.relief>5000,'Carved relief receives finer pigment');
  assert.equal(report.focus.leaked,0,'Focal pass changes nothing outside its two masks');
  assert.equal(report.tower.leaked,0,'Tower refinement stays inside architecture');
  await page.goto(base+'/tech-blog');await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
  for(const [name,clip] of [['clock',{x:650,y:350,width:110,height:125}],['relief',{x:590,y:575,width:150,height:195}]])await page.screenshot({path:path.join(output,name+'.png'),clip});
  assert.deepEqual(errors,[]);console.log({passed:true,...report,output});
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
