import UserPasswordResetRequested from '#events/user_password_reset_requested'
import ResetPasswordNotification from '#mails/reset_password_notification'
import mail from '@adonisjs/mail/services/main'

export default class SendPasswordResetEmail {
  async handle(event: UserPasswordResetRequested) {
    await mail.send(new ResetPasswordNotification(event.user.email, event.resetToken))
  }
}
