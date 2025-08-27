import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('client_id').notNullable()
      table.string('license_key').notNullable().unique()
      table.enum('status', ['active', 'expired', 'revoked']).notNullable().defaultTo('active')
      table.datetime('valid_until').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
