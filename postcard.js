(() => {
  const root = document.documentElement;
  const card = document.querySelector('.postcard');
  const show = document.querySelector('#show-postcard');
  const putAway = document.querySelector('#put-away');
  function land() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const w = innerWidth, h = innerHeight;
    // Matching curve tangents keep the loop moving through each join without a pause.
    const curves = [
      [[-1.1*w,.14*h],[-.65*w,.14*h],[-.17*w,.16*h],[-.17*w,0]],
      [[-.17*w,0],[-.17*w,-.16*h],[.17*w,-.16*h],[.17*w,0]],
      [[.17*w,0],[.17*w,.16*h],[-.17*w,.16*h],[-.17*w,0]],
      [[-.17*w,0],[-.17*w,-.16*h],[0,0],[0,0]]
    ];
    const frames = Array.from({length: 321}, (_, i) => {
      const progress = i / 320;
      const segment = Math.min(3, Math.floor(progress * 4));
      const t = progress * 4 - segment, u = 1 - t;
      const point = axis => curves[segment].reduce((sum, p, j) => sum + p[axis] * [u*u*u,3*u*u*t,3*u*t*t,t*t*t][j], 0);
      const turn = progress * progress * (3 - 2 * progress);
      return {transform: `translate(${point(0)}px,${point(1)}px) rotate(${-15 - 347 * turn}deg) scale(${1 - .1 * Math.sin(Math.PI * progress)**2})`};
    });
    card.getAnimations().forEach(animation => animation.cancel());
    card.animate(frames, {duration: 3200, easing: 'linear', fill: 'both'});
  }
  const ready = () => {
    if (root.dataset.sceneReady !== 'true' || root.classList.contains('cloud-arrival') || root.dataset.cloudPhase === 'revealing') return;
    root.dataset.postcardReady = 'true';
    land();
    observer.disconnect();
  };
  const observer = new MutationObserver(ready);
  observer.observe(root, {attributes: true, attributeFilter: ['data-scene-ready', 'data-cloud-phase', 'class']});
  ready();
  putAway.addEventListener('click', () => {
    card.hidden = true;
    show.hidden = false;
    show.focus({preventScroll: true});
  });
  show.addEventListener('click', () => {
    card.hidden = false;
    show.hidden = true;
    land();
    putAway.focus({preventScroll: true});
  });
})();
