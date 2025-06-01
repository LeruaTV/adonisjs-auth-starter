import UserPasswordReset from '#events/user_password_reset'
import PasswordResetSuccessNotification from '#mails/password_reset_success_notification'
import mail from '@adonisjs/mail/services/main'

export default class SendPasswordResetSuccessEmail {
  async handle(event: UserPasswordReset) {
    await mail.send(new PasswordResetSuccessNotification(event.user.email, event.user.firstName!))
  }
}
