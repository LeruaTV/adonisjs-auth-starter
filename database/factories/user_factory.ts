import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { DateTime } from 'luxon'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      verifiedAt: null,
      lastLoginAt: null,
      isAdmin: false,
    }
  })
  .state('admin', (user) => {
    user.isAdmin = true
  })
  .state('verified', (user) => {
    user.verifiedAt = DateTime.now()
  })
  .build()
