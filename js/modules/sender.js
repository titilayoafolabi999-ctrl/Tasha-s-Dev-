/**
 * Sender Module
 * Gmail compose link generator with template variables
 */

const Sender = (function() {
  'use strict';

  let csvData = { headers: [], rows: [] };
  let manualData = [];
  let generatedLinks = [];
  let currentSource = 'csv'; // csv | manual | scraper

  function switchInput(source) {
    currentSource = source;
    
    document.querySelectorAll('.tab-sub').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab-sub[onclick="sender.switchInput('${source}')"]`).classList.add('active');
    
    document.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));
    document.getElementById(`input-${source}`).classList.add('active');

    if (source === 'fromScraper') {
      updateScraperImport();
    }
  }

  function updateScraperImport() {
    const scraperData = State.get('senderData');
    const container = document.getElementById('scraperImport');
    
    if (!scraperData || scraperData.length === 0) {
      container.innerHTML = `
        <p>No scraper data available</p>
        <button class="btn btn-secondary" onclick="router.go('scraper')">Go to Scraper</button>
      `;
    } else {
      container.innerHTML = `
        <p><strong>${scraperData.length} contacts</strong> ready from scraper</p>
        <button class="btn btn-primary" onclick="Sender.loadFromScraper()">Load Contacts</button>
      `;
    }
  }

  async function handleCSV(file) {
    const text = await CSV.readFile(file);
    csvData = CSV.parse(text);
    
    // Show columns
    const tags = document.getElementById('columnTags');
    tags.innerHTML = csvData.headers.map(h => `<span class="tag">${h}</span>`).join('');
    document.getElementById('csvPreview').classList.remove('hidden');

    // Populate selects
    populateSelects(csvData.headers);
    
    UI.toast(`Loaded ${csvData.rows.length} rows, ${csvData.headers.length} columns`);
    UI.updateSenderCount(csvData.rows.length);
  }

  function handleManual() {
    const text = document.getElementById('manualInput').value;
    const lines = text.split(/\n/).filter(l => l.trim());
    
    if (lines.length < 2) {
      UI.toast('Enter at least header + 1 row', 'error');
      return;
    }

    const parsed = CSV.parse(lines.join('\n'));
    manualData = parsed.rows;
    
    populateSelects(parsed.headers);
    UI.toast(`Loaded ${manualData.length} manual entries`);
    UI.updateSenderCount(manualData.length);
  }

  function loadFromScraper(contacts) {
    if (!contacts) {
      contacts = State.get('senderData') || [];
    }
    
    // Convert to CSV-like format
    const headers = ['email', 'domain', 'name'];
    const rows = contacts.map(c => ({
      email: c.email,
      domain: c.domain,
      name: c.name || c.email.split('@')[0]
    }));

    csvData = { headers, rows };
    manualData = rows;
    currentSource = 'scraper';

    populateSelects(headers);
    UI.toast(`Loaded ${rows.length} contacts from scraper`);
    UI.updateSenderCount(rows.length);
    
    // Switch to manual view to show data
    switchInput('manual');
    document.getElementById('manualInput').value = 
      'email,domain,name\n' + 
      rows.map(r => `${r.email},${r.domain},${r.name}`).join('\n');
  }

  function populateSelects(headers) {
    const emailSelect = document.getElementById('emailColumn');
    const nameSelect = document.getElementById('nameColumn');
    
    const options = headers.map(h => `<option value="${h}">${h}</option>`).join('');
    
    emailSelect.innerHTML = '<option value="">Select...</option>' + options;
    nameSelect.innerHTML = '<option value="">None</option>' + options;
  }

  function generate() {
    let data;
    if (currentSource === 'csv') {
      data = csvData.rows;
    } else if (currentSource === 'manual') {
      handleManual();
      data = manualData;
    } else if (currentSource === 'scraper') {
      data = csvData.rows;
    }

    if (!data || data.length === 0) {
      UI.toast('No data loaded', 'error');
      return;
    }

    const subjectTemplate = document.getElementById('senderSubject').value || 'Hello';
    const bodyTemplate = document.getElementById('senderBody').value || 'Hi,';
    const from = document.getElementById('senderFrom').value;
    const emailColumn = document.getElementById('emailColumn').value;

    if (!emailColumn) {
      UI.toast('Select email column', 'error');
      return;
    }

    generatedLinks = data.map((row, idx) => {
      const variables = { ...row, from };
      
      let subject = replaceVariables(subjectTemplate, variables);
      let body = replaceVariables(bodyTemplate, variables);
      const to = row[emailColumn];

      // Gmail deep link
      const params = new URLSearchParams({
        view: 'cm',
        fs: '1',
        to: to,
        su: subject,
        body: body
      });

      if (from) params.set('from', from);

      const url = `https://mail.google.com/mail/?${params.toString()}`;

      return {
        id: idx,
        to,
        subject,
        bodyPreview: body.substring(0, 120) + (body.length > 120 ? '...' : ''),
        url,
        variables
      };
    });

    UI.renderSenderResults(generatedLinks);
    document.getElementById('btnExportSender').disabled = false;
    UI.updateLinkCount(generatedLinks.length);
  }

  function replaceVariables(template, variables) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  function preview() {
    if (generatedLinks.length === 0) {
      UI.toast('Generate links first', 'error');
      return;
    }
    
    const first = generatedLinks[0];
    const html = `
      <div style="margin-bottom:16px;">
        <strong>To:</strong> ${first.to}<br>
        <strong>Subject:</strong> ${first.subject}<br>
        <strong>From:</strong> ${document.getElementById('senderFrom').value || '(default)'}
      </div>
      <div style="background:var(--surface);padding:16px;border-radius:8px;white-space:pre-wrap;">
        ${first.bodyPreview}
      </div>
      <div style="margin-top:16px;">
        <a href="${first.url}" target="_blank" class="btn btn-primary">Open Gmail Preview</a>
      </div>
    `;
    
    UI.showModal('Preview First Email', html);
  }

  function exportLinks() {
    if (generatedLinks.length === 0) return;

    const rows = generatedLinks.map(l => ({
      to: l.to,
      subject: l.subject,
      body_preview: l.bodyPreview,
      gmail_link: l.url
    }));

    const csv = CSV.stringify(rows, ['to', 'subject', 'body_preview', 'gmail_link']);
    CSV.download(csv, `gmail-links-${new Date().toISOString().slice(0, 10)}.csv`);
    UI.toast('Links exported');
  }

  return {
    switchInput,
    handleCSV,
    handleManual,
    loadFromScraper,
    generate,
    preview,
    exportLinks,
    getLinks: () => generatedLinks
  };
})();
        
