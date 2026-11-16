const W = 1600, H = 1000;

function imageAt(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${url}`));
    image.src = url;
  });
}

export async function startScene(options) {
  const terrain = document.querySelector('#landscape');
  const motion = document.querySelector('#motion');
  const context = terrain.getContext('2d', {alpha: false});
  const air = motion.getContext('2d');
  const painting = document.createElement('canvas');
  const source = document.createElement('canvas');
  painting.width = source.width = W;
  painting.height = source.height = H;
  const brush = painting.getContext('2d', {alpha: false});
  let state, pixels, ready = false, prepared = false, scale, ox, oy;
  let seed = 4176, elapsed = 0, previous = 0, lastDraw = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const random = () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };

  function draw() {
    const width = terrain.clientWidth, height = terrain.clientHeight;
    air.clearRect(0, 0, width, height);
    if (!prepared || !options.draw) return;
    air.save(); air.translate(ox, oy); air.scale(scale, scale);
    options.draw({ctx: air, t: elapsed, state, painting, W, H,
      wind: Math.sin(elapsed * .65) * .65 + Math.sin(elapsed * 1.7) * .18});
    air.restore();
  }

  function fit() {
    const width = innerWidth, height = document.querySelector('main').clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    scale = Math.max(width / W, height / H);
    ox = Math.min(0, Math.max(width - W * scale, width * .5 - W * scale * (options.focusX ?? .5)));
    oy = Math.min(0, Math.max(height - H * scale, height * .5 - H * scale * (options.focusY ?? .5)));
    for (const canvas of [terrain, motion]) {
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    context.fillStyle = options.background || '#38483f'; context.fillRect(0, 0, width, height);
    if (ready) context.drawImage(painting, ox, oy, W * scale, H * scale);
    draw();
  }

  function prepare() {
    seed = 7921;
    state = options.prepare?.({painting, source, pixels, random, W, H});
    prepared = true;
    document.documentElement.dataset.sceneReady = 'true';
    document.documentElement.dataset.sceneLive = 'true';
    document.documentElement.dataset.sceneComplete = 'true';
    draw();
  }

  async function paint() {
    seed = 4176;
    const graded = new Uint8ClampedArray(pixels.length);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const at = (y * W + x) * 4;
      const r = pixels[at], g = pixels[at + 1], b = pixels[at + 2];
      const light = r * .3 + g * .55 + b * .15;
      const color = options.grade ? options.grade(r, g, b, x, y) :
        [r * .83 + light * .1 + 11, g * .83 + light * .1 + 10, b * .8 + light * .12 + 10];
      graded[at] = color[0]; graded[at + 1] = color[1]; graded[at + 2] = color[2];
    }
    brush.fillStyle = options.background || '#38483f'; brush.fillRect(0, 0, W, H);
    brush.lineCap = 'round';
    // Sample real geometry, then lay original directional pigment from broad coats to fine bristles.
    for (const [step, length, thickness] of [[12, 20, 13], [5.5, 11, 6.5], [2.8, 5.5, 3], [1.55, 2.6, 1.4]]) {
      for (let gy = 0; gy < H; gy += step) for (let gx = 0; gx < W; gx += step) {
        const x = Math.min(W - 1, Math.max(0, gx + (random() - .5) * step)) | 0;
        const y = Math.min(H - 1, Math.max(0, gy + (random() - .5) * step)) | 0;
        const at = (y * W + x) * 4;
        const angle = (options.angle?.(x, y) ?? (pixels[at + 1] > pixels[at] * 1.12 ? -1.2 : -.035)) + (random() - .5) * .35;
        const dx = Math.cos(angle), dy = Math.sin(angle);
        const size = length * (.6 + random() * .7);
        for (let filament = 0; filament < 3; filament++) {
          const offset = (filament - 1) * thickness / 3;
          const jitter = (random() - .5) * 10;
          brush.strokeStyle = `rgba(${Math.max(0, graded[at] + jitter) | 0},${Math.max(0, graded[at + 1] + jitter) | 0},${Math.max(0, graded[at + 2] + jitter) | 0},${.52 + random() * .35})`;
          brush.lineWidth = thickness / 3 * (.7 + random() * .5);
          brush.beginPath(); brush.moveTo(x - dy * offset, y + dx * offset);
          brush.quadraticCurveTo(x + dx * size * .5 - dy * offset, y + dy * size * .5 + dx * offset - .35,
            x + dx * size - dy * offset, y + dy * size + dx * offset); brush.stroke();
        }
      }
      ready = true; fit();
      await new Promise(requestAnimationFrame);
    }
    // Fine bristles follow real luminance edges: bark fissures, dune ripples, and lava fractures.
    for (let y = 2; y < H - 2; y += 2) {
      for (let x = 2; x < W - 2; x += 2) {
        const at = (y * W + x) * 4;
        const luminance = index => pixels[index] * .3 + pixels[index + 1] * .55 + pixels[index + 2] * .15;
        const gx = luminance(at + 4) - luminance(at - 4);
        const gy = luminance(at + W * 4) - luminance(at - W * 4);
        const edge = Math.hypot(gx, gy);
        if (edge < 9 || random() > Math.min(.9, edge / 60)) continue;
        const a = Math.atan2(gy, gx) + Math.PI / 2;
        const length = .8 + random() * 1.9;
        const detail = Math.max(-10, Math.min(12, (luminance(at) - (luminance(at - 4) + luminance(at + 4)) / 2) * .3));
        brush.strokeStyle = `rgba(${Math.max(0, graded[at] + detail) | 0},${Math.max(0, graded[at + 1] + detail) | 0},${Math.max(0, graded[at + 2] + detail) | 0},.64)`;
        brush.lineWidth = .45 + random() * .55;
        brush.beginPath(); brush.moveTo(x, y); brush.lineTo(x + Math.cos(a) * length, y + Math.sin(a) * length); brush.stroke();
      }
    }
    for (let i = 0; i < 60000; i++) {
      brush.fillStyle = i % 2 ? 'rgba(255,247,224,.055)' : 'rgba(29,35,37,.04)';
      brush.fillRect(random() * W, random() * H, .4 + random(), .4 + random());
    }
    fit(); prepare();
    return painting;
  }

  async function loadGuide() {
    const guide = await imageAt(options.guide);
    const ratio = Math.max(W / guide.naturalWidth, H / guide.naturalHeight);
    source.getContext('2d', {willReadFrequently: true}).drawImage(guide,
      (W - guide.naturalWidth * ratio) / 2, (H - guide.naturalHeight * ratio) / 2,
      guide.naturalWidth * ratio, guide.naturalHeight * ratio);
    pixels = source.getContext('2d').getImageData(0, 0, W, H).data;
  }
  window.exportPainting = () => painting.toDataURL('image/webp', .9);
  window.paintLandscape = async () => {if (!pixels) await loadGuide(); return paint();};
  window.seekScene = seconds => {elapsed = seconds; draw();};
  window.pauseScene = paused => {window.scenePaused = paused;};
  window.exportSceneAssets = () => {
    if (!prepared) throw new Error('Prepare the authoring scene before exporting');
    const entries = [], seen = new Map();
    function encode(value, key) {
      if (value === painting) return {$painting:true};
      if (value instanceof HTMLCanvasElement) {
        if (key === 'water') return {$blank:[value.width,value.height]};
        if (seen.has(value)) return seen.get(value);
        const record = {$sprite:[], width:value.width, height:value.height};
        seen.set(value,record); entries.push({canvas:value,record}); return record;
      }
      if (Array.isArray(value)) return value.map(item=>encode(item));
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name,item])=>[name,encode(item,name)]));
      return value;
    }
    const metadata = {version:1,id:options.id,state:encode(state)};
    let x=0,y=0,row=0;
    for (const {canvas,record} of entries) {
      if (x+canvas.width+4>2048) {x=0;y+=row+4;row=0;}
      record.$sprite=[x+2,y+2,canvas.width,canvas.height];
      x+=canvas.width+4;row=Math.max(row,canvas.height);
    }
    const atlas=document.createElement('canvas');atlas.width=2048;atlas.height=y+row+4;
    const ac=atlas.getContext('2d');
    for(const {canvas,record} of entries)ac.drawImage(canvas,record.$sprite[0],record.$sprite[1]);
    const fallback=document.createElement('canvas');fallback.width=800;fallback.height=500;
    fallback.getContext('2d').drawImage(painting,0,0,800,500);
    return {metadata,atlas:atlas.toDataURL('image/webp',.93),fallback:fallback.toDataURL('image/webp',.85)};
  };
  function hydrate(value, atlas) {
    if (value?.$painting) return painting;
    if (value?.$blank || value?.$sprite) {
      const canvas=document.createElement('canvas');
      [canvas.width,canvas.height]=value.$blank||[value.width,value.height];
      if(value.$sprite)canvas.getContext('2d').drawImage(atlas,...value.$sprite,0,0,canvas.width,canvas.height);
      return canvas;
    }
    if(Array.isArray(value))return value.map(item=>hydrate(item,atlas));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,hydrate(item,atlas)]));
    return value;
  }
  fit();addEventListener('resize',fit);
  const authoring = new URLSearchParams(location.search).has('repaint');
  try {
    if (authoring) {await loadGuide();await paint();}
    else {
      try {brush.drawImage(await imageAt(options.cache),0,0,W,H);}
      catch {brush.drawImage(await imageAt(new URL('fallback.webp',new URL(options.cache,location.href)).href),0,0,W,H);}
      ready=true;fit();document.documentElement.dataset.sceneReady='true';
      // Show finished art before fetching its prebuilt masks and painted cutouts.
      await new Promise(requestAnimationFrame);
      try {
        const assetBase=new URL(options.cache,location.href);
        const [response,atlas]=await Promise.all([fetch(new URL('live-v1.json',assetBase)),imageAt(new URL('live-v1.webp',assetBase).href)]);
        if(!response.ok)throw new Error('Live metadata unavailable');
        const metadata=await response.json();
        if(metadata.version!==1||metadata.id!==options.id)throw new Error('Invalid live metadata');
        state=hydrate(metadata.state,atlas);prepared=true;draw();
        document.documentElement.dataset.sceneLive='true';document.documentElement.dataset.sceneComplete='true';
      } catch {prepared=false;draw();document.documentElement.dataset.sceneLive='static';}
    }
  } catch (error) {
    document.documentElement.dataset.sceneReady='error';
    const notice=document.createElement('p');notice.className='scene-error';
    notice.textContent='The painting could not load. Please try again.';
    document.querySelector('main').append(notice);console.error(error);
  }
  if (innerWidth <= 650) requestAnimationFrame(() => scrollTo(0, Math.max(0, (document.documentElement.scrollHeight - innerHeight) * (options.initialScroll ?? .5))));
  function tick(now) {
    if (!document.hidden && !reduced.matches && !window.scenePaused && prepared) {
      if (previous) elapsed += Math.min((now - previous) / 1000, .1);
      if (now - lastDraw > 32) { draw(); lastDraw = now; }
    }
    previous = now; requestAnimationFrame(tick);
  }
  reduced.addEventListener('change', draw);
  document.addEventListener('visibilitychange', () => { previous = 0; });
  requestAnimationFrame(tick);
}
