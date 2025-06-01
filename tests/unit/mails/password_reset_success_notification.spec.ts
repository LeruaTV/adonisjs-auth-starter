import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import PasswordResetSuccessNotification from '#mails/password_reset_success_notification'

test.group('PasswordResetSuccessNotification', () => {
  test('should send notification with correct properties', async ({ cleanup }) => {
    const email = 'test@example.com'
    const firstName = 'John'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    await mail.send(new PasswordResetSuccessNotification(email, firstName))

    mails.assertSent(PasswordResetSuccessNotification, ({ message }) => {
      return message.hasTo(email) && message.hasSubject('Password Reset Successful')
    })
  })

  test('should send notification to correct recipient', async ({ cleanup }) => {
    const email = 'user@example.com'
    const firstName = 'Jane'

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    await mail.send(new PasswordResetSuccessNotification(email, firstName))

    mails.assertSent(PasswordResetSuccessNotification, (notification) => {
      notification.message.assertTo(email)
      notification.message.assertSubject('Password Reset Successful')
      return true
    })
  })

  test('should handle empty first name', async ({ cleanup }) => {
    const email = 'test@example.com'
    const firstName = ''

    const { mails } = mail.fake()

    cleanup(() => {
      mail.restore()
    })

    await mail.send(new PasswordResetSuccessNotification(email, firstName))

    mails.assertSentCount(1)
  })
})
