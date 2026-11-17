const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SCENE_URL || 'http://127.0.0.1:5178';
const output = path.join(require('node:os').tmpdir(), 'postcardfolio-card-qa');
fs.mkdirSync(output, {recursive: true});
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1600, 390]) {
      const page = await browser.newPage({viewport: {width, height: width === 390 ? 844 : 1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.waitForFunction(() => document.documentElement.dataset.cloudPhase === 'revealing');
      assert.equal(await page.locator('.postcard').isVisible(), false, 'Card waits for the clouds');
      await page.screenshot({path: path.join(output, `clouds-${width}.png`)});
      await page.waitForFunction(() => document.documentElement.dataset.postcardReady === 'true');
      const card = page.locator('.postcard');
      await card.evaluate(card => {card.getAnimations()[0].pause();card.getAnimations()[0].currentTime = 640;});
      await page.screenshot({path: path.join(output, `flight-${width}.png`)});
      const flying = await card.boundingBox();
      const continuity = await card.evaluate(card => {
        const animation = card.getAnimations()[0];
        const position = time => {
          animation.currentTime = time;
          const matrix = new DOMMatrix(getComputedStyle(card).transform);
          return [matrix.m41, matrix.m42];
        };
        return [800, 1600, 2400].map(time => {
          const before = position(time - 8), at = position(time), after = position(time + 8);
          const incoming = at.map((v, i) => v - before[i]);
          const outgoing = after.map((v, i) => v - at[i]);
          return Math.hypot(...incoming.map((v, i) => v - outgoing[i])) / Math.hypot(...incoming);
        });
      });
      assert.ok(continuity.every(change => change < .12), `Loop velocity stays continuous: ${continuity}`);
      const loop = [];
      for (const [label, time] of [['loop-top', 1200], ['loop-bottom', 2000]]) {
        await card.evaluate((card, time) => {card.getAnimations()[0].currentTime = time;}, time);
        await page.screenshot({path: path.join(output, `${label}-${width}.png`)});
        const box = await card.boundingBox();
        loop.push(box.y + box.height / 2);
      }
      assert.ok(loop[1] - loop[0] > 150, 'Flight loops from above to below the landing point');
      await card.evaluate(card => {card.getAnimations()[0].currentTime = 3200;});
      await page.screenshot({path: path.join(output, `landed-${width}.png`)});
      const landed = await card.boundingBox();
      assert.ok(flying.x < landed.x - 50, 'Card slides across the scene');
      assert.ok(Math.abs(landed.x + landed.width / 2 - width / 2) < 2, 'Card lands horizontally centered');
      assert.ok(landed.x >= 0 && landed.x + landed.width <= width, 'Card fits viewport');
      assert.ok(landed.width / landed.height > 1.5, 'Card has landscape postcard proportions');
      assert.equal(await page.locator('.postcard-message,.postcard-subtitle,.postcard-signature,.postcard-heading').count(), 0, 'Old copy removed');
      const nav = await page.locator('.scene-nav').boundingBox();
      assert.ok(landed.y + landed.height < nav.y, 'Navigation stays clear');
      if (width === 390) {
        assert.equal(await page.getByRole('button', {name: 'Enjoy the view'}).isVisible(), false);
        assert.equal((await card.innerText()).replace(/\s+/g, ' ').trim(), 'place stamp here Yash Kalani');
      } else {
        await page.getByRole('button', {name: 'Enjoy the view'}).click();
        assert.equal(await card.isVisible(), false);
        await page.getByRole('button', {name: 'A postcard from Yash'}).click();
        assert.equal(await card.isVisible(), true);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    const page = await browser.newPage();
    await page.goto(base + '/projects');
    await page.waitForFunction(() => document.documentElement.dataset.sceneReady === 'true');
    await page.getByRole('link', {name: 'home', exact: true}).click();
    await page.waitForURL(base + '/');
    await page.waitForFunction(() => document.documentElement.dataset.postcardReady === 'true');
    assert.equal(await page.locator('.postcard').isVisible(), true, 'Card arrives after navigation home');
    await page.route('**/cloud-curtain-p1.webp', route => route.abort());
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.postcardReady === 'true');
    assert.equal(await page.locator('.postcard').isVisible(), true, 'Cloud failure keeps card available');
    console.log(JSON.stringify({passed: true, output, checks: 'cloud ordering, flight, centering, mobile fit, hide/show, navigation home, cloud fallback'}));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode = 1;});
