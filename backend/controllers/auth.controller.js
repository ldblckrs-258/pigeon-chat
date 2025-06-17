const { StatusCodes } = require('http-status-codes')
const authService = require('../services/auth.service')
const catchAsync = require('../utils/catchAsync')

/**
 * Registers a new user.
 */
const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body

  await authService.registerUser(name, email, password)

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'Please check your email to verify your account',
  })
})

/**
 * Resends verification email to user.
 */
const resendVerificationEmail = catchAsync(async (req, res) => {
  const user = req.user

  await authService.resendVerificationEmail(user)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Verification email sent',
  })
})

/**
 * Verifies user email using verification token.
 */
const verify = catchAsync(async (req, res) => {
  const token = req.query.token

  const result = await authService.verifyEmail(token)

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: result,
  })
})

/**
 * Authenticates user and creates session.
 */
const login = catchAsync(async (req, res) => {
  const { email, password, isRemember } = req.body

  const { token, user } = await authService.loginUser(email, password, isRemember)

  res.cookie('token', token, {
    httpOnly: true,
    session: !isRemember,
    ...(isRemember && { maxAge: 30 * 24 * 60 * 60 * 1000 }),
  })

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Logged in successfully',
    user,
  })
})

/**
 * Logs out user by clearing authentication cookie.
 */
const logout = (req, res) => {
  res.clearCookie('token')
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Logged out successfully',
  })
}

/**
 * Returns current authenticated user information.
 */
const myAccount = (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Authenticated successfully',
    user: {
      id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
    },
  })
}

/**
 * Changes user password after validating current password.
 */
const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  await authService.changePassword(req.user, oldPassword, newPassword)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Password changed successfully',
  })
})

/**
 * Updates user profile information.
 */
const updateInfo = catchAsync(async (req, res) => {
  const { name, avatar } = req.body

  await authService.updateUserInfo(req.user, name, avatar)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Information updated successfully',
  })
})

/**
 * Authenticates user using Google OAuth access token.
 */
const googleLogin = catchAsync(async (req, res) => {
  const { access_token, isRemember } = req.body

  const { token, user } = await authService.googleLogin(access_token, isRemember)

  res.cookie('token', token, {
    httpOnly: true,
    session: !isRemember,
    ...(isRemember && { maxAge: 30 * 24 * 60 * 60 * 1000 }),
  })

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Logged in successfully',
    user,
  })
})

/**
 * Sends forgot password email to user.
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body

  const result = await authService.forgotPassword(email)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: result.message,
  })
})

/**
 * Resets user password using reset token.
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body

  const result = await authService.resetPassword(token, newPassword)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: result.message,
  })
})

module.exports = {
  register,
  login,
  logout,
  myAccount,
  changePassword,
  updateInfo,
  googleLogin,
  verify,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
}
