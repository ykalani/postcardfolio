import {startScene} from './scene-painter.js';
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const blossom = (r, g, b) => clamp((r - g - 3) / 19) * clamp((b - g + 7) / 17) * clamp((r - 90) / 70) * clamp((b - r * .65) / 28);
const needle = (r, g, b) => clamp((g - r * .99 - 1) / 18) * clamp((g - b * 1.03) / 16) * clamp((205 - g) / 55);

function paintedFoliage(painting, pixels, W, region) {
  const layer = document.createElement('canvas'); layer.width = region.w; layer.height = region.h;
  const c = layer.getContext('2d');
  c.drawImage(painting, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
  const image = c.getImageData(0, 0, region.w, region.h);
  for (let y = 0; y < region.h; y++) for (let x = 0; x < region.w; x++) {
    const local = (y * region.w + x) * 4;
    const at = ((region.y + y) * W + region.x + x) * 4;
    const r = pixels[at], g = pixels[at + 1], b = pixels[at + 2];
    const edge = Math.min(x, y, region.w - x - 1, region.h - y - 1);
    const material = region.kind === 'blossom' ? blossom(r, g, b) : needle(r, g, b);
    // Only original petals or needles move; architecture, woody stems, and bright sky are absent.
    image.data[local + 3] *= material * clamp(edge / 13);
  }
  c.putImageData(image, 0, 0);
  return {...region, layer};
}

function prepare({painting, pixels, W}) {
  const foliage = [
    {kind:'blossom',x:229,y:34,w:278,h:283,anchorX:345,anchorY:40,strength:.85,phase:.1},
    {kind:'blossom',x:411,y:139,w:194,h:271,anchorX:462,anchorY:138,strength:.65,phase:1.3},
    {kind:'blossom',x:18,y:155,w:250,h:354,anchorX:45,anchorY:174,strength:.85,phase:2.1},
    {kind:'blossom',x:969,y:0,w:380,h:297,anchorX:1319,anchorY:110,strength:.85,phase:1.1},
    {kind:'blossom',x:1079,y:270,w:366,h:348,anchorX:1402,anchorY:360,strength:1,phase:2.5},
    {kind:'blossom',x:1368,y:453,w:232,h:287,anchorX:1490,anchorY:467,strength:1.05,phase:3.3},
    {kind:'blossom',x:925,y:636,w:360,h:309,anchorX:1255,anchorY:711,strength:1.1,phase:4.3},
    {kind:'needle',x:65,y:362,w:298,h:349,anchorX:223,anchorY:434,strength:.72,phase:.4},
    {kind:'needle',x:286,y:466,w:325,h:310,anchorX:333,anchorY:579,strength:.8,phase:2.2},
    {kind:'needle',x:435,y:661,w:248,h:216,anchorX:522,anchorY:720,strength:.7,phase:3.8},
    {kind:'needle',x:824,y:89,w:270,h:329,anchorX:1007,anchorY:119,strength:.5,phase:4.8},
    {kind:'needle',x:1261,y:660,w:339,h:306,anchorX:1515,anchorY:799,strength:.7,phase:5.9},
  ].map(region => paintedFoliage(painting, pixels, W, region));
  return {foliage};
}

function draw({ctx, t, state, wind}) {
  for (const branch of state.foliage) {
    const delayed = t - branch.x * .0013;
    const gust = Math.sin(delayed * .73) * .47 + wind * .5;
    const rustle = Math.sin(t * 2.6 + branch.phase) * .085 + Math.sin(t * 4.1 + branch.phase * 2) * .035;
    const bend = (gust + rustle) * branch.strength;
    ctx.save(); ctx.translate(branch.anchorX, branch.anchorY);
    // A shear pivots the photographed cluster around its fixed woody attachment.
    ctx.transform(1, 0, bend * .016, 1, 0, 0);
    ctx.rotate(bend * .0025);
    ctx.globalAlpha = .93;
    ctx.drawImage(branch.layer, branch.x - branch.anchorX, branch.y - branch.anchorY);
    ctx.restore();
  }
}

startScene({
  liveVersion:2,
  id:'beaumont', guide:'assets/beaumont/guide.webp', cache:'assets/beaumont/painting-v2.webp',
  background:'#7b8d72', focusX:.445, focusY:.47, initialScroll:.25,
  grade:(r, g, b, x, y) => {
    const light = r * .3 + g * .55 + b * .15;
    let color = [r * .87 + light * .06 + 12, g * .87 + light * .06 + 12, b * .84 + light * .08 + 12];
    return color;
  },
  angle:(x, y) => x > 545 && x < 850 && y > 70 && y < 920 ? 1.56 : -.7 + Math.sin(x * .015 + y * .008) * .55,
  prepare, draw,
});
