import VerifyEmailNotification from '#mails/verify_email_notification'
import { test } from '@japa/runner'
import env from '#start/env'

test.group('Mails - verify email notification', () => {
  test('prepare email for sending', async () => {
    const emailAddress = 'user1@example.org'
    const token = '1234567890abcdef'

    const email = new VerifyEmailNotification(emailAddress, token)

    /**
     * Build email message and render templates to
     * compute the email HTML and plain text
     * contents
     */
    await email.buildWithContents()

    /**
     * Write assertions to ensure the message is built
     * as expected
     */
    email.message.assertTo(emailAddress)
    email.message.assertFrom(env.get('SMTP_FROM'))
    email.message.assertReplyTo(env.get('SMTP_FROM'))
    email.message.assertSubject('Verify email address')
    email.message.assertHtmlIncludes('Verify your email address')
    email.message.assertTextIncludes('Verify your email address')
  })
})
