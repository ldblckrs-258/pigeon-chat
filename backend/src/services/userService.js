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
    const existUser = await User.findOne({ email })
    if (existUser) return null

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
  }

  /**
   * Kiểm tra đăng nhập
   * @param {String} email - Email người dùng
   * @param {String} password - Mật khẩu người dùng
   * @returns {Object} Thông tin người dùng
   * @throws {Error} Lỗi khi email không tồn tại hoặc mật khẩu không đúng
   */
  login = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
      const error = new Error('Email does not exist')
      error.name = 'LoginError'
      throw error
    } else if (!verifyPassword(password, user.hashPassword, user.salt)) {
      const error = new Error('Password is incorrect')
      error.name = 'LoginError'
      throw error
    } else
      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.isVerified
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
    const user = await User.findById(userId)
    user.name = name
    user.avatar = avatar
    await user.save()
    return user
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
    const user = await User.findById(userId)
    if (!verifyPassword(oldPassword, user.hashPassword, user.salt)) {
      throw new Error('Old password is incorrect')
    }
    const salt = generateSalt()
    user.hashPassword = hashPassword(newPassword, salt)
    user.salt = salt
    await user.save()
    return user
  }

  /**
   * Lấy thông tin người dùng theo ID
   * @param {String} userId - ID người dùng
   * @returns {Object} Thông tin người dùng
   */
  getUserById = async (userId) => {
    return await User.findById(userId).select('-hashPassword -salt')
  }

  /**
   * Lấy thông tin người dùng theo email
   * @param {String} email - Email người dùng
   * @returns {Object} Thông tin người dùng
   */
  getUserByEmail = async (email) => {
    return await User.findOne({ email }).select('-hashPassword -salt')
  }

  /**
   * Lấy danh sách Id người dùng có tồn tại
   * @param {Array} userIds - Danh sách ID người dùng
   * @returns {Array} Danh sách ID người dùng có tồn tại
   */
  validateUserIds = async (userIds) => {
    const result = await User.find({ _id: { $in: userIds } }).select('_id')

    if (!result) return []

    return result.map((user) => user._id.toString())
  }
}

export default new UserService()
