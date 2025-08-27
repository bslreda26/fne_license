import { schema, rules } from '@adonisjs/validator'

export const createLicenseSchema = schema.create({
  clientId: schema.string({ trim: true }, [
    rules.minLength(3),
    rules.maxLength(255),
  ]),
  licenseKey: schema.string({ trim: true }, [
    rules.minLength(10),
    rules.maxLength(255),
    rules.unique({ table: 'licenses', column: 'license_key' }),
  ]),
  status: schema.enum(['active', 'expired', 'revoked'] as const),
  validUntil: schema.date({ format: 'iso' }),
})

export const updateLicenseSchema = schema.create({
  clientId: schema.string.optional({ trim: true }, [
    rules.minLength(3),
    rules.maxLength(255),
  ]),
  status: schema.enum.optional(['active', 'expired', 'revoked'] as const),
  validUntil: schema.date.optional({ format: 'iso' }),
})

export const validateLicenseSchema = schema.create({
  licenseKey: schema.string({ trim: true }, [
    rules.minLength(10),
    rules.maxLength(255),
  ]),
  clientId: schema.string({ trim: true }, [
    rules.minLength(3),
    rules.maxLength(255),
  ]),
})
