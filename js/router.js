

const Router = (function() {
  'use strict';

  let currentTab = 'scraper';

  function go(tab) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tab}`);
    });

    currentTab = tab;

    if (tab === 'sender') {
      Sender.updateScraperImport?.();
    }

    window.location.hash = tab;
  }

  function init() {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['scraper', 'sender', 'pipeline'].includes(hash)) {
      go(hash);
    }

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && newHash !== currentTab) {
        go(newHash);
      }
    });
  }

  return { go, init, getCurrent: () => currentTab };
})();
