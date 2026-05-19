/**
 * Validator Module
 * Domain and email validation utilities
 */

const Validator = (function() {
  'use strict';

  const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z0-9.-]{2,}$/i;
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

  const INVALID_DOMAINS = [
    /^localhost$/i,
    /^example\.com$/i,
    /^test\.com$/i,
    /^domain\.com$/i
  ];

  function isValidDomain(str) {
    if (!str || str.length < 4 || str.length > 253) return false;
    if (!DOMAIN_RE.test(str)) return false;
    if (INVALID_DOMAINS.some(re => re.test(str))) return false;
    return true;
  }

  function isValidEmail(str) {
    if (!str || str.length < 6 || str.length > 254) return false;
    if (!EMAIL_RE.test(str)) return false;
    if (str.startsWith('.') || str.endsWith('.')) return false;
    if (str.includes('..')) return false;
    return true;
  }

  function sanitizeDomain(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '');
  }

  function extractFromText(text) {
    const lines = text.split(/\r?\n/);
    const domains = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      // Check if line looks like a domain
      if (isValidDomain(trimmed)) {
        domains.push(sanitizeDomain(trimmed));
      }
      // Check if line contains a domain
      const words = trimmed.split(/\s+/);
      words.forEach(word => {
        const clean = sanitizeDomain(word);
        if (isValidDomain(clean) && !domains.includes(clean)) {
          domains.push(clean);
        }
      });
    });
    
    return [...new Set(domains)];
  }

  return {
    isValidDomain,
    isValidEmail,
    sanitizeDomain,
    extractFromText
  };
})();

