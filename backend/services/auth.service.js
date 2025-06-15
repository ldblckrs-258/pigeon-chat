const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const emailService = require('./email.service')
const securePassword = require('secure-random-password')
const {
  createBadRequestError,
  createUnauthorizedError,
  createNotFoundError,
  createConflictError,
  createValidationError,
} = require('../utils/errorTypes')

class AuthService {
  /**
   * Create JWT token with different expiration types
   */
  createToken(_id, type = 'session-login') {
    const secret = process.env.JWT_SECRET

    let expires
    switch (type) {
      case 'session-login':
        expires = '1d'
        break
      case 'remember-login':
        expires = '30d'
        break
      case 'verify':
        expires = '5m'
        break
      default:
        expires = '1d'
    }

    return jwt.sign({ _id }, secret, {
      expiresIn: expires,
    })
  }

  /**
   * Validate registration data
   */
  validateRegistration(name, email, password) {
    if (!name || !email || !password) {
      throw createBadRequestError('All fields are required')
    }

    if (!validator.isEmail(email)) {
      throw createBadRequestError('Invalid email')
    }

    if (!validator.isStrongPassword(password)) {
      const error = createValidationError('Password is not strong enough')
      error.requirements = [
        'At least 8 characters',
        'At least 1 lowercase letter',
        'At least 1 uppercase letter',
        'At least 1 number',
        'At least 1 symbol',
      ]
      throw error
    }
  }

  /**
   * Register a new user
   */
  async registerUser(name, email, password) {
    // Check if user already exists
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
      throw createConflictError('User already exists')
    }

    // Validate input
    this.validateRegistration(name, email, password)

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    // Create user
    const user = new userModel({
      name,
      email,
      password: hash,
    })

    await user.save()

    // Send verification email
    const token = this.createToken(user._id, 'verify')
    await emailService.sendVerificationEmail(user.email, user.name, token)

    return user
  }

  // Resend verification email
  async resendVerificationEmail(user) {
    if (user?.isVerified) {
      throw createBadRequestError('Account already verified')
    }

    const token = this.createToken(user._id, 'verify')
    await emailService.sendVerificationEmail(user.email, user.name, token)
  }

  // Verify user email
  async verifyEmail(token) {
    if (!token) {
      throw createBadRequestError('Token is required')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(decoded._id)

    if (!user) {
      throw createNotFoundError('User not found')
    }

    if (user.isVerified) {
      return { message: 'Account already verified' }
    }

    user.isVerified = true
    await user.save()

    return { message: 'Account verified successfully' }
  }

  // Login user
  async loginUser(email, password, isRemember = false) {
    const user = await userModel.findOne({ email })

    if (!user) {
      throw createBadRequestError('This email is not registered')
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      throw createBadRequestError('Invalid password')
    }

    const token = this.createToken(user._id, isRemember ? 'remember-login' : 'session-login')

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    }
  }

  /**
   * Change user password
   */
  async changePassword(user, oldPassword, newPassword) {
    const validPassword = await bcrypt.compare(oldPassword, user.password)

    if (!validPassword) {
      throw createBadRequestError('Old password is incorrect')
    }

    if (!validator.isStrongPassword(newPassword)) {
      const error = createValidationError('Password is not strong enough')
      error.requirements = [
        'At least 8 characters',
        'At least 1 lowercase letter',
        'At least 1 uppercase letter',
        'At least 1 number',
        'At least 1 symbol',
      ]
      throw error
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(newPassword, salt)

    user.password = hash
    await user.save()
  }

  /**
   * Update user name and avatar
   */
  async updateUserInfo(user, name, avatar) {
    user.name = name || user.name
    user.avatar = avatar || user.avatar

    await user.save()
  }

  /**
   * Login with Google OAuth
   */
  async googleLogin(accessToken, isRemember = false) {
    if (!accessToken) {
      throw createUnauthorizedError('Unauthorized')
    }

    try {
      // Fetch user info from Google API
      const googleRes = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
      )
      const payload = await googleRes.json()

      if (!payload?.email) {
        throw createUnauthorizedError('Unauthorized')
      }

      let user = await userModel.findOne({ email: payload.email })

      // If user doesn't exist, create new account
      if (!user) {
        const password = securePassword.randomPassword({
          length: 16,
          characters: [
            securePassword.lower,
            securePassword.upper,
            securePassword.digits,
            securePassword.symbols,
          ],
        })

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const newUser = new userModel({
          name: payload.name,
          email: payload.email,
          password: hash,
          avatar: payload.picture,
          isVerified: true,
        })

        user = await newUser.save()
      }

      // Ensure user is verified (Google accounts are pre-verified)
      if (!user.isVerified) {
        user.isVerified = true
        await user.save()
      }

      const token = this.createToken(user._id, isRemember ? 'remember-login' : 'session-login')

      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          role: user.role,
          isVerified: true,
        },
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw createUnauthorizedError('Unauthorized')
    }
  }
}

module.exports = new AuthService()
