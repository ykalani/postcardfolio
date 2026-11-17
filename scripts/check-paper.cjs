const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SCENE_URL || 'http://127.0.0.1:5178';
const output = path.join(require('node:os').tmpdir(), 'postcardfolio-paper-qa');
fs.mkdirSync(output, {recursive: true});

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1600, 390]) {
      const page = await browser.newPage({viewport: {width, height: width === 390 ? 844 : 1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      assert.equal(await page.locator('.content-slip').count(), 0, 'Home has no content slip');
      for (const route of ['experiences', 'projects', 'writing', 'tech-blog', 'about']) {
        await page.goto(`${base}/${route}`);
        await page.waitForFunction(() => document.documentElement.dataset.sceneReady === 'true');
        const slip = page.locator('.content-slip');
        const sheet = page.locator('.paper-sheet');
        const close = page.getByRole('button', {name: 'Collapse paper'});
        const folded = await slip.boundingBox();
        const nav = await page.locator('.scene-nav').boundingBox();
        assert.ok(Math.abs(folded.width - Math.min(280, width - 96)) < 2, 'Slip has receipt proportions');
        assert.ok(folded.y < page.viewportSize().height && folded.y + folded.height > page.viewportSize().height, 'Receipt peeks up from below the viewport');
        assert.ok(nav.y + nav.height < folded.y, 'Navigation clears receipt');
        await page.screenshot({path: path.join(output, `${route}-${width}-slip.png`)});
        await slip.click();
        const menu = page.locator('.scene-nav');
        if (route === 'projects') {
          await menu.evaluate(el => el.getAnimations({subtree: true}).forEach(a => {a.pause(); a.currentTime = 250;}));
          await page.screenshot({path: path.join(output, `${route}-${width}-menu-rolling.png`)});
          await menu.evaluate(el => el.getAnimations({subtree: true}).forEach(a => a.play()));
        }
        await menu.evaluate(async el => {await Promise.all(el.getAnimations({subtree: true}).map(a => a.finished));});
        assert.equal(await menu.evaluate(el => getComputedStyle(el).clipPath), 'inset(0px 0px 0px 100%)', 'Menu rolls completely away while paper is open');
        if (route === 'projects') {
          await sheet.evaluate(el => {
            for (const animation of el.getAnimations()) {animation.pause(); animation.currentTime = 250;}
          });
          const middle = await sheet.boundingBox();
          assert.ok(middle.height > folded.height && middle.height < page.viewportSize().height, 'Paper expands through intermediate sizes');
          await page.screenshot({path: path.join(output, `${route}-${width}-unfolding.png`)});
          await sheet.evaluate(el => el.getAnimations().forEach(a => a.play()));
        }
        await sheet.evaluate(async el => {await Promise.all(el.getAnimations().map(a => a.finished));});
        assert.equal(await slip.getAttribute('aria-expanded'), 'true');
        const full = await sheet.boundingBox();
        assert.ok(full.x >= 20 && full.x + full.width <= width - 20, 'Painting stays visible on both sides');
        assert.ok(Math.abs(full.y + full.height - page.viewportSize().height) < 2, 'Panel grows from bottom edge');
        assert.ok(full.y > 0 && full.height > page.viewportSize().height * .8, 'Tall panel keeps painting visible above');
        await page.screenshot({path: path.join(output, `${route}-${width}-expanded.png`)});
        const before = await close.boundingBox();
        await page.locator('.paper-content').evaluate(el => {
          const filler = document.createElement('p');
          filler.textContent = 'Scroll verification. '.repeat(1000);
          el.append(filler);
          el.scrollTop = el.scrollHeight;
        });
        assert.ok(await page.locator('.paper-content').evaluate(el => el.scrollTop > 0), 'Content scrolls');
        assert.deepEqual(await close.boundingBox(), before, 'Down arrow stays in place while scrolling');
        await page.screenshot({path: path.join(output, `${route}-${width}-scrolled.png`)});
        await close.click();
        await page.waitForFunction(() => !document.querySelector('.paper-sheet').open);
        assert.equal(await slip.getAttribute('aria-expanded'), 'false');
        assert.equal(await slip.evaluate(el => el === document.activeElement), true, 'Focus returns to slip');
        await menu.evaluate(async el => {await Promise.all(el.getAnimations({subtree: true}).map(a => a.finished));});
        assert.ok(await menu.evaluate(el => [...el.querySelectorAll('a')].every(link => {
          const rect = link.getBoundingClientRect();
          return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('a') === link;
        })), 'Every menu link is reachable after paper closes');
        await slip.press('Enter');
        await sheet.evaluate(async el => {await Promise.all(el.getAnimations().map(a => a.finished));});
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('.paper-sheet').open);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(JSON.stringify({passed: true, output, checks: 'all five pages, home exclusion, receipt proportions, bottom-anchored expansion with visible painting, scrolling, persistent arrow, collapse, keyboard and focus'}));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode = 1;});
