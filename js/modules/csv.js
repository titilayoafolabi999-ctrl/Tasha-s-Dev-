/**
 * CSV Module
 * Parse and stringify CSV data
 */

const CSV = (function() {
  'use strict';

  function parse(text, delimiter = ',') {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = parseLine(lines[0], delimiter);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i], delimiter);
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] !== undefined ? values[idx] : '';
      });
      rows.push(row);
    }

    return { headers, rows };
  }

  function parseLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  function stringify(data, headers) {
    const rows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(h => {
        const val = String(row[h] || '').replace(/"/g, '""');
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val}"`;
        }
        return val;
      });
      rows.push(values.join(','));
    });

    return rows.join('\n');
  }

  function download(content, filename, type = 'text/csv') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  return { parse, stringify, download, readFile };
})();
