

(function() {
  'use strict';

  window.scraper = Scraper;
  window.sender = Sender;
  window.router = Router;
  window.ui = UI;

  document.addEventListener('DOMContentLoaded', () => {

    Router.init();

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

    document.getElementById('senderFile')?.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        await Sender.handleCSV(e.target.files[0]);
      }
    });

    document.getElementById('scraperInput')?.addEventListener('input', (e) => {
      const count = e.target.value.split('\n').filter(l => l.trim()).length;
      UI.updateInputCount(count);
    });

    document.getElementById('modalBackdrop')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) UI.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && Router.getCurrent() === 'scraper') {
        Scraper.start();
      }
      if (e.key === 'Escape') UI.closeModal();
    });

    console.log('🎯 Scoutool Suite initialized');
    console.log('Ready to scrape and send');
  });
})();
