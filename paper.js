(() => {
  const slip = document.querySelector('.content-slip');
  const sheet = document.querySelector('.paper-sheet');
  const collapse = sheet.querySelector('.paper-collapse');
  let closing = false;

  function unfold(open) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    const rect = slip.getBoundingClientRect();
    const folded = {left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`};
    const expanded = {left: '0px', top: '0px', width: '100%', height: '100dvh'};
    return sheet.animate(open ? [folded, expanded] : [expanded, folded], {
      duration: 500, easing: 'cubic-bezier(.22,.7,.25,1)'
    });
  }

  slip.addEventListener('click', () => {
    sheet.showModal();
    slip.setAttribute('aria-expanded', 'true');
    unfold(true);
  });

  async function close() {
    if (closing) return;
    closing = true;
    sheet.getAnimations().forEach(animation => animation.finish());
    await unfold(false)?.finished;
    sheet.close();
    slip.setAttribute('aria-expanded', 'false');
    closing = false;
  }
  collapse.addEventListener('click', close);
  sheet.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });
})();
