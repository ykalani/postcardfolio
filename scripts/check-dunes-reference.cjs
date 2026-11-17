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
    assert.equal(await page.locator('link[as="image"]').getAttribute('href'),'assets/great-sand-dunes/painting-v10.webp');
    const report=await page.evaluate(async()=>{
      const {metadata,atlas}=window.exportSceneAssets(),image=new Image();image.src=atlas;await image.decode();
      const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d');g.drawImage(image,0,0);let cloudHighlights=0;
      for(const cloud of metadata.state.clouds){
        const [sx,sy]=cloud.sprite.$sprite;
        const data=g.getImageData(sx,sy,cloud.w,cloud.h).data;
        for(let i=0;i<data.length;i+=4)if(data[i]>220&&data[i+1]>210&&data[i+3]>170)cloudHighlights++;
      }
      return{layers:Object.keys(metadata.state).sort(),cloudHighlights,clouds:metadata.state.clouds.length,sand:metadata.state.sand.length,grass:metadata.state.grass.length,brush:metadata.state.brush.length};
    });
    assert.deepEqual(report.layers,['brush','clouds','grass','sand'],'Scene has windblown brush, sky clouds, grass and dune crests');
    assert.ok(report.cloudHighlights>10000,'Yosemite cloud banks have substantial opaque white brushwork');assert.equal(report.clouds,3);assert.equal(report.sand,6);assert.ok(report.grass>0);assert.equal(report.brush,7);
    const contrast=await page.evaluate(async()=>{
      async function sample(version){
        const image=new Image();image.src=`assets/great-sand-dunes/painting-v${version}.webp`;await image.decode();
        const c=document.createElement('canvas');c.width=1600;c.height=1000;const g=c.getContext('2d');g.drawImage(image,0,0);
        return Object.fromEntries(Object.entries({sky:[0,30,650,180],hills:[650,420,280,110],mountain:[300,270,280,130],sand:[600,680,320,140]}).map(([name,rect])=>{
          const data=g.getImageData(...rect).data,rgb=[0,0,0],light=[];
          for(let i=0;i<data.length;i+=4){for(let j=0;j<3;j++)rgb[j]+=data[i+j];light.push(data[i]*.3+data[i+1]*.55+data[i+2]*.15);}
          rgb.forEach((v,i)=>rgb[i]=v/light.length);const mean=light.reduce((a,b)=>a+b,0)/light.length;
          return[name,{rgb,spread:Math.sqrt(light.reduce((sum,v)=>sum+(v-mean)**2,0)/light.length)}];
        }));
      }
      return{before:await sample(8),after:await sample(10)};
    });
    const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
    assert.ok(contrast.after.hills.rgb[1]-contrast.after.hills.rgb[0]>contrast.before.hills.rgb[1]-contrast.before.hills.rgb[0]+10,'Foothills have distinct green pigment');
    for(const region of ['mountain','sand'])assert.ok(distance(contrast.after.hills.rgb,contrast.after[region].rgb)>distance(contrast.before.hills.rgb,contrast.before[region].rgb)*1.1,`${region} separates from the green hills`);
    assert.ok(contrast.after.sky.rgb[2]-contrast.after.sky.rgb[0]>contrast.before.sky.rgb[2]-contrast.before.sky.rgb[0]+60,'Sky has a strong blue field behind the white clouds');
    await page.evaluate(()=>{window.pauseScene(true);window.seekScene(24);});
    await page.screenshot({path:path.join(output,'reference-desktop.png')});
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(output,'reference-mobile-top.png')});
    console.log(JSON.stringify({report,contrast,output}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
