const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SCENE_URL || 'http://127.0.0.1:5178';
const output = process.env.QA_OUTPUT || path.join(require('node:os').tmpdir(), 'postcardfolio-about-qa');
fs.mkdirSync(output, {recursive:true});
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1600,390,320,2560]) {
      const page = await browser.newPage({viewport:{width,height:width<=390?844:1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/about`);
      await page.waitForFunction(() => document.documentElement.dataset.postcardReady === 'true' && document.documentElement.dataset.cloudPhase === 'idle');
      assert.equal(await page.locator('.content-slip,.paper-sheet').count(),0);
      const card = page.locator('#postcard'), folded = page.locator('#show-postcard');
      assert.equal(await card.locator('.postcard-location').count(),0,'About keeps its current heading without added captions');
      assert.equal(await folded.evaluate(el=>getComputedStyle(el).backgroundSize),'240px 240px','Small postcard keeps its existing paper texture');
      assert.equal(await card.isVisible(),true, 'About opens by default');
      assert.equal(await folded.isVisible(),false);
      await card.evaluate(async card => {await Promise.all(card.getAnimations().map(a => a.finished));});
      const links = page.locator('.about-links a');
      assert.equal(await links.count(),15);
      assert.equal(new Set(await links.evaluateAll(links => links.map(a=>a.href))).size,15);
      assert.ok(await links.evaluateAll(links => links.every(a => a.target === '_blank' && a.rel.includes('noreferrer') && a.href.startsWith('https://'))));
      const box = await card.boundingBox(), nav = await page.locator('.scene-nav').boundingBox();
      assert.ok(box.x>=0 && box.x+box.width<=width && box.y>=0 && box.y+box.height<nav.y, `Card fits at ${width}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth>innerWidth),false);
      await page.evaluate(() => {window.pauseScene(true);window.seekScene(0);});
      await page.screenshot({path:path.join(output,`about-${width}-open-t0.png`)});
      await page.evaluate(() => window.seekScene(6));
      await page.screenshot({path:path.join(output,`about-${width}-open-t6.png`)});
      await links.last().focus();
      assert.ok(await links.last().evaluate(a => {const r=a.getBoundingClientRect(),p=a.closest('.about-profiles').getBoundingClientRect();return r.top>=p.top && r.bottom<=p.bottom+1;}),'Last link can be reached by keyboard');
      await page.screenshot({path:path.join(output,`about-${width}-last-link.png`)});
      await page.locator('#put-away').click();
      assert.equal(await card.isVisible(),false);
      assert.equal(await folded.evaluate(a => a===document.activeElement),true);
      await page.screenshot({path:path.join(output,`about-${width}-folded.png`)});
      await folded.press('Enter');
      assert.equal(await card.isVisible(),true);
      assert.equal(await page.locator('#put-away').evaluate(a => a===document.activeElement),true);
      assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log(JSON.stringify({passed:true,output,checks:'15 unique profiles, keyboard open/close, scroll reachability, viewport fit, clear navigation, motion screenshots, browser errors'}));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
