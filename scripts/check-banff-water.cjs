const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.QA_OUTPUT || path.join(require('node:os').tmpdir(), 'postcardfolio-banff-water');
const base = process.env.SCENE_URL || 'http://127.0.0.1:5178';
(async () => {
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch();
  try {
    for (const width of [1600,390]) {
      const page = await browser.newPage({viewport:{width,height:width===1600?1000:844}}), errors=[];
      page.on('pageerror', error=>errors.push(error.message));
      await page.goto(base+'/about');
      await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
      assert.equal(await page.locator('link[as="image"]').getAttribute('href'),'assets/banff/painting-v7.webp');
      assert.equal(await page.evaluate(()=>window.exportSceneAssets().metadata.state.foliage.length),4,'Four painted shoreline conifers');
      await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
      for (const name of ['.trail-post','.trail-pika']) {
        const sprite = page.locator(name);
        const alpha = await sprite.evaluate(async image=>{
          await image.decode(); const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
          const g=c.getContext('2d');g.drawImage(image,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let visible=0;
          for(let i=3;i<d.length;i+=4)if(d[i]>100)visible++;
          return visible/(c.width*c.height);
        });
        assert.ok(alpha>.3&&alpha<.9,'Foreground prop is an isolated painted cutout');
      }
      const pika=await page.locator('.trail-pika').boundingBox(),navigation=await page.locator('.scene-nav').boundingBox();
      assert.ok(pika.x>=0&&pika.x+pika.width<=width,'Pika fits the viewport');
      assert.ok(pika.y+pika.height<navigation.y||pika.x+pika.width<navigation.x,'Pika stays clear of navigation');
      await page.screenshot({path:path.join(output,`about-${width}-t0.png`)});
      if (width===1600) {
        const report = await page.evaluate(()=>{
          const g=document.querySelector('#motion').getContext('2d');
          const regions=[
            ['far left',70,555,180,30,true],['far center',430,520,150,30,true],
            ['left lake',100,640,180,80,true],['center lake',650,650,180,80,true],
            ['warm reflection',950,660,120,65,true],['dark reflection',1350,820,100,60,true],
            ['foreground lake',20,890,180,60,true],
            ['mountain',650,100,200,200,false],['snowfield',390,300,70,80,false],
            ['canoes and dock',1180,565,80,16,false],['far forest',900,420,100,50,false]
          ];
          const first=regions.map(([,x,y,w,h])=>g.getImageData(x,y,w,h).data);
          let strokes=0,snowDabs=0,maxSnowAlpha=0;const original=CanvasRenderingContext2D.prototype.stroke,originalFill=CanvasRenderingContext2D.prototype.fill;
          CanvasRenderingContext2D.prototype.stroke=function(...args){strokes++;return original.apply(this,args);};
          CanvasRenderingContext2D.prototype.fill=function(...args){snowDabs++;maxSnowAlpha=Math.max(maxSnowAlpha,this.globalAlpha);return originalFill.apply(this,args);};
          try {window.seekScene(2);} finally {CanvasRenderingContext2D.prototype.stroke=original;CanvasRenderingContext2D.prototype.fill=originalFill;}
          return {strokes,snowDabs,maxSnowAlpha,regions:regions.map(([name,x,y,w,h,moving],i)=>{
            const next=g.getImageData(x,y,w,h).data;let changed=0;
            for(let k=0;k<next.length;k+=4)if(next[k]!==first[i][k]||next[k+1]!==first[i][k+1]||next[k+2]!==first[i][k+2]||next[k+3]!==first[i][k+3])changed++;
            return {name,moving,coverage:changed/(w*h)};
          })};
        });
        assert.equal(report.strokes,0,'No added wave lines');
        assert.equal(report.snowDabs,54,'Sparse painted snowfall');
        assert.ok(report.maxSnowAlpha<=.35,'Snow remains translucent');
        for(const region of report.regions) {
          if(region.moving)assert.ok(region.coverage>.8,`${region.name}: whole water surface moves (${region.coverage})`);
          else assert.ok(region.coverage<.005,`${region.name}: stays fixed apart from sparse snowfall`);
        }
        console.log(JSON.stringify(report));
      }
      await page.evaluate(()=>window.seekScene(6));
      await page.screenshot({path:path.join(output,`about-${width}-t6.png`)});
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('Passed: whole-lake motion, fixed landmarks, desktop/mobile snapshots: '+output);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
