const { StatusCodes } = require('http-status-codes')

/**
 * Custom Application Error class
 * Extends the built-in Error class to include HTTP status codes
 */
class AppError extends Error {
  /**
   * Create an AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether error is operational (true) or programming error (false)
   */
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, isOperational = true) {
    super(message)

    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = isOperational

    // Capture stack trace, exclude constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
