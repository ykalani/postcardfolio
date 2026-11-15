// Run against the local dev server. PLAYWRIGHT_MODULE may point to an existing Playwright installation.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1000}});
    await page.goto((process.env.SCENE_URL||'http://localhost:5173/')+'?bake=1',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true',null,{timeout:90000});
    const assets=await page.evaluate(()=>window.exportSceneAssets());
    const curtain=await page.evaluate(()=>window.exportCloudCurtain());
    const write=(name,data)=>fs.writeFileSync(path.join('assets',name),Buffer.from(data.split(',')[1],'base64'));
    write('yosemite-display-p1.webp',assets.display);
    for(const [name,data] of Object.entries(assets.atlases))write(name,data);
    write('cloud-curtain-p1.webp',curtain);
    fs.writeFileSync('assets/yosemite-live-p1.json',JSON.stringify(assets.metadata));
    console.log(JSON.stringify({canopy:assets.metadata.foreground.reduce((sum,group)=>sum+group.canopy.length,0),looseLeaves:assets.metadata.looseLeaves.length,
      files:['yosemite-display-p1.webp',...Object.keys(assets.atlases),'cloud-curtain-p1.webp','yosemite-live-p1.json'].map(name=>({name,bytes:fs.statSync('assets/'+name).size}))}));
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
