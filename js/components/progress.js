

const Progress = (function() {
  'use strict';

  function create(elementId, options = {}) {
    const container = document.getElementById(elementId);
    if (!container) return null;

    return {
      set(percent) {
        const fill = container.querySelector('.progress-fill');
        const text = container.querySelector('.progress-text');
        if (fill) fill.style.width = percent + '%';
        if (text) text.textContent = Math.round(percent) + '%';
      },

      show() {
        container.classList.remove('hidden');
      },

      hide() {
        container.classList.add('hidden');
      },

      complete() {
        this.set(100);
        setTimeout(() => this.hide(), 500);
      }
    };
  }

  return { create };
})();
