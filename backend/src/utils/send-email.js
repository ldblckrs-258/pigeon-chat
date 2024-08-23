import tls from 'tls'
import { Buffer } from 'buffer'
import { config } from 'dotenv'
config()

const SMTP_PORT = 465
const SMTP_HOST = 'smtp.gmail.com'
const USER_EMAIL = process.env.USER_EMAIL
const APP_PASSWORD = process.env.APP_PASSWORD

/**
 * Gửi email bằng Gmail SMTP
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} message - Nội dung email
 */
export const sendEmail = (to, subject, message) => {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(SMTP_PORT, SMTP_HOST, {
      rejectUnauthorized: false
    })

    socket.on('secureConnect', () => {
      socket.write(`EHLO ${SMTP_HOST}\r\n`)
    })

    socket.on('data', (data) => {
      const response = data.toString()
      console.log('Response:', response)

      // Cần viết logic lắng nghe response từ server và gửi email
      socket.end()
      resolve()
    })

    socket.on('error', (err) => {
      console.error('Socket error:', err)
      reject(err)
    })
  })
}
