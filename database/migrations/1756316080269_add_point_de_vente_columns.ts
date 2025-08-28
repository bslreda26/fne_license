import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('point_de_vente').defaultTo(0).notNullable()
      table.integer('max_point_de_vente').defaultTo(0).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('point_de_vente')
      table.dropColumn('max_point_de_vente')
    })
  }
}
