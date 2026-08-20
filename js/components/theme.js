

const theme = (function() {
  'use strict';

  const STORAGE_KEY = 'scoutool-theme';
  const DARK_CLASS = 'dark-mode';

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;

    if (isDark) {
      document.documentElement.classList.add(DARK_CLASS);
    }
  }

  function toggle() {
    const isDark = document.documentElement.classList.toggle(DARK_CLASS);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }

  function isDarkMode() {
    return document.documentElement.classList.contains(DARK_CLASS);
  }

  return { init, toggle, isDarkMode };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => theme.init());
} else {
  theme.init();
}
