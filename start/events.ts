import emitter from '@adonisjs/core/services/emitter'
import UserRegistered from '#events/user_registered'
import UserLoggedIn from '#events/user_logged_in'
import UserPasswordChanged from '#events/user_password_changed'
import UserPasswordResetRequested from '#events/user_password_reset_requested'
import UserPasswordReset from '#events/user_password_reset'

emitter.listen(UserPasswordChanged, [() => import('#listeners/send_user_password_changed_email')])
emitter.listen(UserRegistered, [() => import('#listeners/send_verification_email')])
emitter.listen(UserLoggedIn, [() => import('#listeners/update_user_last_login')])
emitter.listen(UserPasswordResetRequested, [() => import('#listeners/send_password_reset_email')])
emitter.listen(UserPasswordReset, [() => import('#listeners/send_password_reset_success_email')])
