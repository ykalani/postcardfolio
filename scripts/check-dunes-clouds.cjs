const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
  const output=process.env.QA_OUTPUT||path.join(os.tmpdir(),'postcardfolio-dunes-clouds');fs.mkdirSync(output,{recursive:true});
  try{
    for(const width of [1600,390]){
      const page=await browser.newPage({viewport:{width,height:width===1600?1000:844}}),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(`${process.env.SCENE_URL||'http://127.0.0.1:5178'}/experience`);
      await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
      await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
      await page.screenshot({path:path.join(output,`${width}-initial.png`)});
      await page.evaluate(()=>scrollTo(0,0));
      for(const t of [0,3,6]){
        await page.evaluate(t=>window.seekScene(t),t);
        await page.screenshot({path:path.join(output,`${width}-t${t}.png`)});
      }
      if(width===1600){
        const report=await page.evaluate(()=>{
          const c=document.querySelector('#motion').getContext('2d');
          const read=()=>[c.getImageData(0,0,1600,55).data,c.getImageData(450,170,400,80).data,c.getImageData(0,280,1600,65).data];
          const delta=(a,b)=>a.reduce((sum,v,i)=>sum+Math.abs(v-b[i]),0);
          window.seekScene(0);const first=read();window.seekScene(3);const next=read();
          const movement=first.map((v,i)=>delta(v,next[i]));
          const seams=[(1600-0)/22,(1600-490)/(22+490*.006),(1600-1000)/(22+1000*.006)].map(t=>{
            window.seekScene(t-.001);const a=read()[0];window.seekScene(t+.001);return delta(a,read()[0]);
          });return{movement,seams};
        });
        assert.ok(report.movement[0]>10000,'Sky clouds visibly change within three seconds');
        assert.equal(report.movement[1],0,'Mountains stay fixed');
        assert.ok(report.movement[2]>10000,'Low cloud bank visibly changes');
        assert.ok(report.seams.every(energy=>energy<report.movement[0]*.05),'Cloud wrapping has no visible pop');
        console.log(JSON.stringify(report));
      }
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log(`Passed: dunes cloud motion, fixed mountains and seamless wrapping. Screenshots: ${output}`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
