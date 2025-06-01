import { test } from '@japa/runner'
import UserService from '#services/user_service'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import { UserTokenService } from '#services/user_token_service'
import emitter from '@adonisjs/core/services/emitter'
import UserPasswordReset from '#events/user_password_reset'
import User from '#models/user'

test.group('UserService - resetPassword', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should reset password with valid token and dispatch event', async ({ assert, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    const resetToken = await userTokenService.generateNumeric(user, 6, { hours: 1 })
    const newPassword = 'newPassword123'

    const updatedUser = await userService.resetPassword(resetToken, newPassword)

    // Assert user is returned
    assert.instanceOf(updatedUser, User)
    assert.equal(updatedUser.id, user.id)

    // Verify password was updated by attempting login
    const verifiedUser = await User.verifyCredentials(user.email, newPassword)
    assert.equal(verifiedUser.id, user.id)

    // Assert that UserPasswordReset event was dispatched
    events.assertEmitted(UserPasswordReset)
  })

  test('should throw error with invalid token', async ({ assert, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userService = new UserService()

    await assert.rejects(
      async () => await userService.resetPassword('invalid-token', 'newPassword123'),
      'Invalid or expired reset token'
    )

    // Assert that UserPasswordReset event was NOT dispatched
    events.assertNotEmitted(UserPasswordReset)
  })

  test('should throw error with expired token', async ({ assert, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    const expiredToken = await userTokenService.generateNumeric(user, 6, { hours: -1 })

    await assert.rejects(
      async () => await userService.resetPassword(expiredToken, 'newPassword123'),
      'Invalid or expired reset token'
    )

    // Assert that UserPasswordReset event was NOT dispatched
    events.assertNotEmitted(UserPasswordReset)
  })

  test('should delete token after successful password reset', async ({ assert, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    const resetToken = await userTokenService.generateNumeric(user, 6, { hours: 1 })

    await userService.resetPassword(resetToken, 'newPassword123')

    // Verify token is deleted
    const tokenExists = await userTokenService.verify(resetToken, user)
    assert.isFalse(tokenExists)

    // Assert that UserPasswordReset event was dispatched
    events.assertEmitted(UserPasswordReset)
  })

  test('should handle empty password gracefully', async ({ assert, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    const resetToken = await userTokenService.generateNumeric(user, 6, { hours: 1 })

    // Should not throw error but password might not be valid
    const updatedUser = await userService.resetPassword(resetToken, '')
    assert.instanceOf(updatedUser, User)

    // Assert that UserPasswordReset event was dispatched
    events.assertEmitted(UserPasswordReset)
  })
})
