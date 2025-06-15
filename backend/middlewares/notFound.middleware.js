const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')

/**
 * Middleware to handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const err = new AppError(`This endpoint is not found`, StatusCodes.NOT_FOUND)
  next(err)
}

module.exports = notFound
