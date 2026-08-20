

const Charts = (function() {
  'use strict';

  function barChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const max = Math.max(...data.map(d => d.value));

    let html = '<div class="chart-bars">';
    data.forEach(item => {
      const percent = (item.value / max) * 100;
      html += `
        <div class="bar-row">
          <div class="bar-label">${item.label}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${percent}%"></div>
          </div>
          <div class="bar-value">${item.value}</div>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  return { barChart };
})();
