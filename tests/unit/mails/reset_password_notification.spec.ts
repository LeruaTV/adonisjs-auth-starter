import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import ResetPasswordNotification from '#mails/reset_password_notification'

test.group('ResetPasswordNotification', () => {
  test('should send notification with correct properties', async ({ cleanup }) => {
    const email = 'test@example.com'
    const resetToken = '123456'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    await mail.send(new ResetPasswordNotification(email, resetToken))

    mails.assertSent(ResetPasswordNotification, ({ message }) => {
      return message.hasTo(email) && message.hasSubject('Reset Your Password')
    })
  })

  test('should send notification to correct recipient with token', async ({ cleanup }) => {
    const email = 'user@example.com'
    const resetToken = 'abc123def'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    await mail.send(new ResetPasswordNotification(email, resetToken))

    mails.assertSent(ResetPasswordNotification, (notification) => {
      notification.message.assertTo(email)
      notification.message.assertSubject('Reset Your Password')
      return true
    })
  })

  test('should handle empty reset token', async ({ cleanup }) => {
    const email = 'test@example.com'
    const resetToken = ''

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    await mail.send(new ResetPasswordNotification(email, resetToken))

    mails.assertSentCount(1)
  })

  test('should not send other notification types', async ({ cleanup }) => {
    const email = 'test@example.com'
    const resetToken = '123456'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    await mail.send(new ResetPasswordNotification(email, resetToken))

    // Assert only one email was sent and it's the correct type
    mails.assertSentCount(1)
    mails.assertSentCount(ResetPasswordNotification, 1)
  })
})
