const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SCENE_URL || 'http://127.0.0.1:5178';
const output = process.env.QA_OUTPUT || path.join(require('node:os').tmpdir(), 'postcardfolio-content-qa');
(async () => {
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined});
  try {
    for (const width of [1600,390]) {
      const page = await browser.newPage({viewport:{width,height:width===390?844:1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const [route,count] of [['experiences',4],['projects',4],['writing',1],['tech-blog',1],['about',0]]) {
        await page.goto(`${base}/${route}`);
        await page.waitForFunction(() => document.documentElement.dataset.sceneReady === 'true' && document.documentElement.dataset.cloudPhase === 'idle');
        if (route === 'about') {
          await page.locator('.postcard').evaluate(async el => {await Promise.all(el.getAnimations().map(a=>a.finished));});
          assert.equal(await page.locator('.about-links a').count(),15);
          assert.match(await page.locator('.about-bio').innerText(), /Michigan State University/);
          assert.equal(await page.getByRole('link',{name:'kalaniya@msu.edu',exact:true}).getAttribute('href'),'mailto:kalaniya@msu.edu');
        } else {
          await page.locator('.content-slip').click();
          await page.locator('.paper-sheet').evaluate(async el => {await Promise.all(el.getAnimations().map(a=>a.finished));});
          assert.equal(await page.locator('.paper-entry').count(),count,`${route}: all entries present`);
          if (route === 'projects') assert.equal(await page.locator('.project-tools li').count(),15);
          if (route === 'tech-blog') assert.match(await page.locator('pre').innerText(), /Hello, \$\{name\}!/);
          if (route === 'writing') assert.equal(await page.getByRole('link',{name:/Read and follow/}).getAttribute('href'),'https://substack.com/@ykalani');
        }
        const region = page.locator(route === 'about'?'.about-profiles':'.paper-content');
        assert.ok(await region.evaluate(el => el.scrollWidth <= el.clientWidth+1),`${route}: content fits at ${width}`);
        await page.screenshot({path:path.join(output,`${route}-${width}-content.png`)});
        const lastLink = region.locator('a').last();
        if (await lastLink.count()) {
          await lastLink.focus();
          assert.ok(await lastLink.evaluate(el => {const box=el.getBoundingClientRect();return box.top>=0&&box.bottom<=innerHeight;}),`${route}: last link reachable`);
        }
        if (route !== 'about') {
          await page.keyboard.press('Escape');
          await page.waitForFunction(()=>!document.querySelector('.paper-sheet').open);
          assert.equal(await page.locator('.content-slip').evaluate(el => el===document.activeElement),true);
        }
      }
      const response = await page.request.get(`${base}/assets/Yash_Kalani_Resume-AI.pdf`);
      assert.equal(response.status(),200);
      assert.equal((await response.body()).subarray(0,5).toString(),'%PDF-');
      assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log(JSON.stringify({passed:true,output,checks:'all imported entries, profile preservation, contact and writing links, code sample, résumé PDF, desktop/mobile overflow and keyboard access'}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
