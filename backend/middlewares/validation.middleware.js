const { StatusCodes } = require('http-status-codes')
const { createBadRequestError } = require('../utils/errorTypes')

/**
 * Middleware to validate request data using Zod schemas
 * @param {Object} schema - Zod schema object with optional body, params, query, and headers properties
 * @returns {Function} Express middleware function
 */
const validate = schema => {
  return (req, res, next) => {
    try {
      // Validate each part of the request if schema is provided
      const validationData = {}

      if (schema.body) {
        const bodyResult = schema.body.safeParse(req.body)
        if (!bodyResult.success) {
          const errorMessage = bodyResult.error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
          throw createBadRequestError(`Body validation failed: ${errorMessage}`)
        }
        validationData.body = bodyResult.data
      }

      if (schema.params) {
        const paramsResult = schema.params.safeParse(req.params)
        if (!paramsResult.success) {
          const errorMessage = paramsResult.error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
          throw createBadRequestError(`Params validation failed: ${errorMessage}`)
        }
        validationData.params = paramsResult.data
      }

      if (schema.query) {
        const queryResult = schema.query.safeParse(req.query)
        if (!queryResult.success) {
          const errorMessage = queryResult.error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
          throw createBadRequestError(`Query validation failed: ${errorMessage}`)
        }
        validationData.query = queryResult.data
      }

      if (schema.headers) {
        const headersResult = schema.headers.safeParse(req.headers)
        if (!headersResult.success) {
          const errorMessage = headersResult.error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
          throw createBadRequestError(`Headers validation failed: ${errorMessage}`)
        }
        validationData.headers = headersResult.data
      }

      // If we have a full schema object (not just individual parts), validate the entire request
      if (
        schema.shape &&
        (schema.shape.body || schema.shape.params || schema.shape.query || schema.shape.headers)
      ) {
        const fullResult = schema.safeParse({
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
        })

        if (!fullResult.success) {
          const errorMessage = fullResult.error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
          throw createBadRequestError(`Request validation failed: ${errorMessage}`)
        }

        // Update request objects with validated data
        if (fullResult.data.body) req.body = fullResult.data.body
        if (fullResult.data.params) req.params = fullResult.data.params
        if (fullResult.data.query) req.query = fullResult.data.query
        if (fullResult.data.headers) req.headers = fullResult.data.headers
      } else {
        // Update request objects with individual validated data
        if (validationData.body) req.body = validationData.body
        if (validationData.params) req.params = validationData.params
        if (validationData.query) req.query = validationData.query
        if (validationData.headers) req.headers = validationData.headers
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Alternative validation function for more specific error handling
 * @param {Object} schema - Zod schema object
 * @returns {Function} Express middleware function
 */
const validateRequest = schema => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
      })

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          received: err.received,
        }))

        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        })
      }

      // Update request objects with validated and transformed data
      req.body = result.data.body || req.body
      req.params = result.data.params || req.params
      req.query = result.data.query || req.query
      req.headers = result.data.headers || req.headers

      next()
    } catch (error) {
      next(error)
    }
  }
}

module.exports = {
  validate,
  validateRequest,
}
