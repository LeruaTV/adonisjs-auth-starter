import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class VerifyEmailNotification extends BaseMail {
  from = env.get('SMTP_FROM')
  replyTo = env.get('SMTP_FROM')
  subject = 'Verify email address'

  constructor(
    private userEmail: string,
    private token: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.userEmail)
    this.message.subject(this.subject)
    this.message.htmlView('emails/verify_email/html', {
      token: this.token,
    })
    this.message.textView('emails/verify_email/text', {
      token: this.token,
    })
  }
}
