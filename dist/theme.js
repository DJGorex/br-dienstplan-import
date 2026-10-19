(() => {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let manualChoice = false;
  function applyTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#081428' : '#f5f4ef';
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-checked', String(dark));
      toggle.title = dark ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren';
    }
  }
  applyTheme(systemTheme.matches);
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark');
    document.getElementById('theme-toggle').addEventListener('click', () => {
      manualChoice = true;
      applyTheme(document.documentElement.dataset.theme !== 'dark');
    });
  });
  systemTheme.addEventListener('change', event => {
    if (!manualChoice) applyTheme(event.matches);
  });
})();
