import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(ids).size,ids.length,'IDs must be unique');
for (const path of ['style.css','scene.js','assets/yosemite-guide.jpg','assets/yosemite-painting.webp']) await access(new URL(path,import.meta.url));
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (!/^(?:https?:|mailto:|#)/.test(match[1])) await access(new URL(match[1],import.meta.url));
}
console.log('Passed: local assets, scene assets, unique IDs, internal resource references.');
