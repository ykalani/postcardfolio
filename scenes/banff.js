import {startScene} from './scene-painter.js';
const W = 1600, H = 1000, WATER_TOP = 470, WATER_DEPTH = H - WATER_TOP;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const snow = Array.from({length:360}, (_,i) => ({
  x:(i * 593.7 + 41) % W, y:(i * 317.3 + 29) % H,
  size:1.2 + (i * .37 % 1) * 2.2, speed:14 + (i * 7.3 % 18), phase:i * 2.4
}));
function layer(width, height) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  return canvas;
}

// Follow the lake's silhouette so pale and dark reflections move along with the turquoise paint.
const lakeMask = layer(W, WATER_DEPTH);
{
  const m = lakeMask.getContext('2d');
  const outline = [[0,534],[90,530],[170,520],[270,513],[370,500],[470,491],
    [580,486],[652,488],[665,510],[730,524],[850,532],[960,545],[1060,556],
    [1140,573],[1165,575],[1165,590],[1210,593],[1265,593],[1269,620],
    [1320,633],[1360,648],[1380,670],[1410,682],[1430,715],[1470,731],
    [1490,754],[1530,766],[1560,788],[1600,800],[1600,1000],[0,1000]];
  m.beginPath(); outline.forEach(([x,y],i)=>i?m.lineTo(x,y-WATER_TOP):m.moveTo(x,y-WATER_TOP));
  m.closePath(); m.fillStyle = '#fff'; m.fill();

}

function prepare({painting, pixels}) {
  const water = layer(W, WATER_DEPTH);

  const foliage = [];
  for (const region of [
    {x: 1440, y: 410, w: 110, h: 220, phase: .3},
    {x: 1360, y: 490, w: 105, h: 220, phase: 1.7},
    {x: 1270, y: 520, w: 95, h: 155, phase: 3.8},
    {x: 1485, y: 550, w: 115, h: 232, phase: 5.2}
  ]) {
    const sprite = layer(region.w, region.h), c = sprite.getContext('2d');
    c.drawImage(painting, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
    const image = c.getImageData(0, 0, region.w, region.h); let count = 0;
    for (let y = 0; y < region.h; y++) for (let x = 0; x < region.w; x++) {
      const at = ((region.y + y) * W + x + region.x) * 4, k = (y * region.w + x) * 4;
      const r = pixels[at], g = pixels[at + 1], b = pixels[at + 2];
      const green = g > r * 1.015 && g > b * 1.12 && g > 34;
      const edge = clamp((1 - ((x / region.w - .5) / .5) ** 2 - ((y / region.h - .5) / .53) ** 2) * 4, 0, 1);
      image.data[k + 3] *= green ? edge : 0;
      if (image.data[k + 3] > 20) count++;
    }
    c.putImageData(image, 0, 0);
    if (count > 120) foliage.push({...region, sprite});
  }
  return {water, foliage, painting};
}

function draw({ctx, t, state, wind}) {
  const c = state.water.getContext('2d'); c.clearRect(0, 0, W, WATER_DEPTH);
  // Smoothly swell and drift the painted strokes themselves, without added ripple lines or band seams.
  for (let y = 0; y < WATER_DEPTH; y++) {
    const depth = .35 + .65 * y / WATER_DEPTH, phase = t * 1.25 - y * .028;
    const pulse = .65 + Math.sin(phase) * .35;
    const stretch = 1 + Math.sin(phase) * depth * .012;
    const sx = Math.sin(t * .85 + y * .018) * depth * 6 * pulse;
    const sy = clamp(WATER_TOP + y + Math.sin(phase) * depth * 1.8, WATER_TOP, H - 1);
    c.drawImage(state.painting, 0, sy, W, 1, sx - W * (stretch - 1) * .5, y, W * stretch, 1);
  }
  c.globalCompositeOperation = 'destination-in'; c.drawImage(lakeMask, 0, 0);
  c.globalCompositeOperation = 'source-over'; ctx.save(); ctx.globalAlpha = .9;
  ctx.drawImage(state.water, 0, WATER_TOP); ctx.restore();

  for (const plant of state.foliage) {
    const sway = wind + Math.sin(t * 2 + plant.phase) * .14;
    ctx.save(); ctx.translate(plant.x + plant.w * .5, plant.y + plant.h);
    ctx.transform(1, 0, sway * .038, 1, 0, 0);
    ctx.drawImage(plant.sprite, -plant.w * .5, -plant.h); ctx.restore();
  }

  // Broken dabs of pale pigment drift behind the foreground cutouts.
  ctx.save(); ctx.fillStyle = '#edf1e9';
  for (const flake of snow) {
    const x = ((flake.x + t * 2.5 + Math.sin(t * .3 + flake.phase) * 12) % (W + 40)) - 20;
    const y = ((flake.y + t * flake.speed) % (H + 40)) - 20, s = flake.size;
    ctx.globalAlpha = .4 + .22 * Math.sin(flake.phase);
    ctx.beginPath(); ctx.moveTo(x - s, y - s * .3); ctx.lineTo(x + s * .45, y - s);
    ctx.lineTo(x + s * .8, y + s * .8); ctx.lineTo(x - s * .4, y + s * 1.6);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

startScene({
  liveVersion:7,
  id: 'banff', guide: 'assets/banff/lake-lousie.avif', cache: 'assets/banff/painting-v7.webp',
  sourceY: .5, background: '#557e83', focusX: .55, focusY: .5, initialScroll: .5,
  grade(r, g, b, x, y) {
    const light = r * .3 + g * .55 + b * .15;
    // Keep warm summit light and cool lake reflections, with deeper near-forest pigment.
    const near = clamp((x - 1160) / 360, 0, 1) * clamp((y - 340) / 250, 0, 1);
    const pine = near * clamp((g - r * .93) / 28, 0, 1) * clamp((g - b * 1.04) / 28, 0, 1);
    return [r * (.9 - pine * .09) + light * .035 + 5 - pine * 7,
      g * (.9 + pine * .04) + light * .035 + 6,
      b * (.9 - pine * .08) + light * .035 + 8 - pine * 6];
  },
  angle(x, y) {return y > WATER_TOP && x < 1250 ? -.035 : y < 160 ? .04 : 1.46 + Math.sin(x * .009) * .12;},
  async refine({ctx, pixels, random}) {
    const {paintBrushwork} = await import('./brush-painting.js');
    // Smaller dry-brush accents describe rock and trees while leaving broad sky and water paint intact.
    await paintBrushwork({ctx, pixels, random, width:W, height:H, scale:.72,
      angle:(x,y)=>1.46 + Math.sin(x * .009) * .12,
      skip(x,y) {
        if (y < 160 || y > 800 || (y > 470 && x < 1250)) return true;
        const at = (y * W + x) * 4;
        const neighbor = (Math.min(H - 1, y + 4) * W + Math.min(W - 1, x + 4)) * 4;
        return Math.abs(pixels[at] - pixels[neighbor]) + Math.abs(pixels[at+1] - pixels[neighbor+1]) + Math.abs(pixels[at+2] - pixels[neighbor+2]) < 85;
      }
    });
  },
  prepare, draw
});
