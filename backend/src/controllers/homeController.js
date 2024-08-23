import { sendEmail } from '../utils/send-email.js'
export const getHome = (req, res) => {
  res.status(200).json({ message: 'Welcome to the home page' })
}

export const sendAnEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body
    if (!to || !subject || !message) {
      res.status(400).json({ message: 'Missing required fields' })
      return
    }
    await sendEmail(to, subject, message)
    res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}
