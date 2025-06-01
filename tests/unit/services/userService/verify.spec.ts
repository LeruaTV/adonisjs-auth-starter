import { test } from '@japa/runner'
import UserService from '#services/user_service'
import User from '#models/user'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import { UserFactory } from '#database/factories/user_factory'
import { UserTokenService } from '#services/user_token_service'
import emitter from '@adonisjs/core/services/emitter'
import UserVerified from '#events/user_verified'
import { DateTime } from 'luxon'
import UserToken from '#models/user_token'

test.group('UserService.verify', (group) => {
  group.each.setup(async () => {
    // Truncate tables to ensure a clean state
    await truncateTablesExceptAdonis()
  })

  test('verifies user with valid token successfully and fires event', async ({
    assert,
    cleanup,
  }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    // Generate a verification token
    const token = await userTokenService.generateNumeric(user, 6, { hours: 24 })

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const verifiedUser = await userService.verify(user.id, token)

    // Assert
    assert.instanceOf(verifiedUser, User)
    assert.isTrue(verifiedUser.isVerified)
    assert.isNotNull(verifiedUser.verifiedAt)
    assert.equal(verifiedUser.id, user.id)
    assert.equal(verifiedUser.email, user.email)

    // Assert the event was emitted
    events.assertEmitted(UserVerified)
  })

  test('deletes token after successful verification', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    // Generate a verification token
    const token = await userTokenService.generateNumeric(user, 6, { hours: 24 })

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    await userService.verify(user.id, token)

    // Assert - Check if the token is deleted
    const tokenExists = await UserToken.query()
      .where('userId', user.id)
      .where('token', token)
      .first()
    assert.isNull(tokenExists, 'Token should be deleted after verification')

    // Assert - Try to verify again with same token (should fail)
    await assert.rejects(
      async () => await userService.verify(user.id, token),
      'User is already verified'
    )

    // Assert the event was emitted
    events.assertEmitted(UserVerified)
  })

  test('throws error when user not found', async ({ assert }) => {
    // Arrange
    const userService = new UserService()
    const nonExistentUserId = 99999
    const fakeToken = '123456'

    // Act & Assert
    await assert.rejects(
      async () => await userService.verify(nonExistentUserId, fakeToken),
      'Row not found'
    )
  })

  test('throws error when user is already verified', async ({ assert }) => {
    // Arrange
    const user = await UserFactory.apply('verified').create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()
    const token = await userTokenService.generateNumeric(user, 6, { hours: 24 })

    // Act & Assert
    await assert.rejects(
      async () => await userService.verify(user.id, token),
      'User is already verified'
    )
  })

  test('throws error with invalid token', async ({ assert }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const invalidToken = 'invalid123'

    // Act & Assert
    // Act & Assert
    await assert.rejects(
      async () => await userService.verify(user.id, invalidToken),
      'Invalid or expired verification token'
    )
  })

  test('throws error with expired token', async ({ assert }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    // Generate a token that expires in the past
    const token = await userTokenService.generateNumeric(user, 6, { hours: -1 })

    // Act & Assert
    await assert.rejects(
      async () => await userService.verify(user.id, token),
      'Invalid or expired verification token'
    )
  })

  test('sets verifiedAt timestamp correctly and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()
    const token = await userTokenService.generateNumeric(user, 6, { hours: 24 })
    const beforeVerification = DateTime.now()

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const verifiedUser = await userService.verify(user.id, token)

    // Assert
    const afterVerification = DateTime.now()
    assert.isNotNull(verifiedUser.verifiedAt)
    assert.isTrue(verifiedUser.verifiedAt! >= beforeVerification)
    assert.isTrue(verifiedUser.verifiedAt! <= afterVerification)

    // Assert the event was emitted
    events.assertEmitted(UserVerified)
  })

  test('persists verification status to database and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()
    const token = await userTokenService.generateNumeric(user, 6, { hours: 24 })

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    await userService.verify(user.id, token)

    // Assert - Fetch user from database to verify persistence
    const freshUser = await User.findOrFail(user.id)
    assert.isTrue(freshUser.isVerified)
    assert.isNotNull(freshUser.verifiedAt)

    // Assert the event was emitted
    events.assertEmitted(UserVerified)
  })

  test('works with different token lengths and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    // Generate a 4-digit token instead of default 6
    const token = await userTokenService.generateNumeric(user, 4, { hours: 24 })

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const verifiedUser = await userService.verify(user.id, token)

    // Assert
    assert.instanceOf(verifiedUser, User)
    assert.isTrue(verifiedUser.isVerified)
    assert.equal(verifiedUser.id, user.id)

    // Assert the event was emitted
    events.assertEmitted(UserVerified)
  })

  test('works with custom token duration and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const userTokenService = new UserTokenService()

    // Generate a token with custom duration (1 minute)
    const token = await userTokenService.generateNumeric(user, 6, { minutes: 1 })

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const verifiedUser = await userService.verify(user.id, token)

    // Assert
    assert.instanceOf(verifiedUser, User)
    assert.isTrue(verifiedUser.isVerified)
    assert.equal(verifiedUser.id, user.id)

    // Assert the event was emitted
    events.assertEmitted(UserVerified)
  })
})
