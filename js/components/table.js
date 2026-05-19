/**
 * Table Component
 * Sortable, filterable data tables
 */

const Table = (function() {
  'use strict';

  function render(containerId, data, columns, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<table class="results-table"><thead><tr>';
    columns.forEach(col => {
      html += `<th>${col.label}</th>`;
    });
    html += '</tr></thead><tbody>';

    if (data.length === 0) {
      html += `<tr class="empty-row"><td colspan="${columns.length}">No data</td></tr>`;
    } else {
      data.forEach((row, idx) => {
        html += '<tr>';
        columns.forEach(col => {
          const value = col.render ? col.render(row[col.key], row, idx) : (row[col.key] || '');
          html += `<td>${value}</td>`;
        });
        html += '</tr>';
      });
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  return { render };
})();

