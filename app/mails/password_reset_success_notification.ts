import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class PasswordResetSuccessNotification extends BaseMail {
  from = env.get('SMTP_FROM')
  subject = 'Password Reset Successful'

  constructor(
    private email: string,
    private firstName: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.email).htmlView('emails/password_reset_success/html', {
      firstName: this.firstName,
    })
  }
}
