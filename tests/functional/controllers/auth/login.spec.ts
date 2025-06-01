import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import emitter from '@adonisjs/core/services/emitter'
import UserLoggedIn from '#events/user_logged_in'

test.group('AuthController - login', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should login successfully with valid credentials', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const password = 'password123'

    const user = await UserFactory.merge({
      email: 'test@example.com',
      password: password,
    }).create()

    const response = await client.post('/api/v1/auth/login').json({
      email: 'test@example.com',
      password: password,
    })

    response.assertStatus(200)

    // Check DTO structure matches UserDto
    const body = response.body()
    response.assertBodyContains({
      token: body.token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        lastLoginAt: body.user.lastLoginAt,
        isVerified: user.isVerified,
      },
    })

    // Verify token is present and is a string
    response.assert?.isString(body.token)

    // Verify UserLoggedIn event was dispatched
    events.assertEmitted(UserLoggedIn)
  })

  test('should return error with invalid email', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'password123',
    })

    response.assertStatus(400)

    // Verify UserLoggedIn event was not dispatched
    events.assertNotEmitted(UserLoggedIn)
  })

  test('should return error with invalid password', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const password = 'password123'

    await UserFactory.merge({
      email: 'test@example.com',
      password: password,
    }).create()

    const response = await client.post('/api/v1/auth/login').json({
      email: 'test@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(400)

    // Verify UserLoggedIn event was not dispatched
    events.assertNotEmitted(UserLoggedIn)
  })

  test('should return validation error with missing email', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      password: 'password123',
    })

    response.assertStatus(422)
  })

  test('should return validation error with missing password', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'test@example.com',
    })

    response.assertStatus(422)
  })

  test('should return validation error with invalid email format', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'invalid-email',
      password: 'password123',
    })

    response.assertStatus(422)
  })

  test('should create access token and return user dto', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const password = 'password123'

    const user = await UserFactory.merge({
      email: 'test@example.com',
      password: password,
      firstName: 'John',
      lastName: 'Doe',
    }).create()

    const response = await client.post('/api/v1/auth/login').json({
      email: 'test@example.com',
      password: password,
    })

    response.assertStatus(200)

    const body = response.body()

    // Verify proper UserDto structure
    response.assertBodyContains({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
      },
    })

    // Verify token is present and is a string
    response.assertBodyContains({ token: body.token })
    response.assert?.isString(body.token)

    // Verify UserLoggedIn event was dispatched
    events.assertEmitted(UserLoggedIn)
  })

  test('should dispatch UserLoggedIn event with correct user data', async ({
    client,
    cleanup,
    assert,
  }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const password = 'password123'

    const user = await UserFactory.merge({
      email: 'test@example.com',
      password: password,
      firstName: 'John',
      lastName: 'Doe',
    }).create()

    await client.post('/api/v1/auth/login').json({
      email: 'test@example.com',
      password: password,
    })

    // Verify UserLoggedIn event was dispatched with correct user
    events.assertEmitted(UserLoggedIn)

    const emittedEvent = events.find(UserLoggedIn, (event) => event.data.user.id === user.id)
    assert.equal(emittedEvent?.data.user.id, user.id)
    assert.equal(emittedEvent?.data.user.email, user.email)
  })
})
