const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
  const output=process.env.QA_OUTPUT||path.join(os.tmpdir(),'postcardfolio-dunes-reference');fs.mkdirSync(output,{recursive:true});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1000}});
    await page.goto(`${process.env.SCENE_URL||'http://127.0.0.1:5178'}/projects`);
    await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
    assert.equal(await page.locator('link[as="image"]').getAttribute('href'),'assets/great-sand-dunes/painting-v8.webp');
    const report=await page.evaluate(async()=>{
      const {metadata,atlas}=window.exportSceneAssets(),image=new Image();image.src=atlas;await image.decode();
      const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d');g.drawImage(image,0,0);let mountainPixels=0;
      for(const cloud of metadata.state.clouds){
        const [sx,sy]=cloud.sprite.$sprite;
        // Mountain faces near the left snowy ridge must not enter sky cutouts.
        for(const [x,y,w,h] of [[380,210,80,20],[490,200,30,25]]){
          if(x<cloud.x||x+w>cloud.x+cloud.w||y<cloud.y||y+h>cloud.y+cloud.h)continue;
          const data=g.getImageData(sx+x-cloud.x,sy+y-cloud.y,w,h).data;
          for(let i=3;i<data.length;i+=4)if(data[i])mountainPixels++;
        }
      }
      return{layers:Object.keys(metadata.state).sort(),mountainPixels,clouds:metadata.state.clouds.length,sand:metadata.state.sand.length,grass:metadata.state.grass.length};
    });
    assert.deepEqual(report.layers,['clouds','grass','sand'],'Only materials in the new reference are animated');
    assert.equal(report.mountainPixels,0);assert.equal(report.clouds,3);assert.equal(report.sand,6);assert.ok(report.grass>0);
    await page.evaluate(()=>{window.pauseScene(true);window.seekScene(24);});
    await page.screenshot({path:path.join(output,'reference-desktop.png')});
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(output,'reference-mobile-top.png')});
    console.log(JSON.stringify({report,output}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
