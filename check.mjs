import assert from 'node:assert/strict';
import {readFile, access, readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const pages = ['index.html','projects.html','experience.html','writing.html','about.html'];
const scenes = ['great-sand-dunes','hawaii-volcanoes','olympic','sleeping-bear'];
const scripts = ['scene.js','cloud-transition.js','server.mjs',
  ...(await readdir(new URL('scenes/',import.meta.url))).filter(name=>name.endsWith('.js')).map(name=>'scenes/'+name),
  ...(await readdir(new URL('scripts/',import.meta.url))).filter(name=>name.endsWith('.cjs')).map(name=>'scripts/'+name)];
for (const script of scripts) {
  const result = spawnSync(process.execPath,['--check',script],{encoding:'utf8'});
  assert.equal(result.status,0,`${script}: ${result.stderr}`);
}
for (const scene of scenes) for (const file of ['guide.jpg','painting.webp','fallback.webp','live-v1.json','live-v1.webp','CREDITS.md']) {
  await access(new URL(`assets/${scene}/${file}`,import.meta.url));
}
await access(new URL('assets/yosemite-guide.jpg',import.meta.url));
await access(new URL('assets/yosemite-painting.webp',import.meta.url));
await access(new URL('assets/yosemite-display-p2.webp',import.meta.url));
const live = JSON.parse(await readFile(new URL('assets/yosemite-live-p2.json',import.meta.url),'utf8'));
assert.equal(live.version,2,'Yosemite live atlas schema');
assert.equal(live.skyline.length,1600,'Yosemite skyline length');
assert.ok(live.looseLeaves.length<=8&&live.looseLeaves.every(leaf=>leaf.x<190),'Only the pine sheds loose leaves');
for (const name of [live.atlas,...live.foreground.map(group=>group.atlas),'cloud-curtain-p1.webp']) {
  await access(new URL('assets/'+name,import.meta.url));
}
for (const page of [...pages,'credits.html']) {
  const html = await readFile(new URL(page,import.meta.url),'utf8');
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,`${page}: unique IDs`);
  if (pages.includes(page)) {
    assert.equal([...html.matchAll(/data-cloud-link/g)].length,5,`${page}: five destinations`);
    assert.equal([...html.matchAll(/aria-current="page"/g)].length,1,`${page}: one current destination`);
  }
  for (const [,reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
    let target = reference.split('#')[0];
    if (target==='./') target='index.html';
    if (/^(projects|experience|writing|about)$/.test(target)) target+='.html';
    await access(new URL(target,import.meta.url));
  }
}
console.log('Passed: script syntax, five landscape pages, credits, guides/caches, Yosemite atlases, navigation and local resources.');
