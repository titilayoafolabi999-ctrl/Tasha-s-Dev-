/**
 * App Entry Point
 * Initializes all modules and sets up event listeners
 */

(function() {
  'use strict';

  // Global references for onclick handlers
  window.scraper = Scraper;
  window.sender = Sender;
  window.router = Router;
  window.ui = UI;

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize router
    Router.init();

    // Initialize dropzones
    Dropzone.init('scraperDropzone', {
      onDrop: async (file) => {
        const text = await CSV.readFile(file);
        const domains = Validator.extractFromText(text);
        const current = document.getElementById('scraperInput').value;
        document.getElementById('scraperInput').value = 
          current + (current ? '\n' : '') + domains.join('\n');
        UI.updateInputCount(
          document.getElementById('scraperInput').value.split('\n').filter(l => l.trim()).length
        );
        UI.toast(`Loaded ${domains.length} domains from file`);
      }
    });

    Dropzone.init('senderDropzone', {
      onDrop: async (file) => {
        await Sender.handleCSV(file);
      }
    });

    // Initialize sender CSV file input
    document.getElementById('senderFile')?.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        await Sender.handleCSV(e.target.files[0]);
      }
    });

    // Scraper input listener
    document.getElementById('scraperInput')?.addEventListener('input', (e) => {
      const count = e.target.value.split('\n').filter(l => l.trim()).length;
      UI.updateInputCount(count);
    });

    // Close modal on backdrop click
    document.getElementById('modalBackdrop')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) UI.closeModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to scrape
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && Router.getCurrent() === 'scraper') {
        Scraper.start();
      }
      // Escape to close modal
      if (e.key === 'Escape') UI.closeModal();
    });

    console.log('🎯 Scoutool Suite initialized');
    console.log('Ready to scrape and send');
  });
})();
                            
