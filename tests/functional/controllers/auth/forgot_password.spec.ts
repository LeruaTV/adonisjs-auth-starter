import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import emitter from '@adonisjs/core/services/emitter'
import UserPasswordResetRequested from '#events/user_password_reset_requested'

test.group('Auth Controller - forgotPassword', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should request password reset for existing user and dispatch event', async ({
    client,
    cleanup,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.merge({
      email: 'test@example.com',
    }).create()

    const response = await client.post('/api/v1/auth/forgot-password').json({
      email: 'test@example.com',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'If the email exists in our system, you will receive a password reset link',
    })

    // Assert that UserPasswordResetRequested event was dispatched
    events.assertEmitted(UserPasswordResetRequested)
  })

  test('should return same message for non-existing user without dispatching event', async ({
    client,
    cleanup,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const response = await client.post('/api/v1/auth/forgot-password').json({
      email: 'nonexistent@example.com',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'If the email exists in our system, you will receive a password reset link',
    })

    // Assert that UserPasswordResetRequested event was NOT dispatched
    events.assertNotEmitted(UserPasswordResetRequested)
  })

  test('should return validation error with invalid email format', async ({ client }) => {
    const response = await client.post('/api/v1/auth/forgot-password').json({
      email: 'invalid-email',
    })

    response.assertStatus(422)
  })

  test('should return validation error with missing email', async ({ client }) => {
    const response = await client.post('/api/v1/auth/forgot-password').json({})

    response.assertStatus(422)
  })
})
