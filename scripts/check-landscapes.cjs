const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SCENE_URL || 'http://127.0.0.1:5178';
const output = process.env.QA_OUTPUT || path.join(os.tmpdir(),'postcardfolio-scene-qa');
const routes = ['','experiences','projects','writing','tech-blog','about'].filter(route=>!process.env.SCENE_ROUTES||process.env.SCENE_ROUTES.split(',').includes(route||'home'));
const sizes = [{width:1600,height:1000},{width:390,height:844},{width:320,height:700},{width:2560,height:1080}].filter(size=>!process.env.SCENE_WIDTHS||process.env.SCENE_WIDTHS.split(',').includes(String(size.width)));
assert.ok(routes.length&&sizes.length,'Select at least one valid scene and viewport');
const versions = {projects:5,experiences:5,writing:5,'tech-blog':6,about:9};
const sceneNames = {experiences:'hawaii-volcanoes',projects:'great-sand-dunes',writing:'banff','tech-blog':'beaumont',about:'sleeping-bear'};
fs.mkdirSync(output,{recursive:true});

async function ready(page,route) {
  await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true',null,{timeout:90000});
  await page.waitForFunction(()=>document.documentElement.dataset.sceneLive==='true'&&document.documentElement.dataset.sceneComplete==='true');
}
async function pixels(page) {
  return page.evaluate(()=>{
    const c=document.querySelector('#motion'),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let hash=0;for(let i=0;i<data.length;i+=101)hash=(Math.imul(hash,31)+data[i])|0;return hash;
  });
}
(async()=>{
  const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
  const report=[];
  try {
    for(const viewport of sizes) for(const route of routes) {
      const page=await browser.newPage({viewport}),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      const guideRequests=[];page.on('request',request=>{if((/\/(?:yosemite-)?guide\.(?:jpg|webp)(?:[?#]|$)/).test(request.url()))guideRequests.push(request.url());});
      await page.goto(`${base}/${route}`);await ready(page,route);
      assert.deepEqual(await page.locator('.scene-nav a').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),['./','experiences','projects','writing','tech-blog','about'],`${route}: navigation order`);
      assert.equal(await page.locator('[aria-current="page"]').getAttribute('href'),route||'./',`${route}: active destination`);
      if(route)assert.equal(await page.locator('script[type="module"]').getAttribute('src'),`scenes/${sceneNames[route]}.js`,`${route}: assigned landscape`);
      const layout=await page.evaluate(()=>({
        overflow:document.documentElement.scrollWidth>innerWidth,
        scroll:scrollY,stage:document.querySelector('main').clientHeight,
        links:[...document.querySelectorAll('.scene-nav a')].map(a=>{const r=a.getBoundingClientRect();return{x:r.x,right:r.right,top:r.top,bottom:r.bottom};}),
        nav:document.querySelectorAll('.scene-nav a').length,current:document.querySelectorAll('[aria-current="page"]').length
      }));
      assert.equal(layout.overflow,false,`${route}: horizontal overflow`);
      assert.equal(layout.nav,6);assert.equal(layout.current,1);
      for(const r of layout.links) assert.ok(r.x>=0&&r.right<=viewport.width&&r.top>=0&&r.bottom<=viewport.height,`${route}: navigation outside viewport`);
      if(viewport.width<=650) assert.ok(layout.scroll>0&&layout.stage>viewport.height,`${route}: mobile stage/initial scroll`);
      await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
      const first=await pixels(page);
      await page.screenshot({path:path.join(output,`${route||'home'}-${viewport.width}-t0.png`)});
      await page.evaluate(()=>window.seekScene(6));
      assert.notEqual(await pixels(page),first,`${route}: motion changes over time`);
      await page.screenshot({path:path.join(output,`${route||'home'}-${viewport.width}-t6.png`)});
      const draw=await page.evaluate(()=>{
        const values=[];for(let i=0;i<40;i++){const start=performance.now();window.seekScene(i*.11);values.push(performance.now()-start);}
        values.sort((a,b)=>a-b);return{median:values[20],p95:values[38]};
      });
      if(!route){
        assert.equal((await page.locator('link[as="image"]').getAttribute('href')).split('?')[0],'assets/yosemite-display-brush3.webp','Home preloads the expressive painting');
        const birds=await page.evaluate(()=>{
          let occupied=0,total=0,backwards=0;const last=new Map();
          for(let t=0;t<128;t+=.1){const visible=window.sceneBirdsAt(t);if(visible.length)occupied++;total++;
            const present=new Set();for(const b of visible){const k=b.flock+'-'+b.i;present.add(k);if(last.has(k)&&b.x<last.get(k)-.1)backwards++;last.set(k,b.x);}
            for(const k of last.keys())if(!present.has(k))last.delete(k);
          }return{occupancy:occupied/total,backwards};
        });
        assert.ok(birds.occupancy>=.75,`Home birds ${birds.occupancy}`);assert.equal(birds.backwards,0);
        draw.birds=birds;
      }
      assert.deepEqual(errors,[],`${route}: browser errors`);
      assert.deepEqual(guideRequests,[],`${route}: no authoring guide downloaded on normal visits`);
      report.push({route:route||'home',viewport,scroll:layout.scroll,draw});await page.close();
    }
    // Every destination must be reachable through a covered cloud transition and native Back.
    const page=await browser.newPage({viewport:sizes[0]});
    for(const oldRoute of ['experience','experience.html']){
      await page.goto(`${base}/${oldRoute}`);await page.waitForURL('**/experiences');await ready(page,'experiences');
    }
    for(const route of routes.slice(1)) {
      await page.goto(base+'/');await ready(page,'');
      await page.evaluate(()=>{
        window.coverage=[];
        new MutationObserver(()=>{if(document.documentElement.dataset.cloudPhase!=='covered')return;
          const c=document.querySelector('.cloud-curtain'),g=c.getContext('2d');
          window.coverage.push([[0,0],[c.width-1,0],[0,c.height-1],[c.width-1,c.height-1]].every(([x,y])=>g.getImageData(x,y,1,1).data[3]===255));
          sessionStorage.setItem('qa-covered',JSON.stringify(window.coverage));
        }).observe(document.documentElement,{attributes:true,attributeFilter:['data-cloud-phase']});
      });
      await page.getByRole('link',{name:route==='tech-blog'?'tech blog':route==='experiences'?'experience':route,exact:true}).click();
      await page.waitForURL(new RegExp('/'+route+'$'));await ready(page,route);
      await page.waitForFunction(()=>document.documentElement.dataset.cloudPhase==='idle');
      assert.ok(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('qa-covered')).every(Boolean)),`${route}: opaque corners`);
      assert.equal(await page.evaluate(()=>sessionStorage.getItem('postcard-cloud-arrival')),null);
      await page.goBack();await ready(page,'');
      assert.equal(await page.locator('.cloud-curtain:not([hidden])').count(),0,'Back removes curtain');
    }
    await page.close();
    // Missing live atlas retains static art; missing primary painting uses the small baked fallback.
    for(const route of routes.slice(1)) {
      const p=await browser.newPage({viewport:sizes[0]});
      await p.route(`**/assets/${sceneNames[route]}/live-v${versions[route]}.webp`,r=>r.abort());
      await p.goto(`${base}/${route}`);
      await p.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true'&&document.documentElement.dataset.sceneLive==='static');
      assert.equal(await p.locator('.scene-error').count(),0);await p.close();
      const rebuild=await browser.newPage({viewport:sizes[0]});
      await rebuild.route(`**/assets/${sceneNames[route]}/painting${versions[route]===1?'':'-v'+versions[route]}.webp`,r=>r.abort());
      await rebuild.goto(`${base}/${route}`);await ready(rebuild,route);await rebuild.close();
    }
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({passed:true,views:report.length,output,report}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
