import { test } from '@japa/runner'
import UserService from '#services/user_service'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import emitter from '@adonisjs/core/services/emitter'
import UserPasswordResetRequested from '#events/user_password_reset_requested'

test.group('UserService - requestPasswordReset', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should request password reset for existing user and dispatch event', async ({
    cleanup,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.merge({
      email: 'test@example.com',
    }).create()

    const userService = new UserService()
    await userService.requestPasswordReset('test@example.com')

    // Assert that UserPasswordResetRequested event was dispatched
    events.assertEmitted(UserPasswordResetRequested)
  })

  test('should not dispatch event for non-existing user', async ({ cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userService = new UserService()
    await userService.requestPasswordReset('nonexistent@example.com')

    // Assert that UserPasswordResetRequested event was NOT dispatched
    events.assertNotEmitted(UserPasswordResetRequested)
  })

  test('should handle empty email gracefully', async ({ cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userService = new UserService()
    await userService.requestPasswordReset('')

    // Assert that UserPasswordResetRequested event was NOT dispatched
    events.assertNotEmitted(UserPasswordResetRequested)
  })
})
