// A deliberately coarse color study, reconstructed as flat, broken-bristle paint marks.
// Only color samples enter this renderer: it never draws a reference photograph.
export async function paintBrushwork({ctx, pixels, width, height, random, angle, skip, background, scale = 1, pigmentStep = 24}) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || pixels.length !== width * height * 4) {
    throw new TypeError('Brush painting requires positive dimensions and matching RGBA samples');
  }
  if (!Number.isFinite(scale) || scale <= 0 || !Number.isFinite(pigmentStep) || pigmentStep < 1 || pigmentStep > 255) throw new TypeError('Brush scale and pigment step must be positive');
  const cell = Math.max(1, Math.round(5 * scale)), columns = Math.ceil(width / cell), rows = Math.ceil(height / cell);
  const field = new Float32Array(columns * rows * 3);
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    let r = 0, g = 0, b = 0, count = 0;
    for (let y = row * cell; y < Math.min(height, (row + 1) * cell); y += 2) {
      for (let x = col * cell; x < Math.min(width, (col + 1) * cell); x += 2) {
        const at = (y * width + x) * 4;
        r += pixels[at]; g += pixels[at + 1]; b += pixels[at + 2]; count++;
      }
    }
    const at = (row * columns + col) * 3;
    field[at] = r / count; field[at + 1] = g / count; field[at + 2] = b / count;
  }
  function sample(x, y) {
    const col = Math.max(0, Math.min(columns - 1, Math.floor(x / cell)));
    const row = Math.max(0, Math.min(rows - 1, Math.floor(y / cell)));
    const at = (row * columns + col) * 3;
    // Mix a small set of discrete pigment values instead of copying camera microcontrast.
    return [field[at], field[at + 1], field[at + 2]].map(v => Math.min(255, Math.max(0, Math.round(v / pigmentStep) * pigmentStep)));
  }
  const color = (rgb, shift = 0, alpha = 1) => `rgba(${rgb.map(v => Math.max(0, Math.min(255, v + shift)) | 0).join(',')},${alpha})`;
  function mark(x, y, length, breadth, rgb, direction) {
    const dx = Math.cos(direction), dy = Math.sin(direction), nx = -dy, ny = dx;
    const bend = (random() - .5) * breadth * .55;
    // A loaded flat brush lays a color plane, with irregular ends and separate visible bristles.
    ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    ctx.strokeStyle = color(rgb, (random() - .5) * 9, .92);
    ctx.lineWidth = breadth * .82;
    ctx.beginPath(); ctx.moveTo(x - dx * length * .45, y - dy * length * .45);
    ctx.quadraticCurveTo(x + nx * bend, y + ny * bend, x + dx * length * .48, y + dy * length * .48); ctx.stroke();
    for (let bristle = 0; bristle < 5; bristle++) {
      const off = (bristle / 4 - .5) * breadth;
      const start = length * (.3 + random() * .22), end = length * (.3 + random() * .24);
      ctx.strokeStyle = color(rgb, (random() - .5) * 24, .5 + random() * .35);
      ctx.lineWidth = breadth / 6 * (.65 + random() * .5);
      ctx.beginPath(); ctx.moveTo(x - dx * start + nx * off, y - dy * start + ny * off);
      ctx.quadraticCurveTo(x + nx * (off + bend), y + ny * (off + bend), x + dx * end + nx * off, y + dy * end + ny * off); ctx.stroke();
    }
    // A dry edge catches light; it is baked pigment, not a moving noise/filter overlay.
    if (random() > .45) {
      ctx.strokeStyle = color(rgb, 17, .32); ctx.lineWidth = (.35 + random() * .4) * scale;
      const off = breadth * .38;
      ctx.beginPath(); ctx.moveTo(x - dx * length * .3 + nx * off, y - dy * length * .3 + ny * off);
      ctx.lineTo(x + dx * length * .28 + nx * off, y + dy * length * .28 + ny * off); ctx.stroke();
    }
  }
  if (background) {ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);}
  // The smaller pass is selective: broad marks stay visible instead of being buried in pixels.
  for (const [baseStep, baseLength, baseBreadth] of [[12, 24.5, 14.5], [6.5, 15, 7.5], [4, 8, 3.5]]) {
    const step = baseStep * scale, length = baseLength * scale, breadth = baseBreadth * scale;
    const points = [];
    for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) points.push([x, y]);
    for (let i = points.length - 1; i > 0; i--) {
      const j = random() * (i + 1) | 0; [points[i], points[j]] = [points[j], points[i]];
    }
    for (const [gx, gy] of points) {
      const x = Math.max(0, Math.min(width - 1, gx + (random() - .5) * step));
      const y = Math.max(0, Math.min(height - 1, gy + (random() - .5) * step));
      if (skip?.(x | 0, y | 0)) continue;
      const rgb = sample(x, y), neighbor = sample(x + cell, y + cell);
      const difference = Math.abs(rgb[0] - neighbor[0]) + Math.abs(rgb[1] - neighbor[1]) + Math.abs(rgb[2] - neighbor[2]);
      if (baseStep === 4 && (difference < 35 || random() > .48)) continue;
      const direction = (angle?.(x | 0, y | 0) ?? -.12) + (random() - .5) * .38;
      let extent = length * (.7 + random() * .7);
      const ahead = sample(x + Math.cos(direction) * extent * .4, y + Math.sin(direction) * extent * .4);
      if (rgb.reduce((sum, v, i) => sum + Math.abs(v - ahead[i]), 0) > 105) extent *= .48;
      mark(x, y, extent, breadth * (.75 + random() * .45), rgb, direction);
    }
    await new Promise(requestAnimationFrame);
  }
  ctx.lineCap = 'round';
}
