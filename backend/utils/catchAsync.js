/**
 * Wrapper function to catch async errors and pass them to Express error handler
 * Eliminates the need for try-catch blocks in async route handlers
 *
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - Express middleware function
 */
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

module.exports = catchAsync
