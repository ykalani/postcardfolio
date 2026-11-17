import assert from 'node:assert/strict';
import {readFile, access, readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const pages = ['index.html','projects.html','experiences.html','writing.html','tech-blog.html','about.html'];
const scenes = [['great-sand-dunes','guide.jpg',5],['hawaii-volcanoes','guide.jpg',5],['banff','guide.webp',5],['sleeping-bear','guide.webp',9],['beaumont','guide.webp',6]];
const scripts = ['scene.js','cloud-transition.js','postcard.js','server.mjs',
  ...(await readdir(new URL('scenes/',import.meta.url))).filter(name=>name.endsWith('.js')).map(name=>'scenes/'+name),
  ...(await readdir(new URL('scripts/',import.meta.url))).filter(name=>name.endsWith('.cjs')).map(name=>'scripts/'+name)];
for (const script of scripts) {
  const result = spawnSync(process.execPath,['--check',script],{encoding:'utf8'});
  assert.equal(result.status,0,`${script}: ${result.stderr}`);
}
for (const [scene,guide,version] of scenes) for (const file of [guide,`painting${version===1?'':'-v'+version}.webp`,`fallback${version===1?'':'-v'+version}.webp`,`live-v${version}.json`,`live-v${version}.webp`,'CREDITS.md']) {
  await access(new URL(`assets/${scene}/${file}`,import.meta.url));
}
await access(new URL('assets/yosemite-guide.jpg',import.meta.url));
await access(new URL('assets/yosemite-pine-bough.png',import.meta.url));
await access(new URL('assets/yosemite-terrain-brush3.webp',import.meta.url));
await access(new URL('assets/yosemite-display-brush3.webp',import.meta.url));
const live = JSON.parse(await readFile(new URL('assets/yosemite-live-brush3.json',import.meta.url),'utf8'));
assert.equal(live.version,2,'Yosemite live atlas schema');
assert.equal(live.skyline.length,1600,'Yosemite skyline length');
const upper=live.foreground.flatMap(group=>group.canopy).filter(patch=>patch.upper);
assert.equal(upper.length,1,'One painted upper branch');
assert.equal(upper[0].mask.length,upper[0].cols*26,'Upper branch visibility mask');
assert.ok(upper[0].mask.some(Boolean),'Upper branch has visible needles');
assert.ok(live.looseLeaves.length<=8&&live.looseLeaves.every(leaf=>leaf.x<190),'Only the pine sheds loose leaves');
for (const name of [live.atlas,...live.foreground.map(group=>group.atlas),'cloud-curtain-p1.webp']) {
  await access(new URL('assets/'+name,import.meta.url));
}
for (const page of [...pages,'credits.html']) {
  const html = await readFile(new URL(page,import.meta.url),'utf8');
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,`${page}: unique IDs`);
  if (pages.includes(page)) {
    assert.deepEqual([...html.matchAll(/data-cloud-link[^>]*>([^<]+)</g)].map(match=>match[1]),['home','experience','projects','writing','tech blog','about'],`${page}: destination order`);
    assert.equal([...html.matchAll(/data-cloud-link/g)].length,6,`${page}: six destinations`);
    assert.equal([...html.matchAll(/aria-current="page"/g)].length,1,`${page}: one current destination`);
  }
  for (const [,reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
    let target = reference.split(/[?#]/)[0];
    if (target==='./') target='index.html';
    if (/^(projects|experiences|writing|tech-blog|about)$/.test(target)) target+='.html';
    await access(new URL(target,import.meta.url));
  }
}
for (const [page,scene] of [['experiences.html','hawaii-volcanoes'],['projects.html','great-sand-dunes']]) {
  assert.ok((await readFile(new URL(page,import.meta.url),'utf8')).includes(`src="scenes/${scene}.js"`),`${page}: correct scene`);
}
console.log('Passed: script syntax, six landscape pages, credits, guides/caches, Yosemite atlases, navigation and local resources.');
