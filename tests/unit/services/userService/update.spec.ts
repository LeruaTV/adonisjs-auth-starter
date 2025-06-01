import { test } from '@japa/runner'
import UserService from '#services/user_service'
import User from '#models/user'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import { UserFactory } from '#database/factories/user_factory'
import emitter from '@adonisjs/core/services/emitter'
import UserUpdated from '#events/user_updated'

test.group('UserService.update', (group) => {
  group.each.setup(async () => {
    // Truncate tables to ensure a clean state
    await truncateTablesExceptAdonis()
  })

  test('updates user firstName successfully and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const updateData = { firstName: 'UpdatedName' }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const updatedUser = await userService.update(user.id, updateData)

    // Assert
    assert.instanceOf(updatedUser, User)
    assert.equal(updatedUser.firstName, 'UpdatedName')
    assert.equal(updatedUser.id, user.id)
    assert.equal(updatedUser.email, user.email)

    // Assert the event was emitted
    events.assertEmitted(UserUpdated)
  })

  test('updates user lastName successfully and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const updateData = { lastName: 'UpdatedLastName' }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const updatedUser = await userService.update(user.id, updateData)

    // Assert
    assert.instanceOf(updatedUser, User)
    assert.equal(updatedUser.lastName, 'UpdatedLastName')
    assert.equal(updatedUser.id, user.id)
    assert.equal(updatedUser.email, user.email)

    // Assert the event was emitted
    events.assertEmitted(UserUpdated)
  })

  test('updates user password successfully and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const updateData = { password: 'newPassword123' }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const updatedUser = await userService.update(user.id, updateData)

    // Assert
    assert.instanceOf(updatedUser, User)
    assert.equal(updatedUser.id, user.id)
    assert.equal(updatedUser.email, user.email)

    // Assert the event was emitted
    events.assertEmitted(UserUpdated)
  })

  test('updates multiple fields at once and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const updateData = {
      firstName: 'NewFirstName',
      lastName: 'NewLastName',
      password: 'newPassword456',
    }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const updatedUser = await userService.update(user.id, updateData)

    // Assert
    assert.instanceOf(updatedUser, User)
    assert.equal(updatedUser.firstName, 'NewFirstName')
    assert.equal(updatedUser.lastName, 'NewLastName')
    assert.equal(updatedUser.id, user.id)
    assert.equal(updatedUser.email, user.email)

    // Assert the event was emitted
    events.assertEmitted(UserUpdated)
  })

  test('does not update email field and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const originalEmail = user.email
    const updateData = {
      firstName: 'NewFirstName',
      email: 'newemail@example.com', // This should be ignored
    }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const updatedUser = await userService.update(user.id, updateData)

    // Assert
    assert.instanceOf(updatedUser, User)
    assert.equal(updatedUser.firstName, 'NewFirstName')
    assert.equal(updatedUser.email, originalEmail) // Email should remain unchanged
    assert.notEqual(updatedUser.email, 'newemail@example.com')

    // Assert the event was emitted
    events.assertEmitted(UserUpdated)
  })

  test('handles undefined values correctly and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.merge({ firstName: 'OriginalName' }).create()
    const userService = new UserService()
    const updateData = { firstName: undefined }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const updatedUser = await userService.update(user.id, updateData)

    // Assert
    assert.instanceOf(updatedUser, User)
    assert.equal(updatedUser.firstName, user.firstName) // Should be set to null when undefined
    assert.equal(updatedUser.id, user.id)

    // Assert the event was emitted
    events.assertEmitted(UserUpdated)
  })

  test('handles empty update data and still fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const originalFirstName = user.firstName
    const originalLastName = user.lastName
    const updateData = {}

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const updatedUser = await userService.update(user.id, updateData)

    // Assert
    assert.instanceOf(updatedUser, User)
    assert.equal(updatedUser.firstName, originalFirstName)
    assert.equal(updatedUser.lastName, originalLastName)
    assert.equal(updatedUser.id, user.id)

    // Assert the event was emitted
    events.assertEmitted(UserUpdated)
  })

  test('throws error when user not found', async ({ assert }) => {
    // Arrange
    const userService = new UserService()
    const nonExistentUserId = 99999
    const updateData = { firstName: 'NewName' }

    // Act & Assert
    await assert.rejects(
      async () => await userService.update(nonExistentUserId, updateData),
      'Row not found'
    )
  })

  test('persists changes to database and fires event', async ({ assert, cleanup }) => {
    // Arrange
    const user = await UserFactory.create()
    const userService = new UserService()
    const updateData = { firstName: 'PersistentName' }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    await userService.update(user.id, updateData)

    // Assert - Fetch user from database to verify persistence
    const freshUser = await User.findOrFail(user.id)
    assert.equal(freshUser.firstName, 'PersistentName')

    // Assert the event was emitted
    events.assertEmitted(UserUpdated)
  })
})
