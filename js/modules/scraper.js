

const Scraper = (function() {
  'use strict';

  let isRunning = false;
  let abortController = null;
  let results = [];
  let filteredResults = [];

  async function start() {
    if (isRunning) return;

    const input = document.getElementById('scraperInput').value;
    const domains = Validator.extractFromText(input);

    if (domains.length === 0) {
      UI.toast('No valid domains found', 'error');
      return;
    }

    isRunning = true;
    abortController = new AbortController();
    results = [];
    filteredResults = [];

    const useProxy = document.getElementById('optProxy').checked;
    const checkContact = document.getElementById('optContact').checked;
    const checkTerms = document.getElementById('optTerms').checked;

    UI.setScraping(true);
    UI.showProgress();
    UI.clearResults();
    UI.updateInputCount(domains.length);

    const paths = ['/'];
    if (checkContact) paths.push('/contact', '/about', '/contact-us');
    if (checkTerms) paths.push('/terms', '/privacy');

    for (let i = 0; i < domains.length; i++) {
      if (abortController.signal.aborted) break;

      const domain = domains[i];
      UI.updateProgress(((i / domains.length) * 100).toFixed(0), `${i + 1}/${domains.length}`);

      const domainEmails = new Set();
      let lastStatus = 'error';
      let errorMsg = '';

      for (const path of paths) {
        try {
          const url = `https://${domain}${path}`;
          let response;

          if (useProxy) {
            response = await Proxy.fetch(url, { timeout: 12000 });
          } else {
            response = await fetch(url, {
              signal: abortController.signal,
              mode: 'no-cors'
            });
          }

          if (response.ok || response.status === 0) {
            const html = await response.text();
            Extractor.extract(html).forEach(e => domainEmails.add(e));
            lastStatus = 'ok';
          }
        } catch (err) {
          errorMsg = err.message;
        }
      }

      let emails = [...domainEmails];
      if (document.getElementById('optLower').checked) {
        emails = emails.map(e => e.toLowerCase());
      }
      if (document.getElementById('optUnique').checked) {
        emails = [...new Set(emails)];
      }

      const result = {
        id: i,
        domain,
        emails,
        status: lastStatus,
        error: errorMsg,
        scannedAt: new Date().toISOString()
      };

      results.push(result);
      filteredResults.push(result);
      UI.addResult(result);
      UI.updateStats(results);
    }

    isRunning = false;
    UI.setScraping(false);
    UI.toast(`Scraped ${results.length} domains, ${results.reduce((s, r) => s + r.emails.length, 0)} emails found`);

    const totalEmails = results.reduce((s, r) => s + r.emails.length, 0);
    document.getElementById('btnToSender').disabled = totalEmails === 0;
  }

  function stop() {
    if (abortController) abortController.abort();
    isRunning = false;
    UI.setScraping(false);
  }

  function clear() {
    stop();
    results = [];
    filteredResults = [];
    document.getElementById('scraperInput').value = '';
    UI.clearResults();
    UI.hideProgress();
    UI.updateStats([]);
    UI.updateInputCount(0);
    document.getElementById('btnToSender').disabled = true;
  }

  function filter(text) {
    const lower = text.toLowerCase();
    filteredResults = results.filter(r =>
      r.domain.toLowerCase().includes(lower) ||
      r.emails.some(e => e.toLowerCase().includes(lower))
    );
    UI.renderResults(filteredResults);
  }

  function filterStatus(status) {
    if (status === 'all') {
      filteredResults = [...results];
    } else if (status === 'emails') {
      filteredResults = results.filter(r => r.emails.length > 0);
    } else {
      filteredResults = results.filter(r => r.status === status);
    }
    UI.renderResults(filteredResults);
  }

  function exportCSV() {
    if (results.length === 0) return;

    const headers = ['domain', 'email', 'status', 'scanned_at'];
    const rows = [];

    results.forEach(r => {
      if (r.emails.length === 0) {
        rows.push({ domain: r.domain, email: '', status: r.error || 'no-emails', scanned_at: r.scannedAt });
      } else {
        r.emails.forEach(e => {
          rows.push({ domain: r.domain, email: e, status: 'found', scanned_at: r.scannedAt });
        });
      }
    });

    const csv = CSV.stringify(rows, headers);
    CSV.download(csv, `emails-${new Date().toISOString().slice(0, 10)}.csv`);
    UI.toast('CSV downloaded');
  }

  function toSender() {
    const contacts = [];
    results.forEach(r => {
      r.emails.forEach(email => {
        contacts.push({
          email,
          domain: r.domain,
          name: email.split('@')[0]
        });
      });
    });

    State.set('senderData', contacts);
    State.set('senderSource', 'scraper');
    Router.go('sender');
    Sender.loadFromScraper(contacts);
  }

  return { start, stop, clear, filter, filterStatus, export: exportCSV, toSender, getResults: () => results };
})();
