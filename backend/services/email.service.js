const nodemailer = require("nodemailer");
const VerificationMail = require("../static/verification-mail");

class EmailService {
  constructor() {
    if (!process.env.GMAIL_ADDRESS || !process.env.GMAIL_PASSWORD) {
      console.error("Email credentials are not set in environment variables");
    }

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  /**
   * Sends an email using the configured transporter.
   */
  async sendEmail(email, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_ADDRESS,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  /**
   * Sends a verification email to the user.
   */
  async sendVerificationEmail(email, name, token) {
    const subject = "Email Verification";
    if (!process.env.ORIGIN) console.error("ORIGIN is not defined");
    const url = `${process.env.ORIGIN}/verify-email?token=${token}`;
    const html = VerificationMail(name, url);
    await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();
