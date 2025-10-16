import emailjs from '@emailjs/browser'
import email from '../config/email.js'

emailjs.init(email.publicKey)

export async function sendEmail({
  to_email,
  subject,
  message,
  attachments = []
}) {
  try {
    const templateParams = {
      to_email,
      subject,
      message,
      ...(attachments.length > 0 && { attachments: attachments })
    }

    const response = await emailjs.send(
      email.serviceId,
      email.templateId,
      templateParams
    )

    return response
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
