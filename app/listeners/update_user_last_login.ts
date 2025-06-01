import UserLoggedIn from '#events/user_logged_in'
import UserService from '#services/user_service'
import { inject } from '@adonisjs/core'

export default class UpdateUserLastLogin {
  @inject()
  async handle(event: UserLoggedIn, userService: UserService) {
    const { user } = event

    // Save the updated user record
    await userService.updateLastLogin(user.id)

    // Optionally, you can log or perform additional actions here
    console.log(`User ${user.id} last login updated to ${user.lastLoginAt}`)
  }
}
