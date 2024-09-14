import userService from '../services/userService.js'
import authService from '../services/authService.js'
import mailService from '../services/mailService.js'
import { config } from 'dotenv'
config()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000/api'

class AuthController {
  sendVerifyEmail = async (email, name) => {
    try {
      const verifyToken = await authService.createVerifyToken(email)
      const url = `${CLIENT_URL}/auth/verify-email?token=${verifyToken}`
      await mailService.sendVerificationEmail(name, email, url)
    } catch (error) {
      console.error(error)
    }
  }

  register = async (req, res) => {
    try {
      const { email, password, name } = req.body
      const user = await userService.createAccount(email, password, name)

      if (!user) {
        res.status(400).json({ message: 'Email is already registered' })
        return
      }

      await this.sendVerifyEmail(email, name)
      res.json({
        message:
          'Registration successful, please check your email for verification',
        user
      })
    } catch (error) {
      console.error(error)
      res.status(400).json({ message: 'Registration failed, please try again' })
    }
  }

  verifyEmail = async (req, res) => {
    try {
      const { token } = req.query
      const payload = await authService.verifyJwt(token)
      const user = await userService.getUserByEmail(payload.email)
      if (!user) {
        res.status(400).json({ message: 'Email verification failed' })
        return
      }
      user.isVerified = true
      await user.save()
      res.json({ message: 'Your email has been verified' })
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        res.status(400).json({ message: 'Email verification link has expired' })
        return
      }
      console.error(error)
      res.status(400).json({ message: 'Email verification failed' })
    }
  }

  resendVerifyEmail = async (req, res) => {
    try {
      const user = req.user
      if (user.isVerified) {
        res.status(400).json({ message: 'Email is already verified' })
        return
      }
      await this.sendVerifyEmail(user.email, user.name)
      res.json({
        message:
          'Verification email sent, please check your inbox or spam folder'
      })
    } catch (error) {
      console.error(error)
      res.status(400).json({ message: 'Failed to send verification email' })
    }
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body
      const user = await userService.login(email, password)
      if (!user) {
        res.status(400).json({ message: 'Invalid email or password' })
        return
      }
      const token = await authService.createJwt({ _id: user._id })
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      })
      res.json({ message: 'Login successful', user })
    } catch (error) {
      if (error.name === 'LoginError') {
        res.status(400).json({ message: error.message })
        return
      }

      console.error(error)
      res.status(400).json({ message: 'Login failed, please try again' })
    }
  }

  authenticate = async (req, res) => {
    res.status(200).json({ message: 'Authenticated', user: req.user })
  }

  logout = async (req, res) => {
    res.clearCookie('token').json({ message: 'Logout successful' })
  }
}

export default new AuthController()
