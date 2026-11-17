(() => {
  const root = document.documentElement;
  const card = document.querySelector('.postcard');
  const show = document.querySelector('#show-postcard');
  const putAway = document.querySelector('#put-away');
  const ready = () => {
    if (root.dataset.sceneReady !== 'true' || root.classList.contains('cloud-arrival') || root.dataset.cloudPhase === 'revealing') return;
    root.dataset.postcardReady = 'true';
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
    putAway.focus({preventScroll: true});
  });
})();
