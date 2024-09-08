import User from '../models/userModel.js'
import {
  generateSalt,
  hashPassword,
  verifyPassword
} from '../utils/password.js'
import { config } from 'dotenv'
config()

class UserService {
  /**
   * Tạo tài khoản người dùng
   * @param {String} email - Email người dùng
   * @param {String} password - Mật khẩu người dùng
   * @param {String} name - Tên người dùng
   * @returns {Object} Thông tin người dùng
   */
  createAccount = async (email, password, name) => {
    try {
      const salt = generateSalt()
      const hash = hashPassword(password, salt)
      const newUser = new User({ email, hashPassword: hash, salt, name })
      await newUser.save()
      return {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        isVerified: newUser.isVerified
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Kiểm tra đăng nhập
   * @param {String} email - Email người dùng
   * @param {String} password - Mật khẩu người dùng
   * @returns {Object} Thông tin người dùng
   * @throws {Error} Lỗi khi email không tồn tại hoặc mật khẩu không đúng
   */
  login = async (email, password) => {
    try {
      const user = await User.findOne({ email })
      if (!user) {
        throw new Error('This email is not registered')
      }
      if (!verifyPassword(password, user.hashPassword, user.salt)) {
        throw new Error('Password is incorrect')
      }
      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Thay đổi thông tin người dùng
   * @param {String} userId - ID người dùng
   * @param {String} name - Tên người dùng
   * @param {String} avatar - Ảnh đại diện
   * @returns {Object} Thông tin người dùng
   */
  changeInfo = async (userId, name, avatar) => {
    try {
      const user = await User.findById(userId)
      user.name = name
      user.avatar = avatar
      await user.save()
      return user
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Thay đổi mật khẩu tài khoản người dùng
   * @param {String} userId - ID người dùng
   * @param {String} oldPassword - Mật khẩu cũ
   * @param {String} newPassword - Mật khẩu mới
   * @returns {Object} Thông tin người dùng
   * @throws {Error} Lỗi khi mật khẩu cũ không đúng
   */
  changePassword = async (userId, oldPassword, newPassword) => {
    try {
      const user = await User.findById(userId)
      if (!verifyPassword(oldPassword, user.hashPassword, user.salt)) {
        throw new Error('Old password is incorrect')
      }
      const salt = generateSalt()
      user.hashPassword = hashPassword(newPassword, salt)
      user.salt = salt
      await user.save()
      return user
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   * @param {String} userId - ID người dùng
   * @returns {Object} Thông tin người dùng
   */
  getUserById = async (userId) => {
    try {
      return await User.findById(userId).select('-hashPassword -salt')
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Lấy thông tin người dùng theo email
   * @param {String} email - Email người dùng
   * @returns {Object} Thông tin người dùng
   */
  getUserByEmail = async (email) => {
    try {
      return await User.findOne({ email }).select('-hashPassword -salt')
    } catch (error) {
      console.error(error)
    }
  }
}

export default new UserService()
