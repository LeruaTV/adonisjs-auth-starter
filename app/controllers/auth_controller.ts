import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserService from '#services/user_service'
import { inject } from '@adonisjs/core'
import {
  loginValidator,
  registerValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '#validators/auth'
import UserDto from '../dtos/user.js'
import UserLoggedIn from '#events/user_logged_in'

export default class AuthController {
  /**
   * Handle form submission for the edit action
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    const token = await User.accessTokens.create(user)

    if (token.value) {
      UserLoggedIn.dispatch(user)
    }

    return response.ok({
      token: token.value!.release(),
      user: new UserDto(user),
    })
  }

  @inject()
  async register({ request, response }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(registerValidator)
    const user = await userService.create(data)

    const token = await User.accessTokens.create(user)

    UserLoggedIn.dispatch(user)

    return response.ok({
      token: token.value!.release(),
      user: new UserDto(user),
    })
  }

  async logout({ auth, response, request }: HttpContext) {
    // Invalidate the user's token
    await auth.use('api').invalidateToken()

    return response.ok({
      headers: request.headers,
      message: 'Logged out successfully',
    })
  }

  /**
   * Request password reset
   */
  @inject()
  async forgotPassword({ request, response }: HttpContext, userService: UserService) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    await userService.requestPasswordReset(email)

    return response.ok({
      message: 'If the email exists in our system, you will receive a password reset link',
    })
  }

  /**
   * Reset password using token
   */
  @inject()
  async resetPassword({ request, response }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(resetPasswordValidator)

    const user = await userService.resetPassword(data.token, data.password)

    return response.ok({
      message: 'Password has been reset successfully',
      user: new UserDto(user),
    })
  }
}
