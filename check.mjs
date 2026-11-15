import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

for (const path of ['assets/yosemite-guide.jpg','assets/yosemite-painting.webp']) {
  await access(new URL(path, import.meta.url));
}
const live = JSON.parse(await readFile(new URL('assets/yosemite-live-p1.json',import.meta.url),'utf8'));
assert.equal(live.version,2,'Live atlas schema');
assert.ok(live.looseLeaves.length<=8&&live.looseLeaves.every(leaf=>leaf.x<190),'Only the pine sheds loose leaves');
for(const name of [live.atlas,...live.foreground.map(group=>group.atlas),'cloud-curtain-p1.webp']){
  await access(new URL('assets/'+name,import.meta.url));
}
for (const page of ['index.html','writing.html']) {
  const html = await readFile(new URL(page, import.meta.url), 'utf8');
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: IDs must be unique`);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const target = match[1];
    if (!/^(?:https?:|mailto:|#)/.test(target)) {
      await access(new URL(target === 'writing' ? 'writing.html' : target, import.meta.url));
    }
  }
}
console.log('Passed: both pages, local assets, unique IDs, internal resource references.');
