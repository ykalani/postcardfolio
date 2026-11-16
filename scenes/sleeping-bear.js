import {startScene} from './scene-painter.js';

const SUN_X = 926, HORIZON = 598;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function prepare({painting, pixels, random, W, H}) {
  const water = document.createElement('canvas'); water.width = W; water.height = H;
  const mask = document.createElement('canvas'); mask.width = W; mask.height = H;
  const m = mask.getContext('2d'), alpha = m.createImageData(W, H);
  const isLand = (x, y) => {
    if (y < 820 || x < 1250 + (1000 - y) * 1.6) return false;
    const at = (y * W + x) * 4, r = pixels[at], g = pixels[at + 1], b = pixels[at + 2];
    return Math.max(r, g, b) < 112 || b < g * .72 || g < r * .66;
  };
  // The lake mask follows the photographed vegetation, not a rectangular wave overlay.
  for (let y = HORIZON + 3; y < H; y++) for (let x = 0; x < W; x++) {
    if (isLand(x, y)) continue;
    const at = (y * W + x) * 4;
    alpha.data[at] = alpha.data[at + 1] = alpha.data[at + 2] = 255;
    alpha.data[at + 3] = Math.min(255, (y - HORIZON - 2) * 45);
  }
  m.putImageData(alpha, 0, 0);

  const wavelets = Array.from({length: 310}, () => {
    const depth = random();
    const x = random() * W, y = HORIZON + 5 + depth * (H - HORIZON - 6);
    const at = ((y | 0) * W + (x | 0)) * 4;
    return {x, y, depth, length: 2 + random() * (3 + depth * 28), phase: random() * Math.PI * 2,
      color: [pixels[at], pixels[at + 1], pixels[at + 2]], bright: random() > .4};
  });
  // A tapered band of broken crests stays beneath the real sun. Every choice is cached.
  const reflection = Array.from({length: 235}, () => ({
    depth: random(), side: (random() + random() - 1) * .5,
    length: random(), phase: random() * Math.PI * 2,
  }));
  const foliage = [];
  for (const region of [{x:1374,y:835,w:226,h:165}, {x:1240,y:960,w:150,h:40}]) {
    const layer = document.createElement('canvas'); layer.width = region.w; layer.height = region.h;
    const c = layer.getContext('2d');
    c.drawImage(painting, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
    const cut = c.getImageData(0, 0, region.w, region.h);
    for (let y = 0; y < region.h; y++) for (let x = 0; x < region.w; x++) {
      const at = (y * region.w + x) * 4;
      const edge = Math.min(x, region.w - x - 1, y, region.h - y - 1);
      cut.data[at + 3] *= isLand(x + region.x, y + region.y) ? clamp(edge / 9, 0, 1) : 0;
    }
    c.putImageData(cut, 0, 0); foliage.push({...region, layer});
  }
  return {water, mask, wavelets, reflection, foliage, painting};
}

function draw({ctx, t, state, W, H, wind}) {
  const c = state.water.getContext('2d'); c.clearRect(0, 0, W, H);
  // Several long wave trains cross the painted surface. Distant water barely moves.
  for (let y = HORIZON + 3; y < H; y += 3) {
    const depth = (y - HORIZON) / (H - HORIZON);
    const phase = y * .065 - t * 1.08;
    const dx = (Math.sin(phase) + Math.sin(y * .023 + t * .46) * .35) * depth * 2.7;
    const sy = clamp(y + Math.sin(y * .043 - t * .86) * depth * 1.4, HORIZON + 3, H - 3);
    c.drawImage(state.painting, 0, sy, W, 3, dx, y, W, 3);
  }
  c.lineCap = 'round';
  for (const wave of state.wavelets) {
    const crest = .5 + .5 * Math.sin(t * (.7 + wave.depth * .3) - wave.y * .052 + wave.phase);
    const x = wave.x + Math.sin(t * .6 + wave.phase) * wave.depth * 2.5;
    const y = wave.y + Math.sin(t * .82 + wave.phase) * wave.depth * .7;
    const value = wave.bright ? 23 : -23;
    const [r, g, b] = wave.color.map(channel => clamp(channel + value, 0, 255));
    c.strokeStyle = `rgba(${r},${g},${b},${(.025 + wave.depth * .08) * crest})`;
    c.lineWidth = .45 + wave.depth * .7;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + wave.length * .5, y - .4, x + wave.length, y); c.stroke();
  }
  for (const mark of state.reflection) {
    const depth = mark.depth, y = HORIZON + 5 + depth * (H - HORIZON - 7);
    const pathWidth = 9 + depth * 118;
    const x = SUN_X + depth * 22 + mark.side * pathWidth + Math.sin(t * .74 + mark.phase) * depth * 5;
    const light = (.045 + .12 * (.5 + .5 * Math.sin(t * .95 - y * .045 + mark.phase))) * (1 - Math.abs(mark.side));
    c.strokeStyle = `rgba(255,202,135,${light})`; c.lineWidth = .4 + depth * 1.2;
    const length = 1 + mark.length * (3 + depth * 21);
    c.beginPath(); c.moveTo(x - length * .5, y); c.lineTo(x + length * .5, y - .15); c.stroke();
  }
  c.globalCompositeOperation = 'destination-in'; c.drawImage(state.mask, 0, 0);
  c.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.globalAlpha = .6; ctx.drawImage(state.water, 0, 0); ctx.restore();

  // Shear increases toward the branch tips; the cutout's base remains anchored.
  for (const plant of state.foliage) {
    const sway = (wind + Math.sin(t * 2.1 + plant.x * .01) * .13) * .011;
    ctx.save(); ctx.translate(plant.x, plant.y + plant.h); ctx.transform(1, 0, sway, 1, 0, 0);
    ctx.drawImage(plant.layer, 0, -plant.h); ctx.restore();
  }
}

startScene({
  id: 'sleeping-bear', guide: 'assets/sleeping-bear/guide.jpg', cache: 'assets/sleeping-bear/painting.webp',
  background: '#b5a28d', focusX: .615, focusY: .55, initialScroll: .65,
  grade: (r, g, b, x, y) => {
    // Suppress the photograph's small lens ghost without inventing a second celestial object.
    const distance = Math.hypot(x - 171, (y - 370) * 1.1);
    const ghost = 1 - clamp((distance - 7) / 14, 0, 1);
    const sky = [210 + (y - 350) * .175, 190 + (y - 350) * .025, 163 - (y - 350) * .225];
    const color = [r, g, b].map((channel, i) => channel * (1 - ghost) + sky[i] * ghost);
    return [color[0] * .9 + 18, color[1] * .9 + 14, color[2] * .88 + 13];
  },
  angle: (x, y) => y > HORIZON ? -.025 : -.045,
  prepare, draw,
});
