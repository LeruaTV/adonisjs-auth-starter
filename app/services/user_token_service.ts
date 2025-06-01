import UserToken from '#models/user_token'
import { DateTime, DurationLike } from 'luxon'
import { TokenUtil } from '../utils/token_util.js'
import User from '#models/user'

export class UserTokenService {
  public async generateNumeric(
    user: User,
    length: number = 6,
    duration: DurationLike = { hours: 24 }
  ): Promise<string> {
    const token = await user.related('tokens').create({
      token: TokenUtil.numeric(length),
      expiresAt: DateTime.now().plus(duration),
    }) // Create a new UserToken instance

    return token.token // Return unhashed token for email
  }

  public async verify(token: string, user: User): Promise<UserToken | boolean> {
    const now = DateTime.now().toISO()
    const userToken = await user
      .related('tokens')
      .query()
      .where('token', token)
      .where('expiresAt', '>', now)
      .first()

    if (!userToken) {
      return false // Return null if token not found or expired
    }

    return userToken // Return the token if found and not expired
  }

  public async delete(token: string): Promise<void> {
    const userToken = await UserToken.query().where('token', token).first()
    if (userToken) {
      await userToken.delete() // Delete the token from the database
    }
  }

  public async deleteExpired(): Promise<void> {
    const now = DateTime.now().toISO()
    await UserToken.query().where('expiresAt', '<=', now).delete() // Delete all expired tokens
  }

  /**
   * Find a token with its associated user
   * @param token - The token to find
   * @returns The UserToken with user relation loaded, or null if not found/expired
   */
  public async findTokenWithUser(token: string): Promise<UserToken | null> {
    const now = DateTime.now().toISO()
    const userToken = await UserToken.query()
      .where('token', token)
      .where('expiresAt', '>', now)
      .preload('user')
      .first()

    return userToken || null
  }
}
