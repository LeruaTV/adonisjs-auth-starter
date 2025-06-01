import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import { UserTokenService } from '#services/user_token_service'
import emitter from '@adonisjs/core/services/emitter'
import UserPasswordReset from '#events/user_password_reset'

test.group('Auth Controller - resetPassword', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should reset password with valid token and dispatch event', async ({
    client,
    cleanup,
    assert,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()
    const resetToken = await userTokenService.generateNumeric(user, 6, { hours: 1 })

    const newPassword = 'newPassword123'

    const response = await client.post('/api/v1/auth/reset-password').json({
      token: resetToken,
      password: newPassword,
      passwordConfirmation: newPassword,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Password has been reset successfully',
    })

    // Verify user object is returned
    const body = response.body()
    assert.isObject(body.user)
    assert.equal(body.user.email, user.email)

    // Assert that UserPasswordReset event was dispatched
    events.assertEmitted(UserPasswordReset)
  })

  test('should return error with invalid token', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const response = await client.post('/api/v1/auth/reset-password').json({
      token: 'invalid-token',
      password: 'newPassword123',
      passwordConfirmation: 'newPassword123',
    })

    response.assertStatus(500)

    // Assert that UserPasswordReset event was NOT dispatched
    events.assertNotEmitted(UserPasswordReset)
  })

  test('should return error with expired token', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()
    const expiredToken = await userTokenService.generateNumeric(user, 6, { hours: -1 })

    const response = await client.post('/api/v1/auth/reset-password').json({
      token: expiredToken,
      password: 'newPassword123',
      passwordConfirmation: 'newPassword123',
    })

    response.assertStatus(500)

    // Assert that UserPasswordReset event was NOT dispatched
    events.assertNotEmitted(UserPasswordReset)
  })

  test('should return validation error with mismatched passwords', async ({ client }) => {
    const response = await client.post('/api/v1/auth/reset-password').json({
      token: '123456',
      password: 'password123',
      passwordConfirmation: 'differentPassword',
    })

    response.assertStatus(422)
  })

  test('should return validation error with short password', async ({ client }) => {
    const response = await client.post('/api/v1/auth/reset-password').json({
      token: '123456',
      password: '123',
      passwordConfirmation: '123',
    })

    response.assertStatus(422)
  })

  test('should return validation error with missing token', async ({ client }) => {
    const response = await client.post('/api/v1/auth/reset-password').json({
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertStatus(422)
  })
})
