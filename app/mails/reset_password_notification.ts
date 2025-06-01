import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class ResetPasswordNotification extends BaseMail {
  from = env.get('SMTP_FROM')
  subject = 'Reset Your Password'

  constructor(
    private email: string,
    private resetToken: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.email).htmlView('emails/reset_password/html', {
      resetToken: this.resetToken,
      resetUrl: `${env.get('FRONTEND_URL_RESET_PASSWORD')}?token=${this.resetToken}`,
    })
  }
}
