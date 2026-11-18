const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SCENE_URL || 'http://127.0.0.1:5178';
const output = process.env.QA_OUTPUT || path.join(require('node:os').tmpdir(), 'postcardfolio-card-qa');
fs.mkdirSync(output, {recursive:true});
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1600,390]) {
      const page = await browser.newPage({viewport:{width,height:width===390?844:1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const route of ['', 'about']) {
        await page.goto(`${base}/${route}`);
        await page.waitForFunction(() => document.documentElement.dataset.postcardReady === 'true' && document.documentElement.dataset.cloudPhase === 'idle');
        const card = page.locator('.postcard');
        await card.evaluate(async el => {await Promise.all(el.getAnimations().map(a=>a.finished));});
        assert.equal(await card.isVisible(),true,`${route || 'home'}: postcard opens in front`);
        assert.equal(await card.locator('h2').innerText(),'Yash Kalani');
        assert.equal(await card.locator('.postcard-stamp img').count(),1);
        assert.equal(await card.locator('.about-bio').count(),0);
        assert.equal(await page.locator('.content-slip').count(),0);
        if (route === 'about') assert.equal(await card.locator('.about-links a').count(),15);
        else assert.equal(await card.locator('p').count(),0,'Home has no biography');
        const box = await card.boundingBox();
        assert.ok(box.x>=0&&box.x+box.width<=width&&box.y>=0&&box.y+box.height<page.viewportSize().height,'Card fits the viewport');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        assert.equal(await page.locator('#put-away').evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===el;}),true,'Close control is in front');
        await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
        await page.screenshot({path:path.join(output,`${route || 'home'}-${width}-t0.png`)});
        await page.evaluate(()=>window.seekScene(6));
        await page.screenshot({path:path.join(output,`${route || 'home'}-${width}-t6.png`)});
        await page.locator('#put-away').click();
        assert.equal(await card.isVisible(),false);
        assert.equal(await page.locator('#show-postcard').evaluate(el=>el===document.activeElement),true);
        await page.locator('#show-postcard').press('Enter');
        assert.equal(await card.isVisible(),true);
        assert.equal(await page.locator('#put-away').evaluate(el=>el===document.activeElement),true);
      }
      await page.getByRole('link',{name:'home',exact:true}).click();
      await page.waitForURL(`${base}/`);
      await page.waitForFunction(()=>document.documentElement.dataset.postcardReady==='true');
      assert.equal(await page.locator('.postcard').isVisible(),true,'Navigation home restores its postcard');
      assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log(JSON.stringify({passed:true,output,checks:'Home and About postcards, 15 profiles without biography, foreground controls, desktop/mobile fit, motion screenshots, hide/show, focus and navigation'}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
