const helmet = require('helmet');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const env = require('../../config/env');

const json = (message) => ({ message });
const ip = (req) => ipKeyGenerator(req.ip);
const minutes = (n) => n * 60 * 1000;

// Security headers. The CSP only matters when Express serves the built React app (production).
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: null, // enable at the HTTPS proxy in production
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

const base = { standardHeaders: 'draft-8', legacyHeaders: false };

// Every API call: generous ceiling against floods.
const apiLimiter = rateLimit({ ...base, windowMs: minutes(1), limit: env.rateLimits.apiPerMinute, keyGenerator: ip, message: json('Too many requests. Please slow down and try again in a minute.') });

// Password guessing: only FAILED logins count, per account and per IP.
const loginLimiter = rateLimit({
  ...base, windowMs: minutes(15), limit: 8, skipSuccessfulRequests: true,
  keyGenerator: (req) => `${ip(req)}|${String(req.body?.email || '').toLowerCase().slice(0, 100)}`,
  message: json('Too many failed login attempts. Please wait 15 minutes and try again.'),
});
const loginIpLimiter = rateLimit({ ...base, windowMs: minutes(15), limit: 40, skipSuccessfulRequests: true, keyGenerator: ip, message: json('Too many failed login attempts. Please wait 15 minutes and try again.') });

// New accounts per IP per hour (only successful signups count).
const signupLimiter = rateLimit({ ...base, windowMs: minutes(60), limit: env.rateLimits.signupsPerHour, skipFailedRequests: true, keyGenerator: ip, message: json('Too many accounts created from this network. Please try again later.') });

// OTP requests and checks.
const otpLimiter = rateLimit({ ...base, windowMs: minutes(15), limit: 10, keyGenerator: ip, message: json('Too many OTP requests. Please wait 15 minutes and try again.') });

module.exports = { securityHeaders, apiLimiter, loginLimiter, loginIpLimiter, signupLimiter, otpLimiter };
