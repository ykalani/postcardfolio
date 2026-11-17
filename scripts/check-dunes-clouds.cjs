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
      await page.goto(`${process.env.SCENE_URL||'http://127.0.0.1:5178'}/projects`);
      await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
      await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
      await page.screenshot({path:path.join(output,`${width}-initial.png`)});
      await page.evaluate(()=>window.seekScene(.75));
      await page.screenshot({path:path.join(output,`${width}-river-t075.png`)});
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
          });
          const proto=CanvasRenderingContext2D.prototype,draw=proto.drawImage,move=proto.moveTo;
          let bands=[],ripples=[];
          proto.drawImage=function(...args){if(this.canvas.width===1600&&this.canvas.height===165&&args.length===9)bands.push(args[5]);return draw.apply(this,args);};
          proto.moveTo=function(x,y){if(this.canvas.width===1600&&this.canvas.height===165)ripples.push(x);return move.call(this,x,y);};
          let river;
          try{
            window.seekScene(1);const firstBands=bands,firstRipples=ripples;bands=[];ripples=[];window.seekScene(1.1);
            river={bandsLeft:bands.every((x,i)=>x<firstBands[i]),ripplesLeft:ripples.every((x,i)=>x<firstRipples[i]||x-firstRipples[i]>1500),bands:bands.length,ripples:ripples.length};
          }finally{proto.drawImage=draw;proto.moveTo=move;}
          return{movement,seams,river};
        });
        assert.ok(report.movement[0]>10000,'Sky clouds visibly change within three seconds');
        assert.equal(report.movement[1],0,'Mountains stay fixed');
        assert.ok(report.movement[2]>10000,'Low cloud bank visibly changes');
        assert.ok(report.seams.every(energy=>energy<report.movement[0]*.05),'Cloud wrapping has no visible pop');
        assert.ok(report.river.bands>0&&report.river.bandsLeft,'All river reflections flow right to left');
        assert.ok(report.river.ripples>0&&report.river.ripplesLeft,'All river ripples and crests flow right to left');
        console.log(JSON.stringify(report));
      }
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log(`Passed: dunes clouds, right-to-left river, fixed mountains and seamless cloud wrapping. Screenshots: ${output}`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
