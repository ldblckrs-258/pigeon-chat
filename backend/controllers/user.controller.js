const { StatusCodes } = require('http-status-codes')
const catchAsync = require('../utils/catchAsync')
const userService = require('../services/user.service')
const { createBadRequestError } = require('../utils/errorTypes')

/**
 * Retrieves user information by user ID.
 */
const getUser = catchAsync(async (req, res) => {
  const userId = req.query.id

  if (!userId) {
    throw createBadRequestError('User ID is required')
  }

  const user = await userService.getUserById(userId)

  res.status(StatusCodes.OK).json({
    status: 'success',
    user,
  })
})

/**
 * Finds a user by their email address.
 */
const findUserByEmail = catchAsync(async (req, res) => {
  const email = req.query.email

  if (!email) {
    throw createBadRequestError('Email is required')
  }

  const user = await userService.findUserByEmail(email)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'User found',
    user,
  })
})

/**
 * Searches for users by name with optional search query.
 */
const getUsers = catchAsync(async (req, res) => {
  const search = req.query.search || ''

  const users = await userService.searchUsers(search)

  res.status(StatusCodes.OK).json({
    status: 'success',
    results: users.length,
    users,
  })
})

module.exports = { getUser, getUsers, findUserByEmail }
