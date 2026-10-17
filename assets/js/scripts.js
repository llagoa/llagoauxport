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
  fullImage.draggable = false;
  stage.tabIndex = 0;
  stage.setAttribute('aria-label', ui('Image area. When zoomed, drag to move or use the arrow keys.', 'Área da imagem. Quando ampliada, arraste para mover ou use as teclas de seta.'));
  let drag = null;
  const endDrag = () => {
    if (drag && stage.hasPointerCapture(drag.id)) stage.releasePointerCapture(drag.id);
    drag = null;
    stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerdown', e => {
    if (!viewer.classList.contains('is-zoomed') || !e.isPrimary || e.button !== 0) return;
    e.preventDefault();
    stage.focus({ preventScroll: true });
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    stage.scrollLeft = drag.left - (e.clientX - drag.x);
    stage.scrollTop = drag.top - (e.clientY - drag.y);
  });
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  stage.addEventListener('keydown', e => {
    if (!viewer.classList.contains('is-zoomed')) return;
    const delta = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] }[e.key];
    if (delta) { e.preventDefault(); stage.scrollBy(delta[0], delta[1]); }
  });
  let trigger;
  let previousOverflow;
  const resetZoom = () => { endDrag(); fullImage.style.width = ''; fullImage.style.height = ''; viewer.classList.remove('is-zoomed'); zoom.textContent = ui('Zoom in', 'Ampliar'); zoom.setAttribute('aria-pressed', 'false'); stage.scrollTo(0, 0); };
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', e => { if (e.target === viewer || (e.target === stage && !viewer.classList.contains('is-zoomed'))) viewer.close(); });
  const zoomAt = (point = { x: 0.5, y: 0.5 }) => {
    if (!fullImage.naturalWidth || !fullImage.naturalHeight) return;
    const fitScale = Math.min(stage.clientWidth / fullImage.naturalWidth, stage.clientHeight / fullImage.naturalHeight);
    viewer.classList.add('is-zoomed');
    fullImage.style.width = `${Math.round(fullImage.naturalWidth * fitScale * 2.5)}px`;
    fullImage.style.height = `${Math.round(fullImage.naturalHeight * fitScale * 2.5)}px`;
    zoom.textContent = ui('Fit to screen', 'Ajustar à tela');
    zoom.setAttribute('aria-pressed', 'true');
    // Center the selected detail; scroll limits keep image edges reachable.
    stage.scrollLeft = Math.max(0, fullImage.offsetWidth * point.x - stage.clientWidth / 2);
    stage.scrollTop = Math.max(0, fullImage.offsetHeight * point.y - stage.clientHeight / 2);
    stage.focus({ preventScroll: true });
  };
  const imagePoint = (img, event) => {
    if (!event || event.detail === 0) return { x: 0.5, y: 0.5 };
    const rect = img.getBoundingClientRect();
    const scale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    const width = img.naturalWidth * scale;
    const height = img.naturalHeight * scale;
    if (!width || !height) return { x: 0.5, y: 0.5 };
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left - (rect.width - width) / 2) / width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top - (rect.height - height) / 2) / height))
    };
  };
  zoom.addEventListener('click', () => {
    if (viewer.classList.contains('is-zoomed')) resetZoom();
    else zoomAt();
  });
  fullImage.addEventListener('click', event => {
    if (!viewer.classList.contains('is-zoomed')) zoomAt(imagePoint(fullImage, event));
  });
  viewer.addEventListener('close', () => {
    fullImage.onload = null;
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
    const open = event => {
      const point = imagePoint(img, event);
      trigger = img;
      fullImage.onload = null;
      fullImage.src = img.currentSrc || img.src;
      fullImage.alt = img.alt;
      viewer.querySelector('.viewer-caption').textContent = img.alt + ui(' — Drag to explore. Use Fit to screen for the full image.', ' — Arraste para explorar. Use Ajustar à tela para ver a imagem inteira.');
      resetZoom();
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      viewer.showModal();
      const showDetail = () => { if (viewer.open && trigger === img) zoomAt(point); };
      if (fullImage.complete && fullImage.naturalWidth) showDetail();
      else fullImage.onload = showDetail;
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}
