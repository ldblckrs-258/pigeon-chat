const { StatusCodes } = require('http-status-codes')
const AppError = require('./AppError')

/**
 * Collection of common error factory functions
 * These functions create consistent error objects throughout the application
 */

/**
 * Create a Bad Request error (400)
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createBadRequestError = message => {
  return new AppError(message, StatusCodes.BAD_REQUEST)
}

/**
 * Create an Unauthorized error (401)
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createUnauthorizedError = (message = 'Unauthorized access') => {
  return new AppError(message, StatusCodes.UNAUTHORIZED)
}

/**
 * Create a Forbidden error (403)
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createForbiddenError = (message = 'Access forbidden') => {
  return new AppError(message, StatusCodes.FORBIDDEN)
}

/**
 * Create a Not Found error (404)
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createNotFoundError = message => {
  return new AppError(message, StatusCodes.NOT_FOUND)
}

/**
 * Create a Conflict error (409)
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createConflictError = message => {
  return new AppError(message, StatusCodes.CONFLICT)
}

/**
 * Create an Unprocessable Entity error (422)
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createValidationError = message => {
  return new AppError(message, StatusCodes.UNPROCESSABLE_ENTITY)
}

/**
 * Create an Internal Server error (500)
 * @param {string} message - Error message
 * @returns {AppError} - AppError instance
 */
const createInternalServerError = (message = 'Internal server error') => {
  return new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR)
}

module.exports = {
  createBadRequestError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  createValidationError,
  createInternalServerError,
}
