import crypto from 'crypto'

const SALT_LENGTH = 16
const ITERATIONS = 10000
const KEY_LENGTH = 64
const DIGEST = 'sha512'

/**
 * Tạo salt ngẫu nhiên
 * @returns {string} Salt ngẫu nhiên
 */
const generateSalt = () => {
  return crypto.randomBytes(SALT_LENGTH).toString('hex')
}

/**
 * Mã hóa mật khẩu
 * @param {string} password - Mật khẩu cần mã hóa
 * @param {string} salt - Salt
 * @returns {string} Mật khẩu đã mã hóa
 */
const hashPassword = (password, salt) => {
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
  return hash.toString('hex')
}

/**
 * Xác minh mật khẩu
 * @param {string} password - Mật khẩu cần xác minh
 * @param {string} hashedPassword - Mật khẩu đã mã hóa
 * @param {string} salt - Salt
 * @returns {boolean} Kết quả xác minh
 */
const verifyPassword = (password, hashedPassword, salt) => {
  const hash = hashPassword(password, salt)
  return hash === hashedPassword
}

export { generateSalt, hashPassword, verifyPassword }
