import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import emitter from '@adonisjs/core/services/emitter'
import UserPasswordChanged from '#events/user_password_changed'
import UserDto from '../../../../app/dtos/user.js'

test.group('MeController - update', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should handle update request when authenticated', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    }

    const response = await client.put('/api/v1/me').loginAs(user).json(updateData)

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.firstName, 'Updated')
    assert.equal(responseBody.user.lastName, 'Name')
    assert.equal(responseBody.user.email, user.email)
    assert.notExists(responseBody.user.isAdmin)
  })

  test('should return unauthorized when not authenticated', async ({ client }) => {
    const response = await client.put('/api/v1/me').json({
      firstName: 'Updated',
      lastName: 'Name',
    })

    response.assertStatus(401)
  })

  test('should handle empty request body', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client.put('/api/v1/me').loginAs(user).json({})

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.firstName, user.firstName)
    assert.equal(responseBody.user.lastName, user.lastName)
    assert.equal(responseBody.user.email, user.email)
    assert.equal(responseBody.user.isVerified, user.isVerified)
    assert.notExists(responseBody.user.isAdmin)
  })

  test('should handle request with user data', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    }).create()

    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
    }

    const response = await client.put('/api/v1/me').loginAs(user).json(updateData)

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.firstName, 'Jane')
    assert.equal(responseBody.user.lastName, 'Smith')
    assert.equal(responseBody.user.email, user.email)
    assert.equal(responseBody.user.isVerified, user.isVerified)
    assert.notExists(responseBody.user.isAdmin)
  })

  test('should handle partial update data', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client.put('/api/v1/me').loginAs(user).json({
      firstName: 'UpdatedFirstName',
    })

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.firstName, 'UpdatedFirstName')
    assert.equal(responseBody.user.lastName, user.lastName)
    assert.equal(responseBody.user.email, user.email)
    assert.equal(responseBody.user.isVerified, user.isVerified)
    assert.notExists(responseBody.user.isAdmin)
  })

  test('should include isAdmin property when user is admin', async ({ client, assert }) => {
    const adminUser = await UserFactory.merge({ isAdmin: true }).create()

    const response = await client.put('/api/v1/me').loginAs(adminUser).json({
      firstName: 'AdminUser',
    })

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.firstName, 'AdminUser')
    assert.equal(responseBody.user.isAdmin, true)
  })

  test('should dispatch UserPasswordChanged event when password is updated', async ({
    client,
    cleanup,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()

    const updateData = {
      firstName: 'Updated',
      password: 'newPassword123',
      passwordConfirm: 'newPassword123',
    }

    const response = await client.put('/api/v1/me').loginAs(user).json(updateData)

    response.assertStatus(200)

    // Assert the event was emitted
    events.assertEmitted(UserPasswordChanged)
  })

  test('should not dispatch UserPasswordChanged event when password is not updated', async ({
    client,
    cleanup,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()

    const updateData = {
      firstName: 'Updated',
    }

    const response = await client.put('/api/v1/me').loginAs(user).json(updateData)

    response.assertStatus(200)

    // Assert the event was not emitted
    events.assertNotEmitted(UserPasswordChanged)
  })

  test('should not change password when passwordConfirm is missing', async ({
    client,
    cleanup,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()

    const updateData = {
      firstName: 'Updated',
      password: 'newPassword123',
    }

    const response = await client.put('/api/v1/me').loginAs(user).json(updateData)

    response.assertStatus(422)

    // Assert the event was not emitted since password wasn't changed
    events.assertNotEmitted(UserPasswordChanged)
  })

  test('should not change password when passwordConfirm does not match password', async ({
    client,
    cleanup,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()

    const updateData = {
      firstName: 'Updated',
      password: 'newPassword123',
      passwordConfirm: 'differentPassword',
    }

    const response = await client.put('/api/v1/me').loginAs(user).json(updateData)

    response.assertStatus(422)

    // Assert the event was not emitted since password wasn't changed
    events.assertNotEmitted(UserPasswordChanged)
  })

  test('should change password when passwordConfirm exists and matches password', async ({
    client,
    cleanup,
    assert,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const user = await UserFactory.create()
    const originalPassword = user.password

    const updateData = {
      firstName: 'Updated',
      password: 'newPassword123',
      passwordConfirm: 'newPassword123',
    }

    const response = await client.put('/api/v1/me').loginAs(user).json(updateData)

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.firstName, 'Updated')

    // Assert the event was emitted since password was changed
    events.assertEmitted(UserPasswordChanged)

    // Verify password was actually changed by refreshing user from database
    await user.refresh()
    assert.notEqual(user.password, originalPassword)
  })
})
