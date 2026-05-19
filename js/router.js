/**
 * Router Module
 * Simple tab-based routing
 */

const Router = (function() {
  'use strict';

  let currentTab = 'scraper';

  function go(tab) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update views
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tab}`);
    });

    currentTab = tab;

    // Trigger tab-specific init
    if (tab === 'sender') {
      Sender.updateScraperImport?.();
    }

    // Update URL hash for bookmarking
    window.location.hash = tab;
  }

  function init() {
    // Check hash on load
    const hash = window.location.hash.replace('#', '');
    if (hash && ['scraper', 'sender', 'pipeline'].includes(hash)) {
      go(hash);
    }

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && newHash !== currentTab) {
        go(newHash);
      }
    });
  }

  return { go, init, getCurrent: () => currentTab };
})();

