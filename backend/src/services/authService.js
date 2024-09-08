import { createJwt, verifyJwt } from '../utils/jwt.js'
import { config } from 'dotenv'
config()

const JWT_SECRET = process.env.JWT_SECRET

class AuthService {
  /**
   * Tạo Json Web Token (JWT) từ payload
   * @param {Object} payload - Thông tin cần lưu trong JWT token
   * @returns {String} JWT token
   */
  createJwt = async (payload) => {
    return createJwt(payload, JWT_SECRET)
  }

  /**
   * Xác thực JWT token
   * @param {String} token - JWT token
   * @returns {Object} Payload của JWT token
   */
  verifyJwt = async (token) => {
    return verifyJwt(token, JWT_SECRET)
  }

  /**
   * Tạo mã xác thực từ email
   * @param {String} email - Email cần xác thực
   * @returns {String} Mã xác thực
   */
  createVerifyToken = async (email) => {
    return createJwt(
      {
        email,
        exp: Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes
      },
      JWT_SECRET
    )
  }
}

export default new AuthService()
