import User from '#models/user'
import { BaseEvent } from '@adonisjs/core/events'

export default class UserPasswordChanged extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public user: User) {
    super()
  }
}
