import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import Sqids from 'sqids'

export const HashIdMixin = <T extends NormalizeConstructor<typeof BaseModel>>(SuperClass: T) => {
  class ParentClass extends SuperClass {
    @column({ serializeAs: 'id' })
    declare hashId: string

    /**
     * Runs before creating and updating the model
     */
    @beforeCreate()
    static async generateHashId(model: any) {
      const sqids = new Sqids({
        minLength: 10,
        alphabet: 'kb17ra0v9ugmlsf2iqhow4cz8ex3ny6jpt5d',
      })

      const date = new Date().getTime()
      model.hashId = sqids.encode([date])
    }
  }
  return ParentClass
}
