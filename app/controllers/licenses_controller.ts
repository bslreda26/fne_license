import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { LicenseService } from '#services/license_service'

export default class LicensesController {
  private licenseService = new LicenseService()

  /**
   * Display a list of licenses
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const status = request.input('status')
      const clientId = request.input('client_id')

      const licenses = await this.licenseService.getLicenses({ page, limit, status, clientId })
      
      return response.ok(licenses)
    } catch (error) {
      return response.internalServerError({ error: 'Failed to fetch licenses' })
    }
  }

  /**
   * Display a single license
   */
  async show({ params, response }: HttpContext) {
    try {
      const license = await this.licenseService.getLicenseById(params.id)
      
      if (!license) {
        return response.notFound({ error: 'License not found' })
      }

      return response.ok(license)
    } catch (error) {
      return response.internalServerError({ error: 'Failed to fetch license' })
    }
  }

  /**
   * Create a new license
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['clientId', 'licenseKey', 'status', 'validUntil', 'pointDeVente', 'maxPointDeVente'])

      console.log('Creating license with data:', data)
      
      // Convert validUntil string to DateTime object
      if (data.validUntil && typeof data.validUntil === 'string') {
        data.validUntil = DateTime.fromISO(data.validUntil)
      }
      
      console.log('Creating license with data:', data)
      
      const license = await this.licenseService.createLicense(data)
      
      return response.created(license)
    } catch (error) {
      console.error('Error creating license:', error)
      
      if (error.code === 'E_DUPLICATE_ENTRY') {
        return response.badRequest({ error: 'License key already exists' })
      }
      
      return response.internalServerError({ 
        error: 'Failed to create license',
        details: error.message || 'Unknown error'
      })
    }
  }

  /**
   * Update license details
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.only(['clientId', 'status', 'validUntil', 'pointDeVente', 'maxPointDeVente'])
      
      // Convert validUntil string to DateTime object
      if (data.validUntil && typeof data.validUntil === 'string') {
        data.validUntil = DateTime.fromISO(data.validUntil)
      }
      
      const license = await this.licenseService.updateLicense(params.id, data)
      
      if (!license) {
        return response.notFound({ error: 'License not found' })
      }

      return response.ok(license)
    } catch (error) {
      return response.internalServerError({ error: 'Failed to update license' })
    }
  }

  /**
   * Delete a license
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const deleted = await this.licenseService.deleteLicense(params.id)
      
      if (!deleted) {
        return response.notFound({ error: 'License not found' })
      }

      return response.noContent()
    } catch (error) {
      return response.internalServerError({ error: 'Failed to delete license' })
    }
  }

  /**
   * Revoke a license
   */
  async revoke({ params, response }: HttpContext) {
    try {
      const license = await this.licenseService.revokeLicense(params.id)
      
      if (!license) {
        return response.notFound({ error: 'License not found' })
      }

      return response.ok(license)
    } catch (error) {
      return response.internalServerError({ error: 'Failed to revoke license' })
    }
  }

  /**
   * Validate a license
   */
  async validate({ request, response }: HttpContext) {
    try {
      const { licenseKey, clientId } = request.only(['licenseKey', 'clientId'])
      
      const validation = await this.licenseService.validateLicense(licenseKey, clientId)
      
      return response.ok(validation)
    } catch (error) {
      return response.internalServerError({ error: 'Failed to validate license' })
    }
  }

  /**
   * Get all licenses by client ID
   */
  async getByClientId({ params, response }: HttpContext) {
    try {
      const { clientId } = params
      
      const licenses = await this.licenseService.getLicensesByClientId(clientId)
      
      return response.ok({
        clientId,
        licenses,
        count: licenses.length
      })
    } catch (error) {
      console.error('Error fetching licenses by client ID:', error)
      return response.internalServerError({ 
        error: 'Failed to fetch licenses by client ID',
        details: error.message || 'Unknown error'
      })
    }
  }

  /**
   * Update point de vente for a license
   */
  async updatePointDeVente({ params, request, response }: HttpContext) {
    try {
      const { pointDeVente } = request.only(['pointDeVente'])
      
      if (pointDeVente === undefined || pointDeVente === null) {
        return response.badRequest({ error: 'pointDeVente is required' })
      }

      const license = await this.licenseService.updatePointDeVente(params.id, pointDeVente)
      
      if (!license) {
        return response.notFound({ error: 'License not found' })
      }

      return response.ok(license)
    } catch (error) {
      return response.internalServerError({ error: 'Failed to update point de vente' })
    }
  }

  /**
   * Get licenses by point de vente range
   */
  async getByPointDeVenteRange({ request, response }: HttpContext) {
    try {
      const { minPointDeVente, maxPointDeVente, page = 1, limit = 10 } = request.only([
        'minPointDeVente', 
        'maxPointDeVente', 
        'page', 
        'limit'
      ])
      
      const licenses = await this.licenseService.getLicensesByPointDeVenteRange({
        minPointDeVente: minPointDeVente ? parseInt(minPointDeVente) : undefined,
        maxPointDeVente: maxPointDeVente ? parseInt(maxPointDeVente) : undefined,
        page: parseInt(page),
        limit: parseInt(limit)
      })
      
      return response.ok(licenses)
    } catch (error) {
      return response.internalServerError({ error: 'Failed to fetch licenses by point de vente range' })
    }
  }
}
