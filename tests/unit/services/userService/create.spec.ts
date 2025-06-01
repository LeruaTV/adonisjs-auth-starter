import { test } from '@japa/runner'
import UserService from '#services/user_service'
import User from '#models/user'
import { truncateTablesExceptAdonis } from '#tests/utils/truncate_tables_except_adonis'
import emitter from '@adonisjs/core/services/emitter'
import UserRegistered from '#events/user_registered'
import { UserFactory } from '#database/factories/user_factory'

test.group('UserService.create', (group) => {
  group.each.setup(async () => {
    // Truncate tables to ensure a clean state
    await truncateTablesExceptAdonis()
  })

  test('creates a user with provided data', async ({ assert, cleanup }) => {
    // Arrange

    await UserFactory.createMany(5)

    const userService = new UserService()
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'John')
    assert.equal(user.lastName, 'Doe')
    assert.equal(user.email, 'john.doe@example.com')
    assert.isTrue(user.$isPersisted)
    assert.exists(user.id)
    assert.exists(user.createdAt)
    assert.isFalse(user.isAdmin)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('creates an admin user with provided data', async ({ assert, cleanup }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    }

    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'John')
    assert.equal(user.lastName, 'Doe')
    assert.equal(user.email, 'john.doe@example.com')
    assert.isTrue(user.$isPersisted)
    assert.exists(user.id)
    assert.exists(user.createdAt)
    assert.isTrue(user.isAdmin)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('creates a user without firstName and derives it from email', async ({
    assert,
    cleanup,
  }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'jane.smith')
    assert.equal(user.lastName, 'Smith')
    assert.equal(user.email, 'jane.smith@example.com')
    assert.isTrue(user.$isPersisted)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('creates a user without firstName and lastName', async ({ assert, cleanup }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'test')
    assert.isUndefined(user.lastName)
    assert.equal(user.email, 'test@example.com')
    assert.isTrue(user.$isPersisted)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('creates a user with existing firstName and does not override it', async ({
    assert,
    cleanup,
  }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      firstName: 'ExistingName',
      email: 'user@example.com',
      password: 'password123',
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'ExistingName')
    assert.equal(user.email, 'user@example.com')
    assert.isTrue(user.$isPersisted)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('creates a user with partial data and sets defaults correctly', async ({
    assert,
    cleanup,
  }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      email: 'minimal@example.com',
      password: 'password123',
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'minimal')
    assert.isUndefined(user.lastName)
    assert.equal(user.email, 'minimal@example.com')
    assert.isUndefined(user.verifiedAt)
    assert.isTrue(user.$isPersisted)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('creates a user with admin privileges', async ({ assert, cleanup }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'Admin')
    assert.equal(user.lastName, 'User')
    assert.equal(user.email, 'admin@example.com')
    assert.isTrue(user.isAdmin)
    assert.isTrue(user.$isPersisted)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('handles email with multiple dots correctly', async ({ assert, cleanup }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      email: 'user.name.test@example.com',
      password: 'password123',
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'user.name.test')
    assert.equal(user.email, 'user.name.test@example.com')
    assert.isTrue(user.$isPersisted)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('handles complex email formats correctly', async ({ assert, cleanup }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      email: 'user+tag@subdomain.example.com',
      password: 'password123',
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert
    assert.instanceOf(user, User)
    assert.equal(user.firstName, 'user+tag')
    assert.equal(user.email, 'user+tag@subdomain.example.com')
    assert.isTrue(user.$isPersisted)

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('creates a user and persists it to database', async ({ assert, cleanup }) => {
    // Arrange
    const userService = new UserService()
    const userData = {
      firstName: 'Database',
      lastName: 'Test',
      email: 'db.test@example.com',
      password: 'password123',
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act
    const user = await userService.create(userData)

    // Assert - Verify user exists in database
    const foundUser = await User.find(user.id)
    assert.isNotNull(foundUser)
    assert.equal(foundUser!.firstName, 'Database')
    assert.equal(foundUser!.lastName, 'Test')
    assert.equal(foundUser!.email, 'db.test@example.com')

    // Assert the event was emitted
    events.assertEmitted(UserRegistered)
  })

  test('throws error when creating user with invalid data', async ({ assert, cleanup }) => {
    // Arrange
    const userService = new UserService()
    const invalidUserData = {
      // Missing required email
      firstName: 'Invalid',
      password: 'password123',
    }
    const events = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    // Act & Assert
    await assert.rejects(
      async () => await userService.create(invalidUserData as any),
      'Email is required to create a user'
    )

    // Assert the event was emitted
    events.assertNotEmitted(UserRegistered)
  })
})
