const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const { createUnauthorizedError } = require('../utils/errorTypes')

const authenticate = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    throw createUnauthorizedError('Unauthorized')
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const detectedUser = await userModel.findById(decoded._id)

  if (!detectedUser) {
    throw createUnauthorizedError('Unauthorized')
  }

  req.user = detectedUser
  next()
})

const simpleAuth = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    throw createUnauthorizedError('Unauthorized')
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  if (!decoded || !decoded._id) {
    throw createUnauthorizedError('Unauthorized')
  }

  req.user = { _id: decoded._id }
  next()
})

module.exports = {
  authenticate,
  simpleAuth,
}
