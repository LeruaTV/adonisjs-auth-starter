import { test } from '@japa/runner'
import { UserTokenService } from '#services/user_token_service'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import UserToken from '#models/user_token'
import { DateTime } from 'luxon'

test.group('UserTokenService - deleteExpired', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should delete only expired tokens', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create expired tokens
    await user.related('tokens').create({
      token: 'expired1',
      expiresAt: DateTime.now().minus({ hours: 1 }),
    })

    await user.related('tokens').create({
      token: 'expired2',
      expiresAt: DateTime.now().minus({ days: 1 }),
    })

    // Create valid token
    const validToken = await userTokenService.generateNumeric(user)

    await userTokenService.deleteExpired()

    // Verify expired tokens are deleted
    const expiredToken1 = await UserToken.query().where('token', 'expired1').first()
    const expiredToken2 = await UserToken.query().where('token', 'expired2').first()
    assert.isNull(expiredToken1)
    assert.isNull(expiredToken2)

    // Verify valid token remains
    const remainingToken = await UserToken.query().where('token', validToken).first()
    assert.isNotNull(remainingToken)
  })

  test('should handle case with no expired tokens', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create only valid tokens
    const token1 = await userTokenService.generateNumeric(user)
    const token2 = await userTokenService.generateNumeric(user)

    await userTokenService.deleteExpired()

    // Verify all tokens remain
    const remainingToken1 = await UserToken.query().where('token', token1).first()
    const remainingToken2 = await UserToken.query().where('token', token2).first()

    assert.isNotNull(remainingToken1)
    assert.isNotNull(remainingToken2)
  })

  test('should handle case with no tokens at all', async ({ assert }) => {
    const userTokenService = new UserTokenService()

    // Should not throw error when no tokens exist
    await userTokenService.deleteExpired()

    // Test passes if no exception is thrown
    assert.isTrue(true)
  })

  test('should delete tokens that expire exactly now', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const now = DateTime.now()

    // Create token that expires exactly now
    await user.related('tokens').create({
      token: 'expires-now',
      expiresAt: now,
    })

    // Create token that expires in the past
    await user.related('tokens').create({
      token: 'expired',
      expiresAt: now.minus({ seconds: 1 }),
    })

    // Create token that expires in the future
    await user.related('tokens').create({
      token: 'future',
      expiresAt: now.plus({ seconds: 1 }),
    })

    await userTokenService.deleteExpired()

    const expiredNowToken = await UserToken.query().where('token', 'expires-now').first()
    const expiredToken = await UserToken.query().where('token', 'expired').first()
    const futureToken = await UserToken.query().where('token', 'future').first()

    assert.isNull(expiredNowToken)
    assert.isNull(expiredToken)
    assert.isNotNull(futureToken)
  })

  test('should delete expired tokens from multiple users', async ({ assert }) => {
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()
    const userTokenService = new UserTokenService()

    // Create expired tokens for both users
    await user1.related('tokens').create({
      token: 'user1-expired',
      expiresAt: DateTime.now().minus({ hours: 1 }),
    })

    await user2.related('tokens').create({
      token: 'user2-expired',
      expiresAt: DateTime.now().minus({ hours: 2 }),
    })

    // Create valid tokens for both users
    const user1ValidToken = await userTokenService.generateNumeric(user1)
    const user2ValidToken = await userTokenService.generateNumeric(user2)

    await userTokenService.deleteExpired()

    // Verify expired tokens are deleted
    const user1ExpiredToken = await UserToken.query().where('token', 'user1-expired').first()
    const user2ExpiredToken = await UserToken.query().where('token', 'user2-expired').first()
    assert.isNull(user1ExpiredToken)
    assert.isNull(user2ExpiredToken)

    // Verify valid tokens remain
    const user1ValidRemaining = await UserToken.query().where('token', user1ValidToken).first()
    const user2ValidRemaining = await UserToken.query().where('token', user2ValidToken).first()
    assert.isNotNull(user1ValidRemaining)
    assert.isNotNull(user2ValidRemaining)
  })
})
