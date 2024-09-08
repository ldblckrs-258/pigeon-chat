import crypto from 'crypto'

/**
 *  Hàm mã hóa chuỗi sang Base64
 * @param {string} str - Chuỗi cần mã hóa
 *  @returns {string} Chuỗi đã mã hóa
 */
const base64Encode = (str) => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

/**
 *  Hàm giải mã chuỗi Base64
 *  @param {string} str - Chuỗi cần giải mã
 *  @returns {string} Chuỗi đã giải mã
 */
const base64Decode = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return Buffer.from(str, 'base64').toString()
}

/**
 *  Hàm tạo chữ ký HMAC-SHA256
 *  @param {string} header - Header của JWT
 *  @param {string} payload - Payload của JWT
 *  @param {string} secret - Khóa bí mật
 *  @returns {string} Chữ ký HMAC-SHA256
 */

const createHmacSha256Signature = (header, payload, secret) => {
  const data = `${header}.${payload}`
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

/**
 *  Hàm tạo Json Web Token (JWT)
 *  @param {object} payload - Dữ liệu của JWT
 *  @param {string} secret - Khoá bí mật
 *  @returns {string} Chuỗi JWT
 */
const createJwt = (payload, secret) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const encodedHeader = base64Encode(JSON.stringify(header))
  const encodedPayload = base64Encode(JSON.stringify(payload))
  const signature = createHmacSha256Signature(
    encodedHeader,
    encodedPayload,
    secret
  )

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 *  Hàm xác minh JWT
 *  @param {string} token - JWT cần xác minh
 *  @param {string} secret - Khoá bí mật
 *  @returns {object} Dữ liệu trong JWT
 */
const verifyJwt = (token, secret) => {
  const [encodedHeader, encodedPayload, signature] = token.split('.')

  const validSignature = createHmacSha256Signature(
    encodedHeader,
    encodedPayload,
    secret
  )
  if (signature !== validSignature) {
    throw new Error('Invalid signature')
  }

  const payload = JSON.parse(base64Decode(encodedPayload))

  const currentTime = Math.floor(Date.now() / 1000)
  if (payload.exp && currentTime > payload.exp) {
    const error = new Error('Token expired')
    error.name = 'TokenExpiredError'
    throw error
  }

  return payload
}

export { createJwt, verifyJwt }
