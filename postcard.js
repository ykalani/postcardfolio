(() => {
  const root = document.documentElement;
  const card = document.querySelector('.postcard');
  const show = document.querySelector('#show-postcard');
  const putAway = document.querySelector('#put-away');
  function land() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    card.getAnimations().forEach(animation => animation.cancel());
    card.animate([
      {transform: 'translate(-110vw,10vh) rotate(-8deg)'},
      {transform: 'translate(0,0) rotate(-2deg)'}
    ], {duration: 1700, easing: 'cubic-bezier(.22,.7,.25,1)', fill: 'both'});
  }
  const ready = () => {
    if (root.dataset.sceneReady !== 'true' || root.classList.contains('cloud-arrival') || root.dataset.cloudPhase === 'revealing') return;
    root.dataset.postcardReady = 'true';
    if (!card.hidden) land();
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
