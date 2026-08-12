JSON.stringify((function () {
  const items = document.querySelectorAll('.marquee-row > div');
  const row = document.querySelector('.marquee-row');
  const first = items[0];
  const img = first ? first.querySelector('img') : null;
  return {
    viewportW: Math.round(window.innerWidth),
    viewportH: Math.round(window.innerHeight),
    rowCount: document.querySelectorAll('.marquee-row').length,
    itemCount: items.length,
    first: first ? {
      width: Math.round(first.offsetWidth),
      height: Math.round(first.offsetHeight),
      class: first.getAttribute('class'),
      alt: img ? img.getAttribute('alt') : null
    } : null,
    bodyText: (document.body && document.body.innerText) ? document.body.innerText.slice(0, 200) : ''
  };
})())
