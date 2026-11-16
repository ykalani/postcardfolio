// Reuse an installed Playwright via PLAYWRIGHT_MODULE; no browser dependency ships to visitors.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const scenes = [['projects', 'hawaii-volcanoes'], ['experience', 'great-sand-dunes'], ['writing', 'olympic'], ['about', 'sleeping-bear']].filter(([route]) => !process.argv[2] || process.argv[2] === route);
(async () => {
  const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined});
  try {
    for (const [route, scene] of scenes) {
      const page = await browser.newPage({viewport: {width:1600, height:1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${process.env.SCENE_URL || 'http://127.0.0.1:5178'}/${route}?repaint=1`);
      await page.waitForFunction(() => document.documentElement.dataset.sceneReady === 'true', null, {timeout:90000});
      if (errors.length) throw new Error(errors.join('\n'));
      const data = await page.evaluate(() => window.exportPainting());
      const target = path.join('assets', scene, 'painting.webp');
      fs.writeFileSync(target, Buffer.from(data.split(',')[1], 'base64'));
      const assets=await page.evaluate(()=>window.exportSceneAssets());
      fs.writeFileSync(path.join('assets',scene,'live-v1.json'),JSON.stringify(assets.metadata));
      fs.writeFileSync(path.join('assets',scene,'live-v1.webp'),Buffer.from(assets.atlas.split(',')[1],'base64'));
      fs.writeFileSync(path.join('assets',scene,'fallback.webp'),Buffer.from(assets.fallback.split(',')[1],'base64'));
      console.log(`${target}: ${fs.statSync(target).size} bytes; live atlas ${Buffer.from(assets.atlas.split(',')[1],'base64').length} bytes`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
