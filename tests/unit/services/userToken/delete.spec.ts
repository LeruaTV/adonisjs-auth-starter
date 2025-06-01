import { test } from '@japa/runner'
import { UserTokenService } from '#services/user_token_service'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import UserToken from '#models/user_token'
import { DateTime } from 'luxon'

test.group('UserTokenService - delete', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should delete existing token', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token = await userTokenService.generateNumeric(user)

    // Verify token exists
    const existingToken = await UserToken.query().where('token', token).first()
    assert.isNotNull(existingToken)

    await userTokenService.delete(token)

    // Verify token is deleted
    const deletedToken = await UserToken.query().where('token', token).first()
    assert.isNull(deletedToken)
  })

  test('should handle deletion of non-existent token gracefully', async ({ assert }) => {
    const userTokenService = new UserTokenService()

    // Should not throw error when deleting non-existent token
    await userTokenService.delete('non-existent-token')

    // Test passes if no exception is thrown
    assert.isTrue(true)
  })

  test('should handle deletion of empty token string', async ({ assert }) => {
    const userTokenService = new UserTokenService()

    await userTokenService.delete('')

    // Test passes if no exception is thrown
    assert.isTrue(true)
  })

  test('should handle deletion of null token', async ({ assert }) => {
    const userTokenService = new UserTokenService()

    await userTokenService.delete(null as any)

    // Test passes if no exception is thrown
    assert.isTrue(true)
  })

  test('should delete only specified token', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token1 = await userTokenService.generateNumeric(user)
    const token2 = await userTokenService.generateNumeric(user)

    await userTokenService.delete(token1)

    // Verify only token1 is deleted
    const deletedToken = await UserToken.query().where('token', token1).first()
    const remainingToken = await UserToken.query().where('token', token2).first()

    assert.isNull(deletedToken)
    assert.isNotNull(remainingToken)
  })

  test('should delete expired token', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create an expired token
    const expiredToken = await user.related('tokens').create({
      token: '123456',
      expiresAt: DateTime.now().minus({ hours: 1 }),
    })

    await userTokenService.delete(expiredToken.token)

    const deletedToken = await UserToken.query().where('token', expiredToken.token).first()
    assert.isNull(deletedToken)
  })
})
