

const UI = (function() {
  'use strict';

  function toast(message, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = 'toast' + (type === 'error' ? ' error' : '');
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
  }

  function setScraping(isActive) {
    const btn = document.getElementById('btnScrape');
    btn.disabled = isActive;
    btn.innerHTML = isActive
      ? '<span>⏳</span> Scraping...'
      : '<span>▶</span> Start Scraping';
  }

  function showProgress() {
    document.getElementById('scraperProgress').classList.remove('hidden');
  }

  function hideProgress() {
    document.getElementById('scraperProgress').classList.add('hidden');
    document.getElementById('scraperFill').style.width = '0%';
  }

  function updateProgress(percent, status) {
    document.getElementById('scraperFill').style.width = percent + '%';
    if (status) {
      document.getElementById('scraperStatus').textContent = status;
    }
    document.getElementById('scraperPercent').textContent = percent + '%';
  }

  function updateStats(results) {
    const total = results.length;
    const done = results.filter(r => r.status === 'ok').length;
    const emails = results.reduce((s, r) => s + r.emails.length, 0);
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statFound').textContent = emails;
    document.getElementById('statRate').textContent = rate + '%';
  }

  function updateInputCount(count) {
    document.getElementById('inputCount').textContent = count + ' domain' + (count !== 1 ? 's' : '');
  }

  function updateSenderCount(count) {
    document.getElementById('senderCount').textContent = count + ' contact' + (count !== 1 ? 's' : '');
  }

  function updateLinkCount(count) {
    document.getElementById('linkCount').textContent = count + ' link' + (count !== 1 ? 's' : '');
  }

  function clearResults() {
    document.getElementById('scraperBody').innerHTML = `
      <tr class="empty-row"><td colspan="4">Results appear here after scraping</td></tr>
    `;
    document.getElementById('scraperResults').classList.add('hidden');
    document.getElementById('btnExportScraper').disabled = true;
    document.getElementById('btnToSender').disabled = true;
  }

  function addResult(result) {
    document.getElementById('scraperResults').classList.remove('hidden');
    document.getElementById('btnExportScraper').disabled = false;

    const tbody = document.getElementById('scraperBody');

    const empty = tbody.querySelector('.empty-row');
    if (empty) empty.remove();

    const tr = document.createElement('tr');

    const badges = result.emails.length > 0
      ? result.emails.slice(0, 3).map(e => `<span class="badge">${e}</span>`).join('') +
        (result.emails.length > 3 ? ` <span style="color:var(--text-muted)">+${result.emails.length - 3}</span>` : '')
      : '<span style="color:var(--text-muted)">None</span>';

    const statusClass = result.status === 'ok' ? 'status-ok' : 'status-err';
    const statusText = result.status === 'ok' ? 'Found' : (result.error || 'Failed');

    tr.innerHTML = `
      <td><strong>${result.domain}</strong></td>
      <td class="${statusClass}">${statusText}</td>
      <td>${badges}</td>
      <td>
        ${result.emails.length > 0
          ? `<button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText('${result.emails.join('\\n')}')">Copy</button>`
          : '-'}
      </td>
    `;

    tbody.appendChild(tr);
    tr.style.animation = 'slideIn 0.2s ease';
  }

  function renderResults(results) {
    const tbody = document.getElementById('scraperBody');

    if (results.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No matching results</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    results.forEach(result => {
      const tr = document.createElement('tr');

      const badges = result.emails.length > 0
        ? result.emails.slice(0, 3).map(e => `<span class="badge">${e}</span>`).join('') +
          (result.emails.length > 3 ? ` <span style="color:var(--text-muted)">+${result.emails.length - 3}</span>` : '')
        : '<span style="color:var(--text-muted)">None</span>';

      const statusClass = result.status === 'ok' ? 'status-ok' : 'status-err';
      const statusText = result.status === 'ok' ? 'Found' : (result.error || 'Failed');

      tr.innerHTML = `
        <td><strong>${result.domain}</strong></td>
        <td class="${statusClass}">${statusText}</td>
        <td>${badges}</td>
        <td>
          ${result.emails.length > 0
            ? `<button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText('${result.emails.join('\\n')}')">Copy</button>`
            : '-'}
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  function renderSenderResults(links) {
    const container = document.getElementById('senderResults');
    const tbody = document.getElementById('senderBody');

    container.classList.remove('hidden');
    tbody.innerHTML = '';

    if (links.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No links generated</td></tr>';
      return;
    }

    links.forEach(link => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${link.to}</td>
        <td>${link.subject}</td>
        <td>${link.bodyPreview}</td>
        <td>
          <a href="${link.url}" target="_blank" class="btn btn-sm btn-primary" style="text-decoration:none;">
            Open Gmail
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function showModal(title, html) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalBackdrop').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
  }

  return {
    toast,
    setScraping,
    showProgress,
    hideProgress,
    updateProgress,
    updateStats,
    updateInputCount,
    updateSenderCount,
    updateLinkCount,
    clearResults,
    addResult,
    renderResults,
    renderSenderResults,
    showModal,
    closeModal
  };
})();
