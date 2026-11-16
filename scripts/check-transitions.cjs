const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('node:path'),os=require('node:os'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch();
 const output=path.join(os.tmpdir(),'postcardfolio-transitions');fs.mkdirSync(output,{recursive:true});
 try{for(const width of [1600,390]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:1000}});
  await page.goto((process.env.SCENE_URL||'http://127.0.0.1:5178')+'/');
  await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');
  await page.evaluate(()=>new MutationObserver(()=>{
   if(document.documentElement.dataset.cloudPhase==='covered'){
    const c=document.querySelector('.cloud-curtain'),g=c.getContext('2d');
    sessionStorage.setItem('white-check',JSON.stringify([[0,0],[c.width/2,c.height/2],[c.width-1,c.height-1]].map(([x,y])=>[...g.getImageData(x,y,1,1).data])));
   }
  }).observe(document.documentElement,{attributes:true,attributeFilter:['data-cloud-phase']}));
  await page.getByRole('link',{name:'projects',exact:true}).click();
  await page.waitForFunction(()=>document.documentElement.dataset.cloudPhase==='covering');
  await page.waitForTimeout(500);await page.screenshot({path:path.join(output,`clouds-${width}.png`)});
  await page.waitForURL('**/projects');
  await page.waitForFunction(()=>document.documentElement.dataset.cloudPhase==='revealing');
  await page.screenshot({path:path.join(output,`arrival-${width}.png`)});
  assert.deepEqual(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('white-check'))),Array(3).fill([255,255,255,255]));
  await page.waitForFunction(()=>document.documentElement.dataset.cloudPhase==='idle');
  await page.waitForTimeout(350);await page.screenshot({path:path.join(output,`roll-${width}.png`)});
  await page.waitForTimeout(1000);await page.screenshot({path:path.join(output,`open-${width}.png`)});
  assert.equal(await page.locator('.scene-nav').evaluate(el=>getComputedStyle(el).animationName),'paper-unroll');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.scene-nav').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.close();
 }console.log('Passed: white handoff, arrival, paper rollout and reduced motion on desktop/mobile. '+output);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
