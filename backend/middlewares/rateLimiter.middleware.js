const rateLimit = require('express-rate-limit')

/**
 * General rate limiter for all routes
 */
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    status: 'error',
    message: 'You made too many actions, please try again later.',
    rule: 'General rate limit: 100 requests per minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Strict rate limiter for auth routes (login, register, etc.)
 */
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
    rule: 'Auth rate limit: 5 requests per minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
})

/**
 * Rate limiter for password reset
 */
const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,
  message: {
    status: 'error',
    message: 'Too many password reset attempts, please try again later.',
    rule: 'Password reset rate limit: 3 requests per 30 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Rate limiter for message sending
 */
const messageLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20,
  message: {
    status: 'error',
    message: 'Too many messages sent, please slow down.',
    rule: 'Message rate limit: 20 requests per 10 seconds',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Rate limiter for file uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 3,
  message: {
    status: 'error',
    message: 'Too many file uploads, please try again later.',
    rule: 'File upload rate limit: 3 requests per 10 seconds',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  messageLimiter,
  uploadLimiter,
}
