import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import License from '#models/license'
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
      const data = request.only(['clientId', 'licenseKey', 'status', 'validUntil'])
      
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
      const data = request.only(['clientId', 'status', 'validUntil'])
      
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
}
