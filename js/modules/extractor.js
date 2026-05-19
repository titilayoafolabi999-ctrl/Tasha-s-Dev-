/**
 * Extractor Module
 * Email extraction from HTML with multiple strategies
 */

const Extractor = (function() {
  'use strict';

  const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

  const INVALID_PATTERNS = [
    /\.png$/i, /\.jpe?g$/i, /\.gif$/i, /\.svg$/i,
    /\.css$/i, /\.js$/i, /\.json$/i, /\.xml$/i,
    /^[0-9]+@[0-9]+/,
    /^example@/i, /^test@/i, /^admin@localhost/i,
    /^noreply@/i, /^no-reply@/i
  ];

  function decodeEntities(html) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    let decoded = textarea.value;

    // Additional replacements
    const replacements = {
      '&#64;': '@', '&#46;': '.', '&commat;': '@',
      '&period;': '.', '&dot;': '.', '&#x40;': '@',
      '&#x2e;': '.', '[at]': '@', '[dot]': '.',
      '(at)': '@', '(dot)': '.'
    };

    Object.entries(replacements).forEach(([encoded, decodedChar]) => {
      decoded = decoded.replace(new RegExp(encoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), decodedChar);
    });

    return decoded;
  }

  function isValidEmail(email) {
    if (!email || email.length < 6 || email.length > 254) return false;
    if (!email.includes('@') || !email.includes('.')) return false;
    if (email.startsWith('.') || email.endsWith('.')) return false;
    if (email.includes('..')) return false;
    return !INVALID_PATTERNS.some(p => p.test(email));
  }

  function extract(html) {
    const found = new Set();
    const decoded = decodeEntities(html);

    // Regex extraction
    [...decoded.matchAll(EMAIL_RE)].forEach(m => {
      const email = m[0].toLowerCase().trim();
      if (isValidEmail(email)) found.add(email);
    });

    // mailto: links
    [...decoded.matchAll(/mailto:([^"'\s<>?]+)/gi)].forEach(m => {
      try {
        const email = decodeURIComponent(m[1]).split('?')[0].toLowerCase().trim();
        if (isValidEmail(email)) found.add(email);
      } catch (e) {
        // Invalid URI, skip
      }
    });

    // DOM parsing for better accuracy
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(decoded, 'text/html');

      // Text nodes
      const treeWalker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
      let textNode;
      while (textNode = treeWalker.nextNode()) {
        const text = textNode.textContent;
        [...text.matchAll(EMAIL_RE)].forEach(m => {
          const email = m[0].toLowerCase().trim();
          if (isValidEmail(email)) found.add(email);
        });
      }

      // mailto links
      doc.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        const href = a.getAttribute('href');
        if (href) {
          const email = href.replace('mailto:', '').split('?')[0].toLowerCase().trim();
          if (isValidEmail(email)) found.add(email);
        }
      });

      // Data attributes
      doc.querySelectorAll('[data-email], [data-contact], [data-mail]').forEach(el => {
        const val = el.getAttribute('data-email') || 
                    el.getAttribute('data-contact') || 
                    el.getAttribute('data-mail');
        if (val && val.includes('@')) {
          const email = val.toLowerCase().trim();
          if (isValidEmail(email)) found.add(email);
        }
      });
    } catch (e) {
      // DOM parsing failed, regex results still valid
    }

    return [...found];
  }

  return { extract };
})();

