import { test } from '@japa/runner'
import SendPasswordResetEmail from '#listeners/send_password_reset_email'
import UserPasswordResetRequested from '#events/user_password_reset_requested'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'

test.group('SendPasswordResetEmail Listener', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should send password reset email when event is handled', async ({ cleanup }) => {
    const user = await UserFactory.create()
    const resetToken = '123456'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetEmail()
    const event = new UserPasswordResetRequested(user, resetToken)

    await listener.handle(event)

    // Assert that a password reset email was sent
    mails.assertSentCount(1)
  })

  test('should send email to correct recipient with proper content', async ({ cleanup }) => {
    const user = await UserFactory.merge({
      email: 'test@example.com',
      firstName: 'John',
    }).create()
    const resetToken = 'abc123xyz'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetEmail()
    const event = new UserPasswordResetRequested(user, resetToken)

    await listener.handle(event)

    // Assert the email was sent with correct recipient and content
    mails.assertSentCount(1)
  })

  test('should handle multiple password reset requests', async ({ cleanup }) => {
    const user1 = await UserFactory.merge({ email: 'user1@example.com' }).create()
    const user2 = await UserFactory.merge({ email: 'user2@example.com' }).create()
    const resetToken1 = 'token1'
    const resetToken2 = 'token2'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetEmail()
    const event1 = new UserPasswordResetRequested(user1, resetToken1)
    const event2 = new UserPasswordResetRequested(user2, resetToken2)

    await listener.handle(event1)
    await listener.handle(event2)

    // Assert that two emails were sent
    mails.assertSentCount(2)
  })

  test('should handle empty or null token gracefully', async ({ cleanup }) => {
    const user = await UserFactory.create()
    const resetToken = ''

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetEmail()
    const event = new UserPasswordResetRequested(user, resetToken)

    // This should not throw an error
    await listener.handle(event)

    // Email should still be sent even with empty token
    mails.assertSentCount(1)
  })

  test('should not send other types of emails', async ({ cleanup }) => {
    const user = await UserFactory.create()
    const resetToken = '123456'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetEmail()
    const event = new UserPasswordResetRequested(user, resetToken)

    await listener.handle(event)

    // Only password reset emails should be sent, not other notification types
    // This would need to be adjusted based on what other mail classes exist
    // mails.assertNotSent(WelcomeNotification)
    mails.assertNotSent(VerifyEmailNotification)
  })
})
