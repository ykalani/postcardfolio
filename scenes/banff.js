import {startScene} from './scene-painter.js';
const W = 1600, H = 1000, WATER_TOP = 625, WATER_DEPTH = H - WATER_TOP;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
function layer(width, height) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  return canvas;
}

function prepare({painting, pixels}) {
  const water = layer(W, WATER_DEPTH), mask = layer(W, WATER_DEPTH);
  const m = mask.getContext('2d'), alpha = m.createImageData(W, WATER_DEPTH);
  const isWater = (x, y) => {
    if (x < 0 || x >= W || y < WATER_TOP || y >= H) return false;
    const at = (y * W + x) * 4, r = pixels[at], g = pixels[at + 1], b = pixels[at + 2];
    return g > 62 && b > 56 && g > r * 1.24 && b > r * 1.12 && b > g * .73 && g > b * .82;
  };
  for (let y = WATER_TOP; y < H; y++) for (let x = 0; x < W; x++) {
    if (!isWater(x, y)) continue;
    const inset = isWater(x - 4, y) && isWater(x + 4, y) && isWater(x, y - 3) && isWater(x, y + 3);
    const k = ((y - WATER_TOP) * W + x) * 4;
    alpha.data[k] = alpha.data[k + 1] = alpha.data[k + 2] = 255;
    alpha.data[k + 3] = inset ? Math.min(245, (y - WATER_TOP) * 28) : 0;
  }
  m.putImageData(alpha, 0, 0);

  const foliage = [];
  for (const region of [
    {x: 1180, y: 270, w: 145, h: 190, phase: .3},
    {x: 1290, y: 390, w: 164, h: 212, phase: 1.7},
    {x: 1442, y: 250, w: 158, h: 236, phase: 3.8},
    {x: 1440, y: 486, w: 160, h: 177, phase: 5.2},
    {x: 1167, y: 497, w: 120, h: 155, phase: 2.9}
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
  return {water, mask, foliage, painting};
}

function draw({ctx, t, state, wind}) {
  const c = state.water.getContext('2d'); c.clearRect(0, 0, W, WATER_DEPTH);
  // Warp the existing paint continuously, so strokes breathe without added wave lines or band seams.
  // Smoothly swell and drift the painted strokes themselves, without added ripple lines or band seams.
  for (let y = 0; y < WATER_DEPTH; y++) {
    const depth = y / WATER_DEPTH, phase = t * 1.25 - y * .028;
    const pulse = .65 + Math.sin(phase) * .35;
    const stretch = 1 + Math.sin(phase) * depth * .012;
    const sx = Math.sin(t * .85 + y * .018) * depth * 6 * pulse;
    const sy = clamp(WATER_TOP + y + Math.sin(phase) * depth * 1.8, WATER_TOP, H - 1);
    c.drawImage(state.painting, 0, sy, W, 1, sx - W * (stretch - 1) * .5, y, W * stretch, 1);
  }
  c.globalCompositeOperation = 'destination-in'; c.drawImage(state.mask, 0, 0);
  c.globalCompositeOperation = 'source-over'; ctx.save(); ctx.globalAlpha = .9;
  ctx.drawImage(state.water, 0, WATER_TOP); ctx.restore();

  for (const plant of state.foliage) {
    const sway = wind + Math.sin(t * 2 + plant.phase) * .14;
    ctx.save(); ctx.translate(plant.x + plant.w * .5, plant.y + plant.h);
    ctx.transform(1, 0, sway * .038, 1, 0, 0);
    ctx.drawImage(plant.sprite, -plant.w * .5, -plant.h); ctx.restore();
  }
}

startScene({
  liveVersion:5,
  id: 'banff', guide: 'assets/banff/guide.webp', cache: 'assets/banff/painting-v5.webp',
  sourceY: .78, background: '#557e83', focusX: .66, focusY: .63, initialScroll: .82,
  grade(r, g, b, x, y) {
    const light = r * .3 + g * .55 + b * .15;
    // Keep the supplied turquoise water and warm red canoes; separate shadowed rock without a gray wash.
    const near = clamp((x - 1100) / 290, 0, 1) * clamp((y - 220) / 180, 0, 1);
    const pine = near * clamp((g - r * .93) / 28, 0, 1) * clamp((g - b * 1.04) / 28, 0, 1);
    const distant = clamp((620 - y) / 260, 0, 1) * (1 - near);
    return [r * (.87 + pine * .18 - distant * .08) + light * .07 + 12 - pine * 17 + distant * 10,
      g * (.88 + pine * .19 - distant * .08) + light * .065 + 12 - pine * 10 + distant * 14,
      b * (.85 + pine * .08 - distant * .08) + light * .08 + 14 - pine * 24 + distant * 24];
  },
  angle(x, y) {return y > WATER_TOP ? -.035 : y < 610 ? 1.46 + Math.sin(x * .009) * .12 : -.9;},
  prepare, draw
});
