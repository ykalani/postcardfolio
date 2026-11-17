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
      await page.goto(base+'/writing');
      await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
      await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
      await page.screenshot({path:path.join(output,`writing-${width}-t0.png`)});
      if (width===1600) {
        const report = await page.evaluate(()=>{
          const g=document.querySelector('#motion').getContext('2d');
          const regions=[
            ['far left',50,660,180,30,true],['far center',600,660,180,30,true],
            ['left lake',100,740,180,80,true],['center lake',650,730,180,80,true],
            ['pale reflection',1195,695,120,65,true],['dark reflection',1490,700,100,60,true],
            ['foreground lake',20,890,180,60,true],
            ['mountain',650,100,200,200,false],['dock',1020,940,90,40,false],
            ['canoes',1100,840,150,60,false],['person',1152,766,30,35,false]
          ];
          const first=regions.map(([,x,y,w,h])=>g.getImageData(x,y,w,h).data);
          let strokes=0;const original=CanvasRenderingContext2D.prototype.stroke;
          CanvasRenderingContext2D.prototype.stroke=function(...args){strokes++;return original.apply(this,args);};
          try {window.seekScene(2);} finally {CanvasRenderingContext2D.prototype.stroke=original;}
          return {strokes,regions:regions.map(([name,x,y,w,h,moving],i)=>{
            const next=g.getImageData(x,y,w,h).data;let changed=0;
            for(let k=0;k<next.length;k+=4)if(next[k]!==first[i][k]||next[k+1]!==first[i][k+1]||next[k+2]!==first[i][k+2]||next[k+3]!==first[i][k+3])changed++;
            return {name,moving,coverage:changed/(w*h)};
          })};
        });
        assert.equal(report.strokes,0,'No added wave lines');
        for(const region of report.regions) {
          if(region.moving)assert.ok(region.coverage>.9,`${region.name}: whole water surface moves (${region.coverage})`);
          else assert.equal(region.coverage,0,`${region.name}: stays fixed`);
        }
        console.log(JSON.stringify(report));
      }
      await page.evaluate(()=>window.seekScene(6));
      await page.screenshot({path:path.join(output,`writing-${width}-t6.png`)});
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('Passed: whole-lake motion, fixed landmarks, desktop/mobile snapshots: '+output);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
