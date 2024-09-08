import nodemailer from 'nodemailer'
import VerificationMail from '../static/verification-mail.js'
import { config } from 'dotenv'
config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const APP_PASSWORD = process.env.APP_PASSWORD

class MailService {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ADMIN_EMAIL,
      pass: APP_PASSWORD
    }
  })

  /**
   * Gửi email qua gmail
   * @param {String} to - Email người nhận
   * @param {String} subject - Tiêu đề email
   * @param {String} text - Nội dung email dạng text
   * @param {String} html - Nội dung email dạng html
   */
  sendMail = async (to, subject, text, html) => {
    try {
      const transporter = this.transporter
      await transporter.sendMail({ from: ADMIN_EMAIL, to, subject, text, html })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Gửi email xác thực đến người dùng
   * @param {String} name - Tên người dùng
   * @param {String} email - Email người dùng
   * @param {String} url - Đường dẫn xác thực
   */
  sendVerificationEmail = async (name, email, url) => {
    try {
      const html = VerificationMail(name, url)
      await this.sendMail(email, 'Verify your email', '', html)
    } catch (error) {
      console.error(error)
    }
  }
}

export default new MailService()
