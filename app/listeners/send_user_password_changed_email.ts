import type UserPasswordChanged from '#events/user_password_changed'
import PasswordResetSuccessNotification from '#mails/password_reset_success_notification'
import mail from '@adonisjs/mail/services/main'

export default class SendUserPasswordChangedEmail {
  async handle(event: UserPasswordChanged) {
    await mail.send(new PasswordResetSuccessNotification(event.user.email, event.user.firstName!))
  }
}
