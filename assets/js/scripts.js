const root = document.documentElement;
const themeButton = document.getElementById('toggleTheme');
function setTheme(theme) {
  root.dataset.theme = theme;
  if (themeButton) themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
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
