(() => {
  const key = 'postcard-cloud-arrival';
  const root = document.documentElement;
  const link = document.querySelector('[data-cloud-link]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let canvas, context, sprites, width, height, busy = false, generation = 0;
  let seed = 4319;
  const random = () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);

  function cloudSprite(index) {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 600;
    const c = sprite.getContext('2d');
    const points = [];
    for (let i = 0; i < 80; i++) {
      const a = i / 80 * Math.PI * 2;
      const r = 230 + Math.sin(a * 7 + index) * 21 + Math.cos(a * 11 - index) * 10;
      points.push([300 + Math.cos(a) * r * 1.08, 300 + Math.sin(a) * r * .82]);
    }
    c.beginPath();
    points.forEach(([x,y], i) => {
      const next = points[(i + 1) % points.length];
      if (!i) c.moveTo((x + points.at(-1)[0]) / 2, (y + points.at(-1)[1]) / 2);
      c.quadraticCurveTo(x, y, (x + next[0]) / 2, (y + next[1]) / 2);
    });
    c.closePath(); c.fillStyle = '#d8e0db'; c.fill(); c.save(); c.clip();
    // Broad opaque coats, then broken bristles: the banks read as painted volume.
    for (let i = 0; i < 5200; i++) {
      const x = random() * 600, y = random() * 600;
      const crest = Math.sin(x * .013 + index) * 17 + Math.cos(y * .019 - x * .009) * 9;
      const light = clamp((410 - y + crest) / 270);
      const r = 205 + light * 40, g = 218 + light * 24, b = 215 + light * 12;
      const length = 9 + random() * 58, thickness = 2 + random() * 9;
      for (let j = 0; j < 3; j++) {
        c.strokeStyle = `rgba(${r|0},${g|0},${b|0},${.28 + random() * .4})`;
        c.lineWidth = thickness / 3 * (.6 + random() * .7); c.lineCap = 'round';
        c.beginPath(); c.moveTo(x, y + j * thickness / 3);
        c.quadraticCurveTo(x + length * .5, y + j * thickness / 3 - 2, x + length, y + j * thickness / 3 - 4);
        c.stroke();
      }
    }
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = i % 3 ? 'rgba(255,250,231,.13)' : 'rgba(121,152,151,.06)';
      c.fillRect(random()*600, random()*600, .4+random(), .4+random());
    }
    // Broken dry-brush scratches sit over the broad coats; the opaque paper stays beneath.
    c.lineCap='butt';
    for(let i=0;i<2100;i++){
      const x=random()*600,y=random()*600,length=7+random()*49;
      c.setLineDash([.6+random()*2.2,.8+random()*3]);
      c.strokeStyle=i%3?'rgba(255,250,227,.24)':'rgba(117,148,146,.13)';
      c.lineWidth=.35+random()*.85;c.beginPath();c.moveTo(x,y);c.lineTo(x+length,y-2-random()*3);c.stroke();
    }
    c.setLineDash([]);
    c.restore();
    const texture=c.getImageData(0,0,600,600);
    for(let k=0;k<texture.data.length;k+=4){
      if(!texture.data[k+3])continue;
      const grain=(random()-.5)*15;
      for(let channel=0;channel<3;channel++)texture.data[k+channel]+=grain;
    }
    c.putImageData(texture,0,0);
    return sprite;
  }

  function prepare() {
    if (!sprites) sprites = Array.from({length:4}, (_, i) => cloudSprite(i));
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'cloud-curtain'; canvas.hidden = true;
      canvas.setAttribute('aria-hidden', 'true'); document.body.append(canvas);
      context = canvas.getContext('2d');
    }
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr; canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paint(progress, leaving) {
    context.clearRect(0, 0, width, height);
    // The last gaps close before navigation; departure opens them again immediately.
    const blanket = clamp((progress - .93) / .07);
    if (blanket) {
      context.globalAlpha = blanket; context.fillStyle = '#f0eee3';
      context.fillRect(0, 0, width, height); context.globalAlpha = 1;
    }
    const size = Math.max(width * .84, height * 1.2);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      const n = row * 3 + col, delay = (n % 4) * .035;
      const settled = ease(clamp(progress * 1.12 - delay));
      let dx = col - 1, dy = row - 1;
      if (!dx && !dy) { dx = -.8; dy = .65; }
      const travel = (1 - settled) * (leaving ? -1 : 1);
      const x = col * width / 2 + dx * (width * .58 + size * .48) * travel;
      const y = row * height / 2 + dy * (height * .58 + size * .4) * travel;
      context.drawImage(sprites[n % 4], x - size / 2, y - size / 2, size, size);
    }
  }

  function sweep(from, to, duration) {
    const ticket = ++generation, started = performance.now();
    return new Promise(resolve => {
      function frame(now) {
        if (ticket !== generation) return resolve(false);
        const t = clamp((now - started) / duration);
        paint(from + (to - from) * t, to < from);
        if (t === 1) resolve(true); else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  function reset() {
    generation++; busy = false;
    if (canvas) canvas.hidden = true;
    root.classList.remove('cloud-arrival'); root.dataset.cloudPhase = 'idle';
    document.body.removeAttribute('aria-busy');
  }

  if (link) {
    link.addEventListener('click', async event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduced.matches) return;
      event.preventDefault();
      if (busy) return;
      busy = true; document.body.setAttribute('aria-busy','true');
      try {
        prepare(); canvas.hidden = false; root.dataset.cloudPhase = 'covering';
        if (!await sweep(0, 1, 760)) return;
        root.dataset.cloudPhase = 'covered';
        const ticket = generation;
        await new Promise(resolve => setTimeout(resolve, 130));
        if (!busy || ticket !== generation) return;
        try { sessionStorage.setItem(key, 'writing'); } catch {}
        location.assign(link.href);
      } catch {
        reset(); location.assign(link.href);
      }
    });
    const preload = () => { if (!sprites) sprites = Array.from({length:4}, (_, i) => cloudSprite(i)); };
    if ('requestIdleCallback' in window) requestIdleCallback(preload, {timeout:1500});
    else setTimeout(preload, 300);
  }

  let arriving = false;
  try {
    arriving = !link && sessionStorage.getItem(key) === 'writing';
    if (!link) sessionStorage.removeItem(key);
  } catch {}
  if (arriving && !reduced.matches) {
    prepare(); canvas.hidden = false; paint(1, false);
    clearTimeout(window.cloudFallback); root.classList.remove('cloud-arrival');
    root.dataset.cloudPhase = 'revealing';
    sweep(1, 0, 850).then(() => {
      reset(); document.querySelector('h1')?.focus({preventScroll:true});
    });
  } else {
    clearTimeout(window.cloudFallback); root.classList.remove('cloud-arrival');
  }
  addEventListener('pageshow', event => { if (event.persisted) reset(); });
  addEventListener('pagehide', () => { generation++; busy = false; });
})();
