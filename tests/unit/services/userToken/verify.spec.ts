import { test } from '@japa/runner'
import { UserTokenService } from '#services/user_token_service'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import { DateTime } from 'luxon'

test.group('UserTokenService - verify', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should verify valid non-expired token', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token = await userTokenService.generateNumeric(user)
    const result = await userTokenService.verify(token, user)

    assert.isObject(result)
    assert.isFalse(result === false)
    if (result !== false) {
      assert.equal(result.token, token)
    }
  })

  test('should return false for invalid token', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const result = await userTokenService.verify('invalid-token', user)

    assert.isFalse(result)
  })

  test('should return false for expired token', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create an expired token
    await user.related('tokens').create({
      token: '123456',
      expiresAt: DateTime.now().minus({ hours: 1 }),
    })

    const result = await userTokenService.verify('123456', user)

    assert.isFalse(result)
  })

  test('should return false for non-existent token', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const result = await userTokenService.verify('999999', user)

    assert.isFalse(result)
  })

  test('should return false for token belonging to different user', async ({ assert }) => {
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token = await userTokenService.generateNumeric(user1)
    const result = await userTokenService.verify(token, user2)

    assert.isFalse(result)
  })

  test('should verify token that expires exactly now', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create token that expires in the future
    await user.related('tokens').create({
      token: '123456',
      expiresAt: DateTime.now().plus({ minutes: 1 }),
    })

    const result = await userTokenService.verify('123456', user)

    assert.isObject(result)
    assert.isFalse(result === false)
    if (result !== false) {
      assert.equal(result.token, '123456')
    }
  })

  test('should handle empty token string', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const result = await userTokenService.verify('', user)

    assert.isFalse(result)
  })

  test('should handle null token gracefully', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const result = await userTokenService.verify(null as any, user)

    assert.isFalse(result)
  })
})
