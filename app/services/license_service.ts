import { DateTime } from 'luxon'
import License from '#models/license'
import { Exception } from '@adonisjs/core/exceptions'

export interface CreateLicenseData {
  clientId: string
  licenseKey?: string
  status?: 'active' | 'expired' | 'revoked'
  validUntil: DateTime
}

export interface UpdateLicenseData {
  clientId?: string
  status?: 'active' | 'expired' | 'revoked'
  validUntil?: DateTime
}

export interface GetLicensesOptions {
  page?: number
  limit?: number
  status?: string
  clientId?: string
}

export class LicenseService {
  /**
   * Get all licenses with pagination and filtering
   */
  async getLicenses(options: GetLicensesOptions = {}) {
    const { page = 1, limit = 10, status, clientId } = options

    const query = License.query()

    if (status) {
      query.where('status', status)
    }

    if (clientId) {
      query.where('clientId', clientId)
    }

    return await query.orderBy('createdAt', 'desc').paginate(page, limit)
  }

  /**
   * Get a license by ID
   */
  async getLicenseById(id: number) {
    return await License.find(id)
  }

  /**
   * Get a license by license key
   */
  async getLicenseByKey(licenseKey: string) {
    return await License.findBy('licenseKey', licenseKey)
  }

  /**
   * Get all licenses by client ID
   */
  async getLicensesByClientId(clientId: string) {
    return await License.query().where('clientId', clientId).orderBy('createdAt', 'desc')
  }

  /**
   * Create a new license
   */
  async createLicense(data: CreateLicenseData) {
    let licenseKey = data.licenseKey

    // Generate license key if not provided
    if (!licenseKey) {
      licenseKey = await this.generateLicenseKey()
    } else {
      // Check if license key already exists
      const existingLicense = await this.getLicenseByKey(licenseKey)
      if (existingLicense) {
        throw new Exception('License key already exists', {
          code: 'E_DUPLICATE_ENTRY',
          status: 400,
        })
      }
    }

    // Set default status if not provided
    const licenseData = {
      ...data,
      licenseKey,
      status: data.status || 'active',
    }

    return await License.create(licenseData)
  }

  /**
   * Update a license
   */
  async updateLicense(id: number, data: UpdateLicenseData) {
    const license = await this.getLicenseById(id)
    if (!license) {
      return null
    }

    // Update the license
    license.merge(data)
    await license.save()

    return license
  }

  /**
   * Delete a license
   */
  async deleteLicense(id: number) {
    const license = await this.getLicenseById(id)
    if (!license) {
      return false
    }

    await license.delete()
    return true
  }

  /**
   * Revoke a license
   */
  async revokeLicense(id: number) {
    const license = await this.getLicenseById(id)
    if (!license) {
      return null
    }

    license.status = 'revoked'
    await license.save()

    return license
  }

  /**
   * Validate a license
   */
  async validateLicense(licenseKey: string, clientId: string) {
    const license = await this.getLicenseByKey(licenseKey)

    if (!license) {
      return {
        valid: false,
        reason: 'License not found',
      }
    }

    if (license.clientId !== clientId) {
      return {
        valid: false,
        reason: 'License does not belong to this client',
      }
    }

    if (license.status === 'revoked') {
      return {
        valid: false,
        reason: 'License has been revoked',
      }
    }

    if (license.status === 'expired') {
      return {
        valid: false,
        reason: 'License has expired',
      }
    }

    const now = DateTime.now()
    if (license.validUntil < now) {
      // Auto-expire the license
      license.status = 'expired'
      await license.save()

      return {
        valid: false,
        reason: 'License has expired',
      }
    }

    return {
      valid: true,
      license: {
        id: license.id,
        clientId: license.clientId,
        status: license.status,
        validUntil: license.validUntil,
      },
    }
  }

  /**
   * Generate a unique license key
   */
  async generateLicenseKey(): Promise<string> {
    const generateKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) result += '-'
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    let licenseKey: string
    let attempts = 0
    const maxAttempts = 10

    do {
      licenseKey = generateKey()
      attempts++

      if (attempts > maxAttempts) {
        throw new Exception('Failed to generate unique license key', {
          status: 500,
        })
      }
    } while (await this.getLicenseByKey(licenseKey))

    return licenseKey
  }

  /**
   * Check for expired licenses and update their status
   */
  async checkExpiredLicenses() {
    const now = DateTime.now()

    const expiredLicenses = await License.query()
      .where('status', 'active')
      .where('validUntil', '<', now.toSQL())
    // eslint-disable-next-line prettier/prettier
    
    for (const license of expiredLicenses) {
      license.status = 'expired'
      await license.save()
    }

    return expiredLicenses.length
  }
}
