const helmet = require('helmet')

/**
 * Configure helmet with appropriate security headers
 */
const securityMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false,

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Frameguard
  frameguard: { action: 'deny' },

  // Hide Powered By
  hidePoweredBy: true,

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,

  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },

  // X-Content-Type-Options
  xssFilter: true,
})

module.exports = securityMiddleware
