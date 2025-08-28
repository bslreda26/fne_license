import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class License extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column({ columnName: 'client_id' })
  public clientId!: string

  @column({ columnName: 'license_key' })
  public licenseKey!: string

  @column()
  public status!: 'active' | 'expired' | 'revoked'

  @column.dateTime()
  public validUntil!: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @column({ columnName: 'point_de_vente' })
  public pointDeVente!: number

  @column({ columnName: 'max_point_de_vente' })
  public maxPointDeVente!: number
}
