/**
 * Scoutool Backend Server - OPTIMIZED
 * CORS proxy and email scraping API with fast parallel scraping
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request timeout
const TIMEOUT = 8000; // Reduced for faster scraping

// Priority routes for faster scraping (ordered by likelihood)
const PRIORITY_ROUTES = [
  '/',
  '/contact',
  '/contact-us',
  '/privacy',
  '/privacy-policy',
  '/about',
  '/about-us',
  '/terms',
  '/terms-of-service'
];

/**
 * Extract emails from HTML content
 */
function extractEmailsFromHTML(html) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailRegex) || [];
  return [...new Set(emails)]; // Remove duplicates
}

/**
 * Fetch URL with timeout
 */
async function fetchWithTimeout(url, timeout = TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await axios.get(url, {
      timeout,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      maxRedirects: 3
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
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

    const response = await fetchWithTimeout(url, timeout);

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
 * Scrape single domain endpoint - OPTIMIZED
 * POST /api/scrape
 * Body: { domain, paths, timeout }
 */
app.post('/api/scrape', async (req, res) => {
  try {
    const { domain, paths = PRIORITY_ROUTES, timeout = TIMEOUT } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const emails = new Set();
    const results = [];
    
    // Parallel scraping - faster!
    const pathPromises = paths.map(async (path) => {
      try {
        const url = `https://${domain}${path}`;
        const response = await fetchWithTimeout(url, timeout);

        const foundEmails = extractEmailsFromHTML(response.data);
        foundEmails.forEach(email => emails.add(email));

        return {
          path,
          status: 'success',
          emails: foundEmails,
          size: response.data.length
        };
      } catch (error) {
        return {
          path,
          status: 'error',
          error: error.code || error.message,
          emails: []
        };
      }
    });

    // Wait for all requests in parallel
    const pathResults = await Promise.allSettled(pathPromises);
    pathResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });

    res.json({
      domain,
      emails: Array.from(emails),
      results,
      totalEmails: emails.size,
      totalPages: results.length,
      successPages: results.filter(r => r.status === 'success').length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Scrape failed',
      message: error.message
    });
  }
});

/**
 * Batch scrape multiple domains - OPTIMIZED FOR SPEED
 * POST /api/scrape-batch
 * Body: { domains, paths, timeout, concurrency }
 */
app.post('/api/scrape-batch', async (req, res) => {
  try {
    const { 
      domains = [], 
      paths = PRIORITY_ROUTES, 
      timeout = TIMEOUT, 
      concurrency = 8 // Increased for speed
    } = req.body;

    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'Domains array is required' });
    }

    const results = [];
    const startTime = Date.now();

    // Process domains with concurrency limit
    for (let i = 0; i < domains.length; i += concurrency) {
      const batch = domains.slice(i, i + concurrency);
      
      // Parallel requests per batch
      const batchPromises = batch.map(domain =>
        fetchWithTimeout(`https://${domain}/`, timeout)
          .then(res => ({
            domain,
            emails: extractEmailsFromHTML(res.data),
            status: 'success'
          }))
          .catch(error => ({
            domain,
            error: error.code || error.message,
            emails: [],
            status: 'error'
          }))
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });
    }

    const totalEmails = results.reduce((sum, r) => sum + (r.emails?.length || 0), 0);
    const elapsedTime = Date.now() - startTime;

    res.json({
      totalDomains: domains.length,
      results,
      totalEmails,
      successCount: results.filter(r => r.status === 'success').length,
      elapsedTime: elapsedTime + 'ms',
      averagePerDomain: (elapsedTime / domains.length).toFixed(0) + 'ms'
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
 * Validate emails
 * POST /api/validate-emails
 * Body: { emails }
 */
app.post('/api/validate-emails', async (req, res) => {
  try {
    const { emails = [] } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required' });
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const DISPOSABLE_DOMAINS = new Set([
      'tempmail.com', 'guerrillamail.com', '10minutemail.com',
      'mailinator.com', 'throwaway.email', 'temp-mail.org'
    ]);

    const results = emails.map(email => {
      const domain = email.split('@')[1]?.toLowerCase();
      const isValid = EMAIL_REGEX.test(email);
      const isDisposable = DISPOSABLE_DOMAINS.has(domain);
      const isCorporate = !['gmail', 'yahoo', 'outlook', 'hotmail', 'aol'].some(p => domain?.startsWith(p));

      return {
        email,
        isValid,
        isDisposable,
        isCorporate,
        quality: (isValid && !isDisposable && isCorporate) ? 'high' : isValid ? 'medium' : 'low'
      };
    });

    const summary = {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      disposable: results.filter(r => r.isDisposable).length,
      corporate: results.filter(r => r.isCorporate).length,
      high: results.filter(r => r.quality === 'high').length
    };

    res.json({
      results,
      summary
    });
  } catch (error) {
    res.status(500).json({
      error: 'Validation failed',
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
  console.log(`\ud83d\ude80 Scoutool Server running on http://localhost:${PORT}`);
  console.log(`\ud83d\udccd API endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/proxy`);
  console.log(`   POST /api/scrape (parallel per domain)`);
  console.log(`   POST /api/scrape-batch (8x concurrency)`);
  console.log(`   POST /api/extract-emails`);
  console.log(`   POST /api/validate-emails (NEW)`);
  console.log(`\u26a1 Optimizations: Parallel requests, priority routes, faster timeout`);
});

module.exports = app;