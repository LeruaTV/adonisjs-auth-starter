import User from '#models/user'
import { BaseEvent } from '@adonisjs/core/events'

export default class UserVerified extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public user: User) {
    super()
  }
}
