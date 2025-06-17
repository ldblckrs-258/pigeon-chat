const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')

/**
 * Handle Cast Errors (Invalid MongoDB ObjectId)
 * @param {Error} err - Cast error
 * @returns {AppError} - Formatted AppError
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, StatusCodes.BAD_REQUEST)
}

/**
 * Handle Duplicate Field Errors (MongoDB unique constraint violations)
 * @param {Error} err - Duplicate key error
 * @returns {AppError} - Formatted AppError
 */
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, StatusCodes.BAD_REQUEST)
}

/**
 * Handle Validation Errors (MongoDB/Mongoose validation errors)
 * @param {Error} err - Validation error
 * @returns {AppError} - Formatted AppError
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, StatusCodes.BAD_REQUEST)
}

/**
 * Handle JWT Errors
 * @returns {AppError} - Formatted AppError
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', StatusCodes.UNAUTHORIZED)

/**
 * Handle JWT Expired Errors
 * @returns {AppError} - Formatted AppError
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', StatusCodes.UNAUTHORIZED)

/**
 * Handle JSON Parse Errors (Invalid JSON in request body)
 * @param {Error} err - JSON parse error
 * @returns {AppError} - Formatted AppError
 */
const handleJSONParseError = err => {
  const message = `Invalid JSON format in request body: ${err.message}`
  return new AppError(message, StatusCodes.BAD_REQUEST)
}

/**
 * Handle Multer Errors (File upload errors)
 * @param {Error} err - Multer error
 * @returns {AppError} - Formatted AppError
 */
const handleMulterError = err => {
  let message = 'File upload error'

  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File size must be less than 5MB'
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files'
  } else if (err.code === 'LIMIT_FIELD_COUNT') {
    message = 'Too many fields'
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field'
  } else if (err.message) {
    message = err.message
  }

  return new AppError(message, StatusCodes.BAD_REQUEST)
}

/**
 * Send error response in development mode
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

/**
 * Send error response in production mode
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR', err)

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went wrong!',
    })
  }
}

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    // Handle specific error types in development too
    if (err.name === 'MulterError') {
      err = handleMulterError(err)
    }
    sendErrorDev(err, res)
  } else {
    let error = { ...err }
    error.message = err.message

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
    if (error.type === 'entity.parse.failed') error = handleJSONParseError(error)
    if (error.name === 'MulterError') error = handleMulterError(error)

    sendErrorProd(error, res)
  }
}

module.exports = globalErrorHandler
