

const validator = (function() {
  'use strict';

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const DISPOSABLE_DOMAINS = new Set([
    'tempmail.com', 'guerrillamail.com', '10minutemail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ]);


  function isValidFormat(email) {
    return EMAIL_REGEX.test(email?.trim() || '');
  }


  function isDisposable(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return DISPOSABLE_DOMAINS.has(domain);
  }


  function isCorporate(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    const disposablePrefixes = ['gmail', 'yahoo', 'outlook', 'hotmail', 'aol', 'test'];
    return !disposablePrefixes.some(prefix => domain?.startsWith(prefix));
  }


  async function validateWithAPI(email, apiKey = null) {
    try {
      if (!apiKey) {
        return {
          email,
          is_valid_format: isValidFormat(email),
          is_disposable: isDisposable(email),
          is_corporate: isCorporate(email),
          status: isValidFormat(email) && !isDisposable(email) ? 'valid' : 'invalid',
          score: calculateScore(email)
        };
      }

      const response = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
      );

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      return {
        email,
        is_valid_format: data.is_valid_format?.value || false,
        is_free_email: data.is_free_email?.value || false,
        is_disposable: data.is_disposable_email?.value || false,
        is_smtp_valid: data.is_smtp_valid?.value || false,
        quality_score: data.quality_score || 0,
        status: data.deliverability || 'unknown'
      };
    } catch (err) {
      console.error('Validation API error:', err);
      return {
        email,
        status: 'unknown',
        error: err.message
      };
    }
  }


  function calculateScore(email) {
    let score = 100;

    if (!isValidFormat(email)) score -= 50;
    if (isDisposable(email)) score -= 30;
    if (!isCorporate(email)) score -= 20;

    return Math.max(0, score);
  }


  async function validateBatch(emails, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 10;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map(email => validateWithAPI(email, options.apiKey));

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + batchSize < emails.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return results;
  }


  function filterByQuality(emails, minScore = 70) {
    return emails.filter(email => calculateScore(email) >= minScore);
  }


  function getSummary(validationResults) {
    const total = validationResults.length;
    const valid = validationResults.filter(r => r.status === 'valid').length;
    const invalid = validationResults.filter(r => r.status === 'invalid').length;
    const disposable = validationResults.filter(r => r.is_disposable).length;
    const corporate = validationResults.filter(r => r.is_corporate).length;

    return {
      total,
      valid,
      invalid,
      disposable,
      corporate,
      validRate: ((valid / total) * 100).toFixed(2) + '%',
      corporateRate: ((corporate / total) * 100).toFixed(2) + '%'
    };
  }

  return {
    isValidFormat,
    isDisposable,
    isCorporate,
    validateWithAPI,
    calculateScore,
    validateBatch,
    filterByQuality,
    getSummary
  };
})();
