import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import emitter from '@adonisjs/core/services/emitter'
import UserLoggedIn from '#events/user_logged_in'

test.group('AuthController - register', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should register successfully with valid data', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
    }

    const response = await client.post('/api/v1/auth/register').json(userData)

    response.assertStatus(200)

    const body = response.body()

    console.log('Response Body:', body)

    // Validate UserDto structure matches exactly what UserDto returns
    response.assert?.isString(body.token)
    response.assert?.isObject(body.user)
    response.assert?.equal(body.user.email, userData.email)
    response.assert?.equal(body.user.firstName, userData.firstName)
    response.assert?.equal(body.user.fullName, 'John')
    response.assert?.isFalse(body.user.isVerified)
    response.assert?.isUndefined(body.user.lastLoginAt)

    // Ensure no admin property is present for regular users
    response.assert?.isTrue(body.user.isAdmin)

    // Assert that UserLoggedIn event was dispatched
    events.assertEmitted(UserLoggedIn)
  })

  test('should return validation error with missing email', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userData = {
      password: 'password123',
      passwordConfirmation: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const response = await client.post('/api/v1/auth/register').json(userData)

    response.assertStatus(422)

    // Assert that UserLoggedIn event was NOT dispatched on validation failure
    events.assertNotEmitted(UserLoggedIn)
  })

  test('should return validation error with missing password', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userData = {
      email: 'test@example.com',
      passwordConfirmation: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const response = await client.post('/api/v1/auth/register').json(userData)

    response.assertStatus(422)

    // Assert that UserLoggedIn event was NOT dispatched on validation failure
    events.assertNotEmitted(UserLoggedIn)
  })

  test('should return validation error with password mismatch', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userData = {
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'differentpassword',
      firstName: 'John',
      lastName: 'Doe',
    }

    const response = await client.post('/api/v1/auth/register').json(userData)

    response.assertStatus(422)

    // Assert that UserLoggedIn event was NOT dispatched on validation failure
    events.assertNotEmitted(UserLoggedIn)
  })

  test('should return validation error with invalid email format', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userData = {
      email: 'invalid-email',
      password: 'password123',
      passwordConfirmation: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const response = await client.post('/api/v1/auth/register').json(userData)

    response.assertStatus(422)

    // Assert that UserLoggedIn event was NOT dispatched on validation failure
    events.assertNotEmitted(UserLoggedIn)
  })

  test('should return error when email already exists', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await UserFactory.merge({
      email: 'test@example.com',
    }).create()

    const userData = {
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const response = await client.post('/api/v1/auth/register').json(userData)

    response.assertStatus(422)

    // Assert that UserLoggedIn event was NOT dispatched on validation failure
    events.assertNotEmitted(UserLoggedIn)
  })

  test('should create user and return token with user dto', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userData = {
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const response = await client.post('/api/v1/auth/register').json(userData)

    response.assertStatus(200)

    const body = response.body()

    // Validate token is present and is a string
    response.assert?.isString(body.token)
    response.assert?.isObject(body.user)

    // Validate UserDto structure matches exactly what UserDto returns
    response.assert?.equal(body.user.email, userData.email)
    response.assert?.equal(body.user.firstName, userData.firstName)
    response.assert?.equal(body.user.lastName, userData.lastName)
    response.assert?.equal(body.user.fullName, 'John Doe')
    response.assert?.isFalse(body.user.isVerified)
    response.assert?.isNull(body.user.lastLoginAt)

    // Ensure no admin property is present for regular users
    response.assert?.isUndefined(body.user.isAdmin)

    // Assert that UserLoggedIn event was dispatched
    events.assertEmitted(UserLoggedIn)
  })

  test('should return validation error with short password', async ({ client, cleanup }) => {
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    const userData = {
      email: 'test@example.com',
      password: '123',
      passwordConfirmation: '123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const response = await client.post('/api/v1/auth/register').json(userData)

    response.assertStatus(422)

    // Assert that UserLoggedIn event was NOT dispatched on validation failure
    events.assertNotEmitted(UserLoggedIn)
  })
})
