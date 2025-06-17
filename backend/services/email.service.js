const nodemailer = require('nodemailer')
const VerificationMail = require('../static/verification-mail')
const ResetPasswordMail = require('../static/reset-password-mail')
const { createBadRequestError } = require('../utils/errorTypes')

class EmailService {
  constructor() {
    if (!process.env.GMAIL_ADDRESS || !process.env.GMAIL_PASSWORD) {
      console.error('Email credentials are not set in environment variables')
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD,
      },
    })
  }

  /**
   * Sends an email using the configured transporter.
   */
  async sendEmail(email, subject, html) {
    await this.transporter.sendMail({
      from: process.env.GMAIL_ADDRESS,
      to: email,
      subject,
      html,
    })
  }

  /**
   * Sends a verification email to the user.
   */
  async sendVerificationEmail(email, name, token) {
    const subject = 'Email Verification'
    if (!process.env.ORIGIN) throw createBadRequestError('ORIGIN is not defined')
    const url = `${process.env.ORIGIN}/verify-email?token=${token}`
    const html = VerificationMail(name, url)
    await this.sendEmail(email, subject, html)
  }

  /**
   * Sends a password reset email to the user.
   */
  async sendResetPasswordEmail(email, name, token) {
    const subject = 'Reset Your Password - Pigeon Chat'
    if (!process.env.ORIGIN) throw createBadRequestError('ORIGIN is not defined')
    const url = `${process.env.ORIGIN}/reset-password?token=${token}`
    const html = ResetPasswordMail(name, url)
    await this.sendEmail(email, subject, html)
  }
}

module.exports = new EmailService()
