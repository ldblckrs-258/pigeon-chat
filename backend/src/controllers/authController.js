import User from '../models/userModel.js'
import { createJwt, verifyJwt } from '../utils/jwt.js'
import { sendEmail } from '../utils/send-email.js'
import VerificationMail from '../static/verification-mail.js'
import {
  generateSalt,
  hashPassword,
  verifyPassword
} from '../utils/password.js'
import { config } from 'dotenv'
config()

const JWT_SECRET = process.env.JWT_SECRET
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'

/**
 * Gửi email xác thực tài khoản
 * @param {string} name - Tên người dùng
 * @param {string} email - Email người dùng
 * @returns {Promise<void>}
 * @throws {Error}
 */
const sendVerificationEmail = async (name, email) => {
  try {
    const token = createJwt(
      {
        email,
        exp: Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes
      },
      JWT_SECRET
    )
    const url = `${CLIENT_URL}/verify-email?token=${token}`

    const html = VerificationMail(name, url)
    await sendEmail(email, 'Verify your email', html)
  } catch (error) {
    console.log(error)
  }
}

/**
 * Handler function đăng ký tài khoản
 * @param req.body.email - Email người dùng
 * @param req.body.password - Mật khẩu người dùng
 * @param req.body.name - Tên người dùng
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body
    const salt = generateSalt()
    const hash = hashPassword(password, salt)
    const newUser = new User({ email, hashPassword: hash, salt, name })
    await newUser.save()

    await sendVerificationEmail(name, email)

    res.status(201).json({
      message:
        'Register successfully, please check your email to verify your account'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const resendVerificationEmail = async (req, res) => {
  try {
    if (req.user.isVerified) {
      res.status(400).json({ message: 'Email has been verified' })
      return
    }

    await sendVerificationEmail(req.user.name, email)
    res.status(200).json({ message: 'Verification email sent' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query
    const { email } = verifyJwt(token, JWT_SECRET)
    const user = await User.findOne({ email })
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    user.isVerified = true
    await user.save()
    res.status(200).json({ message: 'Email verified successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Handler function đăng nhập
 * @param req.body.email - Email người dùng
 * @param req.body.password - Mật khẩu người dùng
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      res.status(404).json({ message: 'This email has not been registered' })
      return
    }

    const isValid = verifyPassword(password, user.hashPassword, user.salt)
    if (!isValid) {
      res.status(401).json({ message: 'Invalid password' })
      return
    }

    const token = createJwt(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        exp: Math.floor(Date.now() / 1000) + 60 * 60
      },
      JWT_SECRET
    )
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly`)
    res.status(200).json({ message: 'Login successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Handler function đăng xuất
 */
export const logout = async (req, res) => {
  res.setHeader(
    'Set-Cookie',
    `token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`
  )
  res.status(200).json({ message: 'Logout successfully' })
}

/**
 * Handler function xác thực người dùng khi lân đầu truy cập
 * @param {object} req.user - Thông tin người dùng đã được xác thực qua middleware
 */
export const authenticate = async (req, res) => {
  res.status(200).json({ message: 'Authenticated', user: req.user })
}
