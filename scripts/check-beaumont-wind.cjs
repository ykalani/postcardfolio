const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch();
  const output = path.join(os.tmpdir(), 'beaumont-gusts-' + (process.env.SCENE_URL?.startsWith('https') ? 'production' : 'local'));
  fs.mkdirSync(output, {recursive:true});
  try {
    for (const width of [1600,390]) {
      const page = await browser.newPage({viewport:{width,height:width===1600?1000:844}});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto((process.env.SCENE_URL || 'http://127.0.0.1:5180')+'/tech-blog');
      await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
      const report = await page.evaluate(() => {
        window.pauseScene(true);
        const canvas=document.querySelector('#motion'),ctx=canvas.getContext('2d'),fill=ctx.fillRect;
        const painting=document.querySelector('#landscape').toDataURL();
        let marks=[];
        ctx.fillRect=function(x,y,w,h) {
          if(y===-2&&h===4) {const m=this.getTransform();marks.push({x:m.e,y:m.f,angle:Math.atan2(m.b,m.a),alpha:this.globalAlpha,color:this.fillStyle});}
          return fill.call(this,x,y,w,h);
        };
        const frames=[];
        const draw=t=>{marks=[];window.seekScene(t);return marks;};
        try {
          for(let t=0;t<84;t+=.5) frames.push({t,marks:draw(t)});
          const samples={straight:null,spiral:null,exit:null};
          let neutral=true,one=false,two=false,fading=false,variations=new Set();
          for(const frame of frames) {
            if(frame.marks.length>216) throw Error('More than two gusts');
            if(frame.marks.length===108)one=true;
            if(frame.marks.length===216)two=true;
            for(let i=0;i<frame.marks.length;i+=108) {
              const gust=frame.marks.slice(i,i+108),peak=Math.max(...gust.map(m=>m.alpha));
              const straight=gust.every(m=>Math.cos(m.angle)>.98);
              const spiral=gust.some(m=>Math.cos(m.angle)<-.5)&&gust.some(m=>Math.sin(m.angle)>.5)&&gust.some(m=>Math.sin(m.angle)<-.5);
              if(straight&&peak>.1&&samples.straight===null)samples.straight=frame.t;
              if(spiral&&peak>.3&&samples.spiral===null)samples.spiral=frame.t;
              if(straight&&peak>.03&&peak<.2){samples.exit=frame.t;fading=true;}
              if(spiral)variations.add(Math.round(gust.reduce((sum,m)=>sum+m.y,0)/gust.length/20));
              neutral&&=gust.every(m=>{const rgb=m.color.match(/\w\w/g).map(v=>parseInt(v,16));return Math.max(...rgb)-Math.min(...rgb)<8;});
            }
          }
          const before=JSON.stringify(draw(7));draw(40);const repeatable=before===JSON.stringify(draw(7));
          return {one,two,neutral,fading,variations:variations.size,repeatable,samples,fixed:painting===document.querySelector('#landscape').toDataURL()};
        } finally {ctx.fillRect=fill;}
      });
      assert.ok(report.one&&report.two,'Gusts alternate between one and two');
      assert.ok(report.neutral&&report.fading&&report.repeatable&&report.fixed);
      assert.ok(report.variations>2,'Placement varies between gusts');
      assert.ok(Object.values(report.samples).every(t=>t!==null),'Straight entry, spiral, and fading straight exit are visible');
      assert.deepEqual(errors,[]);
      for(const [phase,t] of Object.entries(report.samples)) {
        await page.evaluate(t=>window.seekScene(t),t);
        await page.screenshot({path:path.join(output,`${width}-${phase}.png`)});
      }
      for(const t of [6,6.4,6.8,7.2]) {
        await page.evaluate(t=>window.seekScene(t),t);
        await page.screenshot({path:path.join(output,`${width}-${t}.png`)});
      }
      console.log({width,...report});await page.close();
    }
    console.log(output);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
