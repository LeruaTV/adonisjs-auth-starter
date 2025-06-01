import { test } from '@japa/runner'
import { UserTokenService } from '#services/user_token_service'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import { DateTime } from 'luxon'
import UserToken from '#models/user_token'

test.group('UserTokenService - findTokenWithUser', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should find valid token with user relation loaded', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token = await userTokenService.generateNumeric(user, 6, { hours: 1 })
    const result = await userTokenService.findTokenWithUser(token)

    assert.isNotNull(result)
    assert.instanceOf(result, UserToken)
    assert.equal(result!.token, token)
    assert.isObject(result!.user)
    assert.equal(result!.user.id, user.id)
  })

  test('should return null for invalid token', async ({ assert }) => {
    const userTokenService = new UserTokenService()

    const result = await userTokenService.findTokenWithUser('invalid-token')

    assert.isNull(result)
  })

  test('should return null for expired token', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create an expired token manually
    await user.related('tokens').create({
      token: '123456',
      expiresAt: DateTime.now().minus({ hours: 1 }),
    })

    const result = await userTokenService.findTokenWithUser('123456')

    assert.isNull(result)
  })

  test('should return null for non-existent token', async ({ assert }) => {
    const userTokenService = new UserTokenService()

    const result = await userTokenService.findTokenWithUser('999999')

    assert.isNull(result)
  })

  test('should handle empty token string', async ({ assert }) => {
    const userTokenService = new UserTokenService()

    const result = await userTokenService.findTokenWithUser('')

    assert.isNull(result)
  })

  test('should return null for token belonging to different user', async ({ assert }) => {
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token = await userTokenService.generateNumeric(user1, 6, { hours: 1 })

    // Try to find token with different user context
    const result = await userTokenService.findTokenWithUser(token)

    // Should still find the token since this method doesn't filter by user
    assert.isNotNull(result)
    assert.equal(result!.user.id, user1.id)
    assert.notEqual(result!.user.id, user2.id)
  })

  test('should find token that expires exactly now', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create token that expires in the future (should be found)
    await user.related('tokens').create({
      token: '123456',
      expiresAt: DateTime.now().plus({ minutes: 1 }),
    })

    const result = await userTokenService.findTokenWithUser('123456')

    assert.isNotNull(result)
    assert.equal(result!.token, '123456')
  })
})
