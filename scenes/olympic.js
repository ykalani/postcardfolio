import { startScene } from './scene-painter.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
function canvas(width, height) {
  const layer = document.createElement('canvas');
  layer.width = width; layer.height = height;
  return layer;
}

function paintedFronds(painting, pixels, region, W) {
  const layer = canvas(region.w, region.h), ctx = layer.getContext('2d');
  ctx.drawImage(painting, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
  const image = ctx.getImageData(0, 0, region.w, region.h);
  for (let y = 0; y < region.h; y++) for (let x = 0; x < region.w; x++) {
    const local = (y * region.w + x) * 4;
    const at = ((region.y + y) * W + region.x + x) * 4;
    const r = pixels[at], g = pixels[at + 1], b = pixels[at + 2];
    const ellipse = ((x / region.w - .5) / .5) ** 2 + ((y / region.h - .5) / .55) ** 2;
    const feather = clamp((1 - ellipse) * 4, 0, 1);
    // Only real green fronds or moss move; their woody support remains in the base painting.
    const leaf = clamp((g - r * .96 - 3) / 22, 0, 1) * clamp((g - b * .91) / 17, 0, 1);
    image.data[local + 3] *= feather * leaf;
  }
  ctx.putImageData(image, 0, 0);
  return { ...region, layer };
}

function forestMist(region, pixels, random, W) {
  const layer = canvas(region.w, region.h), c = layer.getContext('2d');
  for (let i = 0; i < 1400; i++) {
    const x = random() * region.w, y = random() * region.h;
    const envelope = Math.sin(x / region.w * Math.PI) * Math.sin(y / region.h * Math.PI);
    c.strokeStyle = `rgba(162,184,163,${envelope * (.018 + random() * .035)})`;
    c.lineWidth = 1 + random() * 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y);
    c.quadraticCurveTo(x + 18, y - 2, x + 30 + random() * 75, y - 1); c.stroke();
  }
  const image = c.getImageData(0, 0, region.w, region.h);
  for (let y = 0; y < region.h; y++) for (let x = 0; x < region.w; x++) {
    const at = ((y + region.y) * W + x + region.x) * 4;
    const light = pixels[at] * .3 + pixels[at + 1] * .55 + pixels[at + 2] * .15;
    // Humidity settles in recesses; lit moss and the near log retain their texture and contrast.
    image.data[(y * region.w + x) * 4 + 3] *= clamp((120 - light) / 90, 0, 1);
  }
  c.putImageData(image, 0, 0);
  return { ...region, layer };
}

function prepare({ painting, pixels, random, W, H }) {
  const sourcePixels = pixels.data || pixels;
  const fronds = [
    { x: 574, y: 708, w: 162, h: 185, strength: 1.15, phase: .2 },
    { x: 692, y: 753, w: 176, h: 149, strength: 1, phase: 1.3 },
    { x: 603, y: 808, w: 134, h: 115, strength: .85, phase: 2.1 },
    { x: 1390, y: 821, w: 182, h: 177, strength: 1.05, phase: 1.7 },
    { x: 1435, y: 739, w: 146, h: 145, strength: .8, phase: 2.7 },
    { x: 129, y: 94, w: 178, h: 201, strength: .8, phase: 2.8 },
    { x: 230, y: 189, w: 150, h: 135, strength: .55, phase: 4 },
    { x: 950, y: 390, w: 185, h: 160, strength: .45, phase: 3.7 },
    { x: 708, y: 103, w: 235, h: 181, strength: .6, phase: 4.5 },
    { x: 1031, y: 154, w: 204, h: 169, strength: .5, phase: 5.8 },
    { x: 427, y: 476, w: 90, h: 130, strength: .55, phase: 1.8, hanging: true },
    { x: 632, y: 512, w: 104, h: 177, strength: .65, phase: 3.2, hanging: true },
    { x: 879, y: 527, w: 114, h: 151, strength: .5, phase: 5.3, hanging: true }
  ].map(region => paintedFronds(painting, sourcePixels, region, W));

  const mist = [
    { x: 540, y: 520, w: 710, h: 172, phase: 0 },
    { x: 42, y: 653, w: 620, h: 146, phase: 2 }
  ].map(region => forestMist(region, sourcePixels, random, W));

  const glancingLight = [
    { x: 497, y: 178, w: 225, h: 175, phase: 0 },
    { x: 781, y: 368, w: 238, h: 168, phase: 1.8 },
    { x: 927, y: 481, w: 202, h: 179, phase: 3.7 },
    { x: 355, y: 386, w: 172, h: 172, phase: 5.1 }
  ].map(region => {
    const layer = canvas(region.w, region.h), light = layer.getContext('2d');
    for (let i = 0; i < 1800; i++) {
      const x = random() * region.w | 0, y = random() * region.h | 0;
      const at = ((region.y + y) * W + region.x + x) * 4;
      const r = sourcePixels[at], g = sourcePixels[at + 1], b = sourcePixels[at + 2];
      if (g < r * 1.08 || g < b * 1.08 || g < 65 || g > 190) continue;
      const feather = Math.sin(x / region.w * Math.PI) * Math.sin(y / region.h * Math.PI);
      light.strokeStyle = `rgba(${Math.min(225, r + 45)},${Math.min(237, g + 43)},${Math.min(173, b + 29)},${feather * .28})`;
      light.lineWidth = .45 + random() * .6;
      light.beginPath(); light.moveTo(x, y); light.lineTo(x + .8 + random() * 2.5, y - 1 - random() * 2.4); light.stroke();
    }
    return { ...region, layer };
  });

  // Each drop leaves a photographed moss fringe and ends at a fixed lower moss/wood surface.
  const drips = [
    { x: 448, y: 541, end: 710, phase: .1, period: 5.9 },
    { x: 674, y: 598, end: 780, phase: 2.9, period: 7.3 },
    { x: 932, y: 648, end: 812, phase: 4.5, period: 6.7 },
    { x: 1003, y: 665, end: 751, phase: 1.3, period: 8.1 },
    { x: 285, y: 391, end: 493, phase: 3.4, period: 8.7 }
  ];
  return { fronds, mist, drips, glancingLight };
}

function draw({ ctx, t, state, wind }) {
  if (!state) return;
  ctx.save();
  for (const mist of state.mist) {
    ctx.globalAlpha = .21 + Math.sin(t * .19 + mist.phase) * .045;
    ctx.drawImage(mist.layer, mist.x + Math.sin(t * .15 + mist.phase) * 7, mist.y + Math.sin(t * .1) * 2);
  }
  for (const patch of state.glancingLight) {
    ctx.globalAlpha = .15 + (Math.sin(t * .28 + patch.phase) + 1) * .065;
    ctx.drawImage(patch.layer, patch.x, patch.y);
  }
  ctx.restore();

  for (const frond of state.fronds) {
    const delay = frond.x * .0015;
    const gust = Math.sin((t - delay) * .72 + frond.phase) * .55 + wind * .45;
    const flutter = Math.sin(t * 2.15 + frond.phase * 2) * .09;
    const sway = (gust + flutter) * frond.strength;
    const anchorY = frond.hanging ? 0 : frond.h;
    ctx.save(); ctx.translate(frond.x + frond.w * .5, frond.y + anchorY);
    ctx.transform(1, 0, sway * .016, 1, 0, 0);
    ctx.globalAlpha = .9;
    ctx.drawImage(frond.layer, -frond.w * .5, -anchorY);
    ctx.restore();
  }

  ctx.lineCap = 'round';
  for (const drip of state.drips) {
    const cycle = (t + drip.phase) % drip.period;
    if (cycle < .42) {
      // A bead gathers at the fixed tip before its short accelerating fall.
      ctx.fillStyle = `rgba(207,221,200,${Math.sin(cycle / .42 * Math.PI) * .52})`;
      ctx.beginPath(); ctx.ellipse(drip.x, drip.y, .65, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    } else if (cycle < .95) {
      const progress = (cycle - .42) / .53;
      const y = drip.y + (drip.end - drip.y) * progress ** 1.8;
      const x = drip.x + wind * progress * 1.3;
      ctx.strokeStyle = `rgba(192,210,186,${Math.sin(progress * Math.PI) * .55})`; ctx.lineWidth = .9;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .15, y + 2 + progress * 5); ctx.stroke();
    } else if (cycle < 1.2) {
      const age = (cycle - .95) / .25, opacity = (1 - age) * .28;
      ctx.strokeStyle = `rgba(186,204,174,${opacity})`; ctx.lineWidth = .65;
      for (let k = -1; k <= 1; k += 2) {
        ctx.beginPath(); ctx.moveTo(drip.x, drip.end);
        ctx.lineTo(drip.x + k * (1.3 + age * 4), drip.end - Math.sin(age * Math.PI) * 2.7); ctx.stroke();
      }
    }
  }
}

startScene({
  id: 'olympic',
  guide: 'assets/olympic/guide.jpg',
  cache: 'assets/olympic/painting.webp',
  background: '#233e35',
  focusX: .48,
  focusY: .51,
  grade: (r, g, b, x, y) => {
    const light = r * .3 + g * .55 + b * .15;
    const near = clamp((y - 450) / 500, 0, 1);
    return [r * .82 + light * .13 + 8 - near * 2,
      g * .82 + light * .1 + 9 - near * 3,
      b * .76 + light * .13 + 10 - near * 2];
  },
  angle: (x, y) => y < 580 ? 1.5 + Math.sin(x * .014) * .22 : -.4 + Math.sin(x * .021) * .4,
  prepare,
  draw
});
