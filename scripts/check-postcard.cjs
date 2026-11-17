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
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => document.documentElement.dataset.cloudPhase === 'revealing');
      assert.equal(await page.locator('.postcard').isVisible(), false, 'Card waits for the clouds');
      await page.screenshot({path: path.join(output, `clouds-${width}.png`)});
      await page.waitForFunction(() => document.documentElement.dataset.postcardReady === 'true');
      const card = page.locator('.postcard');
      assert.equal(await card.locator('.postcard-stamp img').getAttribute('src'), 'assets/pfp_stamp.webp', 'Supplied portrait stays on the stamp');
      assert.equal(await card.locator('.postcard-stamp img').evaluate(img => img.complete && img.naturalWidth > 0), true, 'Portrait stamp loads');
      await card.evaluate(card => {card.getAnimations()[0].pause();card.getAnimations()[0].currentTime = 640;});
      await page.screenshot({path: path.join(output, `flight-${width}.png`)});
      const flying = await card.boundingBox();
      await card.evaluate(card => {card.getAnimations()[0].currentTime = 1200;});
      await page.screenshot({path: path.join(output, `approach-${width}.png`)});
      const approaching = await card.boundingBox();
      await card.evaluate(card => {card.getAnimations()[0].currentTime = 1700;});
      await page.screenshot({path: path.join(output, `landed-${width}.png`)});
      const landed = await card.boundingBox();
      assert.ok(flying.x < approaching.x && approaching.x <= landed.x + 1, 'Card slides toward the center without cycling');
      assert.ok(Math.abs(landed.x + landed.width / 2 - width / 2) < 2, 'Card lands horizontally centered');
      assert.ok(landed.x >= 0 && landed.x + landed.width <= width, 'Card fits viewport');
      assert.ok(landed.width / landed.height > 1.5, 'Card has landscape postcard proportions');
      assert.equal(await page.locator('.postcard-location,.postcard-message,.postcard-subtitle,.postcard-signature,.postcard-heading').count(), 0, 'Old copy removed');
      const nav = await page.locator('.scene-nav').boundingBox();
      assert.ok(landed.y + landed.height < nav.y, 'Navigation stays clear');
      const close = page.getByRole('button', {name: 'Close postcard', exact: true});
      const closePosition = await close.boundingBox();
      assert.ok(closePosition.x < landed.x + 60 && closePosition.y < landed.y + 60, 'Close is at the top left');
      await close.click();
      assert.equal(await card.isVisible(), false);
      const folded = page.locator('#show-postcard');
      await folded.focus();
      assert.equal(await folded.evaluate(button => button === document.activeElement), true);
      assert.equal(await folded.locator('img').getAttribute('src'), 'assets/pfp_stamp.webp', 'Folded postcard keeps the supplied portrait');
      assert.equal(await folded.locator('img').evaluate(img => img.complete && img.naturalWidth > 0), true);
      const foldedPosition = await folded.boundingBox();
      assert.ok(foldedPosition.x >= 0 && foldedPosition.x + foldedPosition.width <= width, 'Folded card fits viewport');
      await page.screenshot({path: path.join(output, `folded-${width}.png`)});
      await folded.press('Enter');
      assert.equal(await card.isVisible(), true);
      assert.equal(await close.evaluate(button => button === document.activeElement), true);
      assert.deepEqual(errors, []);
      await page.close();
    }
    const locations = {
      experiences: 'Hawaiʻi Volcanoes, Hawaiʻi',
      projects: 'Great Sand Dunes, Colorado',
      writing: 'Pictured Rocks, Michigan',
      'tech-blog': 'Beaumont Tower, Michigan',
      about: 'Lake Louise, Alberta'
    };
    const institutions = {experiences:'Hawaiʻi Volcanoes National Park',projects:'Great Sand Dunes National Park',writing:'Pictured Rocks National Lakeshore','tech-blog':'Michigan State University',about:'Banff National Park'};
    for (const width of [1600, 390]) for (const [route, location] of Object.entries(locations)) {
      const page = await browser.newPage({viewport: {width, height: width === 390 ? 844 : 1000}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/${route}`);
      await page.waitForFunction(() => document.documentElement.dataset.postcardReady === 'true');
      await page.waitForFunction(() => document.documentElement.dataset.cloudPhase === 'idle');
      const card = page.locator('.postcard');
      const folded = page.locator('#show-postcard');
      assert.equal(await card.isVisible(), false, `${route}: starts collapsed`);
      assert.equal(await folded.isVisible(), true);
      assert.equal(await folded.locator('.postcard-return-place').textContent(), location);
      assert.equal(await folded.locator('img').getAttribute('src'), 'assets/pfp_stamp.webp');
      const bounds = await folded.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, `${route}: slip fits`);
      assert.equal(await folded.locator('.postcard-return-institution').textContent(), institutions[route]);
      assert.ok(await folded.evaluate(el => {
        const place = el.querySelector('.postcard-return-place'), institution = el.querySelector('.postcard-return-institution');
        const line = parseFloat(getComputedStyle(place).lineHeight);
        return place.offsetHeight <= line + 1 && institution.offsetHeight <= line + 1 && institution.offsetTop >= place.offsetTop + place.offsetHeight;
      }), 'Location occupies exactly two lines');
      await page.screenshot({path: path.join(output, `${route}-${width}-slip.png`)});
      await folded.focus();
      await folded.press('Enter');
      await card.evaluate(async card => {await Promise.all(card.getAnimations().map(animation => animation.finished));});
      assert.equal(await card.isVisible(), true);
      assert.equal(await card.locator('.postcard-location').count(), route==='about'?1:0, 'About keeps its profile-card heading');
      assert.equal(await folded.evaluate(el=>getComputedStyle(el).backgroundSize),'240px 240px','Compact postcard retains its paper texture');
      await page.screenshot({path: path.join(output, `${route}-${width}-open.png`)});
      await page.getByRole('button', {name: 'Close postcard', exact: true}).click();
      assert.equal(await folded.evaluate(button => button === document.activeElement), true);
      if (route === 'about') {
        assert.equal(await page.locator('.content-slip,.paper-sheet').count(), 0);
        await folded.click();
        assert.equal(await page.locator('.about-links a').count(), 15);
      } else {
        await page.locator('.content-slip').click();
        assert.equal(await page.locator('.paper-sheet').isVisible(), true, `${route}: content remains accessible`);
        await page.keyboard.press('Escape');
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
    console.log(JSON.stringify({passed: true, output, checks: 'cloud ordering, flight, centering, mobile fit, hide/show, section slips and locations, keyboard focus, content panels, navigation home, cloud fallback'}));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode = 1;});
