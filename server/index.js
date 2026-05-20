/**
 * Scoutool Backend Server
 * CORS proxy and email scraping API
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request timeout
const TIMEOUT = 15000;

/**
 * Extract emails from HTML content
 */
function extractEmailsFromHTML(html) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailRegex) || [];
  return [...new Set(emails)]; // Remove duplicates
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/**
 * Proxy endpoint - Fetch any URL without CORS restrictions
 * POST /api/proxy
 * Body: { url, timeout, headers }
 */
app.post('/api/proxy', async (req, res) => {
  try {
    const { url, timeout = TIMEOUT, headers = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      }
    });

    res.json({
      status: 'ok',
      url,
      statusCode: response.status,
      content: response.data,
      headers: response.headers
    });
  } catch (error) {
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
      status: error.response?.status || 'unknown'
    });
  }
});

/**
 * Scrape single domain endpoint
 * POST /api/scrape
 * Body: { domain, paths, timeout }
 */
app.post('/api/scrape', async (req, res) => {
  try {
    const { domain, paths = ['/'], timeout = TIMEOUT } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const emails = new Set();
    const results = [];

    for (const path of paths) {
      try {
        const url = `https://${domain}${path}`;
        const response = await axios.get(url, {
          timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const foundEmails = extractEmailsFromHTML(response.data);
        foundEmails.forEach(email => emails.add(email));

        results.push({
          path,
          status: 'success',
          emails: foundEmails
        });
      } catch (error) {
        results.push({
          path,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      domain,
      emails: Array.from(emails),
      results,
      totalEmails: emails.size
    });
  } catch (error) {
    res.status(500).json({
      error: 'Scrape failed',
      message: error.message
    });
  }
});

/**
 * Batch scrape multiple domains
 * POST /api/scrape-batch
 * Body: { domains, paths, timeout, concurrency }
 */
app.post('/api/scrape-batch', async (req, res) => {
  try {
    const { domains = [], paths = ['/'], timeout = TIMEOUT, concurrency = 5 } = req.body;

    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'Domains array is required' });
    }

    const results = [];
    
    // Process domains with concurrency limit
    for (let i = 0; i < domains.length; i += concurrency) {
      const batch = domains.slice(i, i + concurrency);
      const batchPromises = batch.map(domain =>
        axios.post('http://localhost:' + PORT + '/api/scrape', {
          domain,
          paths,
          timeout
        }).then(res => res.data)
          .catch(error => ({
            domain,
            error: error.message,
            emails: []
          }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const totalEmails = results.reduce((sum, r) => sum + (r.emails?.length || 0), 0);

    res.json({
      totalDomains: domains.length,
      results,
      totalEmails,
      successCount: results.filter(r => r.emails?.length > 0).length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Batch scrape failed',
      message: error.message
    });
  }
});

/**
 * Extract emails from HTML content
 * POST /api/extract-emails
 * Body: { html }
 */
app.post('/api/extract-emails', async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    const emails = extractEmailsFromHTML(html);

    res.json({
      emails,
      count: emails.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Email extraction failed',
      message: error.message
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

/**
 * Error handler
 */
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Scoutool Server running on http://localhost:${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/proxy`);
  console.log(`   POST /api/scrape`);
  console.log(`   POST /api/scrape-batch`);
  console.log(`   POST /api/extract-emails`);
});

module.exports = app;
