/**
 * Proxy Module
 * CORS proxy rotation for browser-based fetching
 */

const Proxy = (function() {
  'use strict';

  // Public CORS proxies (rotate for reliability)
  const PROXIES = [
    { url: 'https://api.allorigins.win/raw?url=', weight: 3 },
    { url: 'https://corsproxy.io/?', weight: 2 },
    { url: 'https://api.codetabs.com/v1/proxy?quest=', weight: 1 }
  ];

  let currentIndex = 0;
  let failedProxies = new Set();

  function getProxyUrl(targetUrl) {
    // Find working proxy with highest weight
    const working = PROXIES.filter(p => !failedProxies.has(p.url));
    if (working.length === 0) {
      failedProxies.clear(); // reset
      return PROXIES[0].url + encodeURIComponent(targetUrl);
    }
    
    // Weighted random selection
    const totalWeight = working.reduce((s, p) => s + p.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const proxy of working) {
      random -= proxy.weight;
      if (random <= 0) {
        currentIndex = PROXIES.indexOf(proxy);
        return proxy.url + encodeURIComponent(targetUrl);
      }
    }
    
    return working[0].url + encodeURIComponent(targetUrl);
  }

  async function fetch(targetUrl, options = {}) {
    const proxyUrl = getProxyUrl(targetUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 15000);

    try {
      const response = await window.fetch(proxyUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (err) {
      clearTimeout(timeout);
      
      // Mark proxy as failed temporarily
      const proxy = PROXIES[currentIndex];
      if (proxy) failedProxies.add(proxy.url);
      
      throw err;
    }
  }

  function getStats() {
    return {
      total: PROXIES.length,
      working: PROXIES.length - failedProxies.size,
      failed: failedProxies.size
    };
  }

  return { fetch, getStats };
})();
