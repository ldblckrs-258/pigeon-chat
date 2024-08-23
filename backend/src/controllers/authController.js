import User from '../models/userModel.js'
import { createJwt } from '../utils/jwt.js'
import {
  generateSalt,
  hashPassword,
  verifyPassword
} from '../utils/password.js'
import { config } from 'dotenv'
config()

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Controller đăng ký tài khoản
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

    res.status(201).json({ message: 'Register successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Controller đăng nhập
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
 * Controller đăng xuất
 */
export const logout = async (req, res) => {
  res.setHeader(
    'Set-Cookie',
    `token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`
  )
  res.status(200).json({ message: 'Logout successfully' })
}

/**
 * Controller xác thực người dùng khi lân đầu truy cập
 * @param {object} req.user - Thông tin người dùng đã được xác thực qua middleware
 */
export const authenticate = async (req, res) => {
  res.status(200).json({ message: 'Authenticated', user: req.user })
}
