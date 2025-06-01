import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'

test.group('MeController - get', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should return authenticated user data', async ({ client }) => {
    const user = await UserFactory.merge({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    }).create()

    const response = await client.get('/api/v1/me').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  })

  test('should return error when user is not authenticated', async ({ client }) => {
    const response = await client.get('/api/v1/me')

    response.assertStatus(401)
  })

  test('should return user dto with correct structure', async ({ client }) => {
    const user = await UserFactory.merge({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    }).create()

    const response = await client.get('/api/v1/me').loginAs(user)

    response.assertStatus(200)

    const body = response.body()
    response.assert?.isObject(body.user)
    response.assert?.isString(body.user.email)
    response.assert?.isString(body.user.firstName)
    response.assert?.isString(body.user.lastName)
  })

  test('should return consistent data for same user', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      email: 'consistent@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
    }).create()

    // First request
    const firstResponse = await client.get('/api/v1/me').loginAs(user)
    firstResponse.assertStatus(200)

    // Second request with same user
    const secondResponse = await client.get('/api/v1/me').loginAs(user)
    secondResponse.assertStatus(200)

    // Both responses should return the same user data
    const firstBody = firstResponse.body()
    const secondBody = secondResponse.body()

    assert.equal(firstBody.user.email, secondBody.user.email)
    assert.equal(firstBody.user.firstName, secondBody.user.firstName)
    assert.equal(firstBody.user.lastName, secondBody.user.lastName)
  })

  test('should handle user with minimal data', async ({ client }) => {
    const user = await UserFactory.merge({
      email: 'minimal@example.com',
    }).create()

    const response = await client.get('/api/v1/me').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        email: user.email,
      },
    })
  })

  test('should return user data with all available fields', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      email: 'full@example.com',
      firstName: 'Alice',
      lastName: 'Johnson',
    }).create()

    const response = await client.get('/api/v1/me').loginAs(user)

    response.assertStatus(200)

    const body = response.body()
    assert.property(body.user, 'email')
    assert.property(body.user, 'firstName')
    assert.property(body.user, 'lastName')
  })
})
