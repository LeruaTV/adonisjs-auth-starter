import { test } from '@japa/runner'
import SendPasswordResetSuccessEmail from '#listeners/send_password_reset_success_email'
import UserPasswordReset from '#events/user_password_reset'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import mail from '@adonisjs/mail/services/main'
import PasswordResetSuccessNotification from '#mails/password_reset_success_notification'

test.group('SendPasswordResetSuccessEmail Listener', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should send password reset success email when event is handled', async ({ cleanup }) => {
    const user = await UserFactory.create()

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetSuccessEmail()
    const event = new UserPasswordReset(user)

    await listener.handle(event)

    // Assert that a password reset success email was sent
    mails.assertSentCount(1)
  })

  test('should send email to correct recipient', async ({ cleanup }) => {
    const user = await UserFactory.merge({
      email: 'test@example.com',
      firstName: 'Jane',
    }).create()

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetSuccessEmail()
    const event = new UserPasswordReset(user)

    await listener.handle(event)

    // Assert the email was sent to the correct recipient
    mails.assertSent(PasswordResetSuccessNotification, ({ message }) => {
      return message.hasTo('test@example.com')
    })
  })

  test('should handle multiple password reset success events', async ({ cleanup }) => {
    const user1 = await UserFactory.merge({ email: 'user1@example.com' }).create()
    const user2 = await UserFactory.merge({ email: 'user2@example.com' }).create()

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetSuccessEmail()
    const event1 = new UserPasswordReset(user1)
    const event2 = new UserPasswordReset(user2)

    await listener.handle(event1)
    await listener.handle(event2)

    // Assert that two emails were sent
    mails.assertSentCount(2)
    mails.assertSentCount(PasswordResetSuccessNotification, 2)
  })

  test('should handle user with missing first name', async ({ cleanup }) => {
    const user = await UserFactory.merge({
      email: 'user@example.com',
      firstName: null,
    }).create()

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetSuccessEmail()
    const event = new UserPasswordReset(user)

    // This should not throw an error
    await listener.handle(event)

    // Email should still be sent
    mails.assertSentCount(1)
  })

  test('should send email with correct subject and content validation', async ({ cleanup }) => {
    const user = await UserFactory.merge({
      email: 'user@example.com',
      firstName: 'John',
    }).create()

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetSuccessEmail()
    const event = new UserPasswordReset(user)

    await listener.handle(event)

    // Assert specific email content
    mails.assertSent(PasswordResetSuccessNotification, (notification) => {
      notification.message.assertTo('user@example.com')
      notification.message.assertSubject('Password Reset Successful')
      return true
    })
  })

  test('should not send other notification types', async ({ cleanup }) => {
    const user = await UserFactory.create()

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    const listener = new SendPasswordResetSuccessEmail()
    const event = new UserPasswordReset(user)

    await listener.handle(event)

    // Assert only the correct notification type was sent
    mails.assertSentCount(1)
    mails.assertSentCount(PasswordResetSuccessNotification, 1)
  })
})
