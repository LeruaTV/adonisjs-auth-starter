import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'

test.group('AuthController - logout', (group) => {
  group.each.setup(async () => {
    await truncateTablesExceptAdonis()
  })

  test('should logout successfully when authenticated', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/api/v1/auth/logout').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Logged out successfully',
    })
  })

  test('should return unauthorized when not authenticated', async ({ client }) => {
    const response = await client.post('/api/v1/auth/logout')

    response.assertStatus(401)
  })

  test('should invalidate token after logout', async ({ client }) => {
    const user = await UserFactory.merge({
      email: 'test@example.com',
      password: 'password',
    }).create()

    // First login to get a token
    const loginResponse = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
    })

    loginResponse.assertStatus(200)

    const { token } = loginResponse.body()

    // Logout using the token
    const logoutResponse = await client.post('/api/v1/auth/logout').bearerToken(token)
    logoutResponse.assertStatus(200)

    // Try to access protected route with the same token after logout
    const protectedResponse = await client.get('/api/v1/me').bearerToken(token)

    // Should fail because token is invalidated
    protectedResponse.assertStatus(401)
  })

  test('should handle logout with already invalidated token', async ({ client }) => {
    const user = await UserFactory.merge({
      email: 'test@example.com',
      password: 'password',
    }).create()

    // Login to get a token
    const loginResponse = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
    })
    const { token } = loginResponse.body()

    // First logout (should work)
    const firstLogout = await client.post('/api/v1/auth/logout').bearerToken(token)

    firstLogout.assertStatus(200)

    // Second logout with same token (should fail)
    const secondLogout = await client.post('/api/v1/auth/logout').bearerToken(token)

    secondLogout.assertStatus(401)
  })

  test('should return correct response format', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client.post('/api/v1/auth/logout').loginAs(user)

    response.assertStatus(200)

    const body = response.body()
    assert.isObject(body)
    assert.property(body, 'message')
    assert.equal(body.message, 'Logged out successfully')
  })
})
