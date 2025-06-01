import { test } from '@japa/runner'
import { UserTokenService } from '#services/user_token_service'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import { DateTime } from 'luxon'

test.group('UserTokenService - generateNumeric', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should generate numeric token with default length and duration', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token = await userTokenService.generateNumeric(user)

    assert.isString(token)
    assert.lengthOf(token, 6)
    assert.match(token, /^\d+$/)

    const savedToken = await user.related('tokens').query().where('token', token).first()
    assert.isNotNull(savedToken)
    assert.equal(savedToken!.token, token)
    assert.isTrue(savedToken!.expiresAt > DateTime.now())
  })

  test('should generate numeric token with custom length', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()
    const customLength = 8

    const token = await userTokenService.generateNumeric(user, customLength)

    assert.isString(token)
    assert.lengthOf(token, customLength)
    assert.match(token, /^\d+$/)
  })

  test('should generate numeric token with custom duration', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()
    const customDuration = { hours: 2 }

    const token = await userTokenService.generateNumeric(user, 6, customDuration)

    const savedToken = await user.related('tokens').query().where('token', token).first()
    const expectedExpiry = DateTime.now().plus(customDuration)

    assert.isNotNull(savedToken)
    assert.isTrue(Math.abs(savedToken!.expiresAt.diff(expectedExpiry, 'minutes').minutes) < 1)
  })

  test('should generate numeric token with minimum length', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()
    const minLength = 1

    const token = await userTokenService.generateNumeric(user, minLength)

    assert.lengthOf(token, minLength)
    assert.match(token, /^\d+$/)
  })

  test('should generate numeric token with maximum reasonable length', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()
    const maxLength = 20

    const token = await userTokenService.generateNumeric(user, maxLength)

    assert.lengthOf(token, maxLength)
    assert.match(token, /^\d+$/)
  })

  test('should generate unique tokens for multiple calls', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token1 = await userTokenService.generateNumeric(user)
    const token2 = await userTokenService.generateNumeric(user)
    const token3 = await userTokenService.generateNumeric(user)

    assert.notEqual(token1, token2)
    assert.notEqual(token1, token3)
    assert.notEqual(token2, token3)
  })

  test('should handle different duration formats', async ({ assert }) => {
    const user = await UserFactory.create()
    const userTokenService = new UserTokenService()

    const token1 = await userTokenService.generateNumeric(user, 6, { minutes: 30 })
    const token2 = await userTokenService.generateNumeric(user, 6, { days: 7 })
    const token3 = await userTokenService.generateNumeric(user, 6, { seconds: 3600 })

    const savedToken1 = await user.related('tokens').query().where('token', token1).first()
    const savedToken2 = await user.related('tokens').query().where('token', token2).first()
    const savedToken3 = await user.related('tokens').query().where('token', token3).first()

    assert.isNotNull(savedToken1)
    assert.isNotNull(savedToken2)
    assert.isNotNull(savedToken3)
    assert.isTrue(savedToken2!.expiresAt > savedToken1!.expiresAt)
  })
})
