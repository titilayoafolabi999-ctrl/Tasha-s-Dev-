/**
 * Dropzone Component
 * Drag and drop file handling
 */

const Dropzone = (function() {
  'use strict';

  function init(elementId, options = {}) {
    const zone = document.getElementById(elementId);
    const input = zone.querySelector('input[type="file"]');
    
    if (!zone) return;

    zone.addEventListener('click', () => input?.click());
    
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && options.onDrop) {
        options.onDrop(files[0]);
      }
    });

    if (input) {
      input.addEventListener('change', (e) => {
        if (e.target.files.length > 0 && options.onDrop) {
          options.onDrop(e.target.files[0]);
        }
      });
    }
  }

  return { init };
})();

