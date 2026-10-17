const isPortuguese = document.documentElement.lang === 'pt-BR';
const ui = (en, pt) => isPortuguese ? pt : en;
// Language links preserve the current page and remember explicit choices.
document.querySelectorAll('[data-language]').forEach(link => {
  link.addEventListener('click', () => {
    if (location.hash) link.hash = location.hash;
    try { localStorage.setItem('portfolio-language', link.dataset.language); } catch {}
  });
});
try {
  const preferred = localStorage.getItem('portfolio-language');
  const language = document.documentElement.lang;
  if (preferred && preferred !== language) {
    const link = document.querySelector(`[data-language="${preferred}"]`);
    if (link) location.replace(link.href + location.hash);
  }
} catch {}
const root = document.documentElement;
const themeButton = document.getElementById('toggleTheme');
function setTheme(theme) {
  root.dataset.theme = theme;
  if (themeButton) themeButton.setAttribute('aria-label', ui(`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`, `Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`));
}
try { const saved = localStorage.getItem('portfolio-theme-v2'); if (saved === 'light' || saved === 'dark') setTheme(saved); } catch {}
if (themeButton) themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem('portfolio-theme-v2', theme); } catch {}
});
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  const update = () => backToTop.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', update, { passive: true });
  update();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
}

// A native modal keeps keyboard focus inside the viewer and supports Escape.
const caseImages = document.querySelectorAll('.case-content img');
if (caseImages.length && typeof HTMLDialogElement !== 'undefined') {
  const viewer = document.createElement('dialog');
  viewer.className = 'image-viewer';
  viewer.setAttribute('aria-label', ui('Image viewer', 'Visualizador de imagens'));
  viewer.innerHTML = '<div class="viewer-toolbar"><button type="button" class="viewer-zoom">Zoom in</button><button type="button" class="viewer-close" aria-label="Close image">Close ×</button></div><div class="viewer-stage"><img alt=""></div><p class="viewer-caption"></p>';
  document.body.append(viewer);
  viewer.querySelector('.viewer-close').textContent = ui('Close ×', 'Fechar ×');
  viewer.querySelector('.viewer-close').setAttribute('aria-label', ui('Close image', 'Fechar imagem'));
  const fullImage = viewer.querySelector('img');
  const stage = viewer.querySelector('.viewer-stage');
  const zoom = viewer.querySelector('.viewer-zoom');
  let trigger;
  let previousOverflow;
  const resetZoom = () => { viewer.classList.remove('is-zoomed'); zoom.textContent = ui('Zoom in', 'Ampliar'); zoom.setAttribute('aria-pressed', 'false'); stage.scrollTo(0, 0); };
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', e => { if (e.target === viewer || e.target === stage) viewer.close(); });
  zoom.addEventListener('click', () => {
    const expanded = viewer.classList.toggle('is-zoomed');
    zoom.textContent = expanded ? ui('Fit to screen', 'Ajustar à tela') : ui('Zoom in', 'Ampliar');
    zoom.setAttribute('aria-pressed', String(expanded));
  });
  viewer.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    resetZoom();
    trigger?.focus({ preventScroll: true });
  });
  caseImages.forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    img.setAttribute('aria-label', ui(`Enlarge image: ${img.alt || 'Project image'}`, `Ampliar imagem: ${img.alt || 'Imagem do projeto'}`));
    img.title = ui('Click to enlarge', 'Clique para ampliar');
    const open = () => {
      trigger = img;
      fullImage.src = img.currentSrc || img.src;
      fullImage.alt = img.alt;
      viewer.querySelector('.viewer-caption').textContent = img.alt;
      resetZoom();
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      viewer.showModal();
      viewer.querySelector('.viewer-close').focus();
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}
