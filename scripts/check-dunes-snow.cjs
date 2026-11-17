const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
  const output=process.env.QA_OUTPUT||path.join(os.tmpdir(),'postcardfolio-dunes-snow');fs.mkdirSync(output,{recursive:true});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1000}});
    await page.goto(`${process.env.SCENE_URL||'http://127.0.0.1:5178'}/projects?repaint=1&check-detail=1`);
    await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true',null,{timeout:90000});
    const detail=await page.evaluate(()=>window.sceneDetailReport);
    assert.ok(detail.changed>3000,'Snow refinement adds substantial painted snow');assert.equal(detail.leaked,0,'Snow paint stays inside its mountain mask');
    const cloudMountainPixels=await page.evaluate(async()=>{
      const {metadata,atlas}=window.exportSceneAssets(),image=new Image();image.src=atlas;await image.decode();
      const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d');g.drawImage(image,0,0);let count=0;
      // These snowy faces were inside the old sky cutoff and traveled with the clouds.
      for(const cloud of metadata.state.clouds){
        const [sx,sy]=cloud.sprite.$sprite;
        for(const [x,y,w,h] of [[640,84,20,49],[600,77,15,54]]){
          if(x<cloud.x||x+w>cloud.x+cloud.w)continue;
          const data=g.getImageData(sx+x-cloud.x,sy+y-cloud.y,w,h).data;
          for(let i=3;i<data.length;i+=4)if(data[i])count++;
        }
      }
      return count;
    });
    assert.equal(cloudMountainPixels,0,'Moving cloud cutouts exclude snowy mountain faces');
    const snow=await page.evaluate(async()=>{
      async function count(url){
        const image=new Image();image.src=url;await image.decode();
        const c=document.createElement('canvas');c.width=1600;c.height=1000;const g=c.getContext('2d');g.drawImage(image,0,0);
        const pixels=g.getImageData(190,60,930,170).data;let bright=0;
        for(let i=0;i<pixels.length;i+=4)if(pixels[i]>205&&pixels[i+1]>215&&pixels[i+2]>225)bright++;
        return bright;
      }
      return{before:await count('assets/great-sand-dunes/painting-v5.webp'),after:await count('assets/great-sand-dunes/painting-v7.webp')};
    });
    assert.ok(snow.after>snow.before*1.6&&snow.after>4000,'Baked snow reads distinctly brighter than exposed rock');
    await page.evaluate(()=>{window.pauseScene(true);window.seekScene(24);});
    await page.screenshot({path:path.join(output,'snow-desktop.png')});
    await page.screenshot({path:path.join(output,'snow-detail.png'),clip:{x:190,y:60,width:930,height:170}});
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(output,'snow-mobile.png')});
    console.log(JSON.stringify({detail,snow,cloudMountainPixels,output}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
