/**
 * Server Module
 * Backend server for CORS proxy and API requests
 * Handles domain scraping without CORS restrictions
 */

const Server = (function() {
  'use strict';

  // Backend server URL - configure as needed
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  /**
   * Fetch URL through backend server to avoid CORS issues
   * @param {string} url - Target URL to fetch
   * @param {object} options - Fetch options
   * @returns {Promise<Response>}
   */
  async function fetch(url, options = {}) {
    try {
      const response = await window.fetch(`${API_BASE}/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          timeout: options.timeout || 15000,
          headers: options.headers || {}
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Server fetch error:', err);
      throw err;
    }
  }

  /**
   * Scrape domain and extract emails
   * @param {string} domain - Domain to scrape
   * @param {object} options - Scraping options
   * @returns {Promise<object>}
   */
  async function scrapeDomain(domain, options = {}) {
    try {
      const response = await window.fetch(`${API_BASE}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain,
          paths: options.paths || ['/'],
          timeout: options.timeout || 15000
        })
      });

      if (!response.ok) {
        throw new Error(`Scrape error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Scrape error:', err);
      throw err;
    }
  }

  /**
   * Batch scrape multiple domains
   * @param {array} domains - Array of domains to scrape
   * @param {object} options - Scraping options
   * @returns {Promise<array>}
   */
  async function scrapeBatch(domains, options = {}) {
    try {
      const response = await window.fetch(`${API_BASE}/scrape-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: domains,
          paths: options.paths || ['/'],
          timeout: options.timeout || 15000,
          concurrency: options.concurrency || 5
        })
      });

      if (!response.ok) {
        throw new Error(`Batch scrape error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Batch scrape error:', err);
      throw err;
    }
  }

  /**
   * Extract emails from HTML content
   * @param {string} html - HTML content to extract from
   * @returns {Promise<array>}
   */
  async function extractEmails(html) {
    try {
      const response = await window.fetch(`${API_BASE}/extract-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html })
      });

      if (!response.ok) {
        throw new Error(`Extract error: ${response.status}`);
      }

      const data = await response.json();
      return data.emails || [];
    } catch (err) {
      console.error('Email extraction error:', err);
      throw err;
    }
  }

  /**
   * Check server health
   * @returns {Promise<object>}
   */
  async function health() {
    try {
      const response = await window.fetch(`${API_BASE}/health`, {
        method: 'GET'
      });

      return await response.json();
    } catch (err) {
      console.error('Health check failed:', err);
      return { status: 'offline' };
    }
  }

  /**
   * Validate API connectivity
   * @returns {Promise<boolean>}
   */
  async function isConnected() {
    const health = await Server.health();
    return health.status === 'ok' || health.status === 'healthy';
  }

  return {
    fetch,
    scrapeDomain,
    scrapeBatch,
    extractEmails,
    health,
    isConnected,
    getBaseURL: () => API_BASE
  };
})();
