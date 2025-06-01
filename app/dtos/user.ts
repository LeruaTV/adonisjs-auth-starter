import { BaseModelDto } from '@adocasts.com/dto/base'
import User from '#models/user'

export default class UserDto extends BaseModelDto {
  declare firstName: string | null
  declare lastName: string | null
  declare fullName: string | null
  declare email: string
  declare isAdmin?: boolean
  declare lastLoginAt: string | null
  declare isVerified: boolean

  constructor(user: User) {
    super()

    this.firstName = user.firstName
    this.lastName = user.lastName
    this.fullName = user.fullName

    this.email = user.email

    if (user.isAdmin) {
      this.isAdmin = user.isAdmin
    }

    this.lastLoginAt = user.lastLoginAt?.toISO()!

    this.isVerified = user.isVerified
  }
}
