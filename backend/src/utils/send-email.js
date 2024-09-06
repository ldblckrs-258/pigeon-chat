import nodemailer from 'nodemailer'
import { config } from 'dotenv'
config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const APP_PASSWORD = process.env.APP_PASSWORD

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ADMIN_EMAIL,
    pass: APP_PASSWORD
  }
})

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: ADMIN_EMAIL,
      to,
      subject,
      html
    })
  } catch (error) {
    console.error(error)
  }
}
