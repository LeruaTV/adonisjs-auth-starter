import UserRegistered from '#events/user_registered'
import VerifyEmailNotification from '#mails/verify_email_notification'
import { UserTokenService } from '#services/user_token_service'
import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'

export default class SendVerificationEmail {
  @inject()
  async handle(event: UserRegistered, userTokensService: UserTokenService) {
    const token = await userTokensService.generateNumeric(event.user)

    await mail.send(new VerifyEmailNotification(event.user.email, token))
  }
}
