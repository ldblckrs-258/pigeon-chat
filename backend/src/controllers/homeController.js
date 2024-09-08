import MailService from '../services/mailService.js'

class HomeController {
  sendMail = async (req, res) => {
    try {
      const { to, subject, text, html } = req.body
      await MailService.sendMail(to, subject, text, html)
      res.json({ message: 'Mail sent' })
    } catch (error) {
      console.error(error)
      res.status(400).json({ message: 'Mail failed to send' })
    }
  }
}

export default new HomeController()
