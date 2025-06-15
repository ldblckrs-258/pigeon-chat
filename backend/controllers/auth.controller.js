const authService = require('../services/auth.service')

/**
 * Registers a new user.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  const { name, email, password } = req.body

  try {
    await authService.registerUser(name, email, password)

    res.status(201).send({
      message: 'Please check your email to verify your account',
    })
  } catch (err) {
    console.error(err)

    if (err.message === 'User already exists') {
      return res.status(400).send({ message: err.message })
    }

    if (err.message === 'All fields are required' || err.message === 'Invalid email') {
      return res.status(400).send({ message: err.message })
    }

    if (err.message === 'Password is not strong enough') {
      return res.status(400).send({
        message: err.message,
        requirements: err.requirements,
      })
    }

    res.status(500).send({ message: err.message || 'Registration failed' })
  }
}

/**
 * Resends verification email to user.
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const resendVerificationEmail = async (req, res) => {
  const user = req.user

  try {
    await authService.resendVerificationEmail(user)
    res.status(200).send({ message: 'Verification email sent' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Account already verified') {
      return res.status(400).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to send verification email' })
  }
}

/**
 * Verifies user email using verification token.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.token - Email verification token
 * @param {Object} res - Express response object
 */
const verify = async (req, res) => {
  const token = req.query.token

  try {
    const result = await authService.verifyEmail(token)
    res.status(200).send(result)
  } catch (err) {
    console.error(err)

    if (err.message === 'Token is required' || err.message === 'User not found') {
      return res.status(400).send({ message: err.message })
    }

    res.status(400).send({ message: 'Invalid token' })
  }
}

/**
 * Authenticates user and creates session.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {boolean} [req.body.isRemember=false] - Whether to remember session
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  const { email, password, isRemember } = req.body

  try {
    const { token, user } = await authService.loginUser(email, password, isRemember)

    res.cookie('token', token, {
      httpOnly: true,
      session: !isRemember,
      ...(isRemember && { maxAge: 30 * 24 * 60 * 60 * 1000 }),
    })

    res.status(200).send({
      message: 'Logged in successfully',
      user,
    })
  } catch (err) {
    console.error(err)

    if (err.message === 'This email is not registered' || err.message === 'Invalid password') {
      return res.status(400).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Login failed' })
  }
}

/**
 * Logs out user by clearing authentication cookie.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = (req, res) => {
  res.clearCookie('token')
  res.status(200).send({ message: 'Logged out successfully' })
}

/**
 * Returns current authenticated user information.
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const myAccount = (req, res) => {
  res.status(200).send({
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
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.oldPassword - Current password
 * @param {string} req.body.newPassword - New password
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body

  try {
    await authService.changePassword(req.user, oldPassword, newPassword)
    res.status(200).send({ message: 'Password changed successfully' })
  } catch (err) {
    console.error(err)

    if (err.message === 'Old password is incorrect') {
      return res.status(400).send({ message: err.message })
    }

    if (err.message === 'Password is not strong enough') {
      return res.status(400).send({
        message: err.message,
        requirements: err.requirements,
      })
    }

    res.status(500).send({ message: err.message || 'Password change failed' })
  }
}

/**
 * Updates user profile information.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} [req.body.name] - User's full name
 * @param {string} [req.body.avatar] - User's avatar URL or base64 image
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const updateInfo = async (req, res) => {
  const { name, avatar } = req.body

  try {
    await authService.updateUserInfo(req.user, name, avatar)
    res.status(200).send({ message: 'Information updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err.message || 'Information update failed' })
  }
}

/**
 * Authenticates user using Google OAuth access token.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.access_token - Google OAuth access token
 * @param {boolean} [req.body.isRemember=false] - Whether to remember session
 * @param {Object} res - Express response object
 */
const googleLogin = async (req, res) => {
  const { access_token, isRemember } = req.body

  try {
    const { token, user } = await authService.googleLogin(access_token, isRemember)

    res.cookie('token', token, {
      httpOnly: true,
      session: !isRemember,
      ...(isRemember && { maxAge: 30 * 24 * 60 * 60 * 1000 }),
    })

    res.status(200).send({
      message: 'Logged in successfully',
      user,
    })
  } catch (err) {
    console.error(err)

    if (err.message === 'Unauthorized') {
      return res.status(401).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Google login failed' })
  }
}

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
}
