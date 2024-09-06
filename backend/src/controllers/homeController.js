import { sendEmail } from '../utils/send-email.js'
import VerificationMail from '../static/verification-mail.js'
export const getHome = (req, res) => {
  res.status(200).json({ message: 'Welcome to the home page' })
}

export const sendAnEmail = async (req, res) => {
  try {
    const { to, subject, name, url } = req.body
    if (!to || !subject || !name || !url) {
      res.status(400).json({ message: 'Missing required fields' })
      return
    }
    await sendEmail(to, subject, VerificationMail(name, url))
    res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}
