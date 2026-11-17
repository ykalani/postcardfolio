const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SCENE_URL || 'http://127.0.0.1:5178';
const output = process.env.QA_OUTPUT || path.join(require('node:os').tmpdir(), 'postcardfolio-card-qa');
fs.mkdirSync(output, {recursive: true});
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1600,390]) {
      const page = await browser.newPage({viewport:{width,height:width===390?844:1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const route of ['', 'experiences', 'projects', 'writing', 'tech-blog']) {
        await page.goto(`${base}/${route}`);
        await page.waitForFunction(() => document.documentElement.dataset.sceneReady === 'true' && document.documentElement.dataset.cloudPhase === 'idle');
        assert.equal(await page.locator('.postcard-stage,.postcard,.postcard-return').count(),0,`${route || 'home'}: no postcard or restore button`);
        assert.equal(await page.locator('[src="postcard.js"],[href="postcard.css"]').count(),0,`${route || 'home'}: no postcard resources`);
        if (route) {
          await page.locator('.content-slip').click();
          assert.equal(await page.locator('.paper-sheet').isVisible(),true,`${route}: content stays accessible`);
          await page.keyboard.press('Escape');
        }
        await page.screenshot({path:path.join(output,`${route || 'home'}-${width}.png`)});
      }
      await page.getByRole('link',{name:'about',exact:true}).click();
      await page.waitForURL(`${base}/about`);
      await page.waitForFunction(() => document.documentElement.dataset.postcardReady === 'true');
      const card = page.locator('.postcard');
      await card.evaluate(async card => {await Promise.all(card.getAnimations().map(a=>a.finished));});
      assert.equal(await card.isVisible(),true,'About retains its open postcard');
      assert.equal(await page.locator('.about-links a').count(),15);
      await page.locator('#put-away').click();
      assert.equal(await card.isVisible(),false);
      await page.locator('#show-postcard').press('Enter');
      assert.equal(await card.isVisible(),true);
      await card.evaluate(async card => {await Promise.all(card.getAnimations().map(a=>a.finished));});
      await page.screenshot({path:path.join(output,`about-${width}.png`)});
      await page.getByRole('link',{name:'home',exact:true}).click();
      await page.waitForURL(`${base}/`);
      assert.equal(await page.locator('.postcard-stage').count(),0,'Returning home has no postcard');
      assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log(JSON.stringify({passed:true,output,checks:'About-only postcard, section content, navigation, desktop/mobile, hide/show, browser errors'}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
