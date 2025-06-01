import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import emitter from '@adonisjs/core/services/emitter'
import UserPasswordResetRequested from '#events/user_password_reset_requested'
import UserPasswordReset from '#events/user_password_reset'
import mail from '@adonisjs/mail/services/main'
import { UserTokenService } from '#services/user_token_service'

test.group('Password Reset Integration', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should complete full password reset flow', async ({ client, assert, cleanup }) => {
    const events = emitter.fake()
    const mailSpy = mail.fake()

    cleanup(() => {
      emitter.restore()
      mail.restore()
    })

    // Step 1: Create user
    const user = await UserFactory.merge({
      email: 'test@example.com',
      password: 'oldPassword123',
    }).create()

    // Step 2: Request password reset
    const forgotResponse = await client.post('/api/v1/auth/forgot-password').json({
      email: 'test@example.com',
    })

    forgotResponse.assertStatus(200)
    events.assertEmitted(UserPasswordResetRequested)

    // Step 3: Get the reset token from the database
    const userTokenService = new UserTokenService()
    const tokens = await user.related('tokens').query()
    assert.lengthOf(tokens, 1)
    const resetToken = tokens[0].token

    // Step 4: Reset password using token
    const newPassword = 'newPassword123'
    const resetResponse = await client.post('/api/v1/auth/reset-password').json({
      token: resetToken,
      password: newPassword,
      passwordConfirmation: newPassword,
    })

    resetResponse.assertStatus(200)
    events.assertEmitted(UserPasswordReset)

    // Step 5: Verify password was changed by logging in with new password
    const loginResponse = await client.post('/api/v1/auth/login').json({
      email: 'test@example.com',
      password: newPassword,
    })

    loginResponse.assertStatus(200)

    // Step 6: Verify old password no longer works
    const oldPasswordResponse = await client.post('/api/v1/auth/login').json({
      email: 'test@example.com',
      password: 'oldPassword123',
    })

    oldPasswordResponse.assertStatus(400)

    // Step 7: Verify token was deleted
    const remainingTokens = await user.related('tokens').query()
    assert.lengthOf(remainingTokens, 0)

    // Step 8: Verify emails were sent
    assert.isTrue(
      mailSpy.exists((mail) => {
        return mail.message.subject === 'Reset Your Password'
      })
    )

    assert.isTrue(
      mailSpy.exists((mail) => {
        return mail.message.subject === 'Password Reset Successful'
      })
    )
  })

  test('should not allow reusing the same reset token', async ({ client, assert, cleanup }) => {
    const events = emitter.fake()
    const mailSpy = mail.fake()

    cleanup(() => {
      emitter.restore()
      mail.restore()
    })

    const user = await UserFactory.merge({
      email: 'test@example.com',
    }).create()

    // Request password reset
    await client.post('/api/v1/auth/forgot-password').json({
      email: 'test@example.com',
    })

    // Get the reset token
    const tokens = await user.related('tokens').query()
    const resetToken = tokens[0].token

    // Use token to reset password
    const newPassword = 'newPassword123'
    const firstResetResponse = await client.post('/api/v1/auth/reset-password').json({
      token: resetToken,
      password: newPassword,
      passwordConfirmation: newPassword,
    })

    firstResetResponse.assertStatus(200)

    // Try to use the same token again
    const secondResetResponse = await client.post('/api/v1/auth/reset-password').json({
      token: resetToken,
      password: 'anotherPassword123',
      passwordConfirmation: 'anotherPassword123',
    })

    secondResetResponse.assertStatus(500)
  })

  test('should handle expired reset tokens', async ({ client, cleanup }) => {
    const events = emitter.fake()
    const mailSpy = mail.fake()

    cleanup(() => {
      emitter.restore()
      mail.restore()
    })

    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create an expired token
    const expiredToken = await userTokenService.generateNumeric(user, 6, { hours: -1 })

    // Try to reset password with expired token
    const response = await client.post('/api/v1/auth/reset-password').json({
      token: expiredToken,
      password: 'newPassword123',
      passwordConfirmation: 'newPassword123',
    })

    response.assertStatus(500)
  })
})
