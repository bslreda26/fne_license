import { BaseSeeder } from '@adonisjs/lucid/seeders'
import License from '#models/license'

export default class extends BaseSeeder {
  async run() {
    // Update existing licenses to have default point de vente values
    const licenses = await License.query()

    for (const license of licenses) {
      // Set default values if they are null/undefined
      if (license.pointDeVente === null || license.pointDeVente === undefined) {
        license.pointDeVente = 0
      }

      if (license.maxPointDeVente === null || license.maxPointDeVente === undefined) {
        license.maxPointDeVente = 10 // Default max value
      }

      await license.save()
    }

    console.log(`Updated ${licenses.length} existing licenses with point de vente values`)
  }
}
