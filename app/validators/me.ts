import vine from '@vinejs/vine'

export const updateMeValidator = vine.compile(
  vine.object({
    firstName: vine.string().optional(),
    lastName: vine.string().optional(),
    password: vine.string().optional(),
    passwordConfirm: vine.string().sameAs('password').optional().requiredIfExists('password'),
  })
)
