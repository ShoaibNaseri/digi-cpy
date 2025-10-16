/**
 * Compliance Rules Configuration
 * Defines region-specific compliance requirements for GDPR, CCPA, and PIPEDA
 */

export const REGIONS = {
  EU: 'eu',
  UK: 'uk',
  US_CALIFORNIA: 'us_ca',
  CANADA: 'ca',
  US_OTHER: 'us_other',
  OTHER: 'other'
}

export const COMPLIANCE_RULES = {
  [REGIONS.EU]: {
    name: 'European Union (GDPR)',
    regulation: 'GDPR',
    requiresExplicitConsent: true,
    requiresOptOut: true,
    requiresGranularControl: true,
    requiresConsentWithdrawal: true,
    requiresDataPortability: true,
    requiresRightToBeforgotten: true,
    consentMustBeFreely: true,
    defaultConsent: false,
    showRejectAll: true,
    consentExpiryDays: 365,
    privacyPolicyRequired: true
  },
  [REGIONS.UK]: {
    name: 'United Kingdom (UK GDPR)',
    regulation: 'UK GDPR',
    requiresExplicitConsent: true,
    requiresOptOut: true,
    requiresGranularControl: true,
    requiresConsentWithdrawal: true,
    requiresDataPortability: true,
    requiresRightToBeforgotten: true,
    consentMustBeFreely: true,
    defaultConsent: false,
    showRejectAll: true,
    consentExpiryDays: 365,
    privacyPolicyRequired: true
  },
  [REGIONS.US_CALIFORNIA]: {
    name: 'California, USA (CCPA/CPRA)',
    regulation: 'CCPA/CPRA',
    requiresExplicitConsent: false,
    requiresOptOut: true,
    requiresGranularControl: false,
    requiresConsentWithdrawal: true,
    requiresDataPortability: true,
    requiresRightToBeforgotten: true,
    consentMustBeFreely: false,
    defaultConsent: true,
    showRejectAll: false,
    consentExpiryDays: 365,
    privacyPolicyRequired: true
  },
  [REGIONS.CANADA]: {
    name: 'Canada (PIPEDA)',
    regulation: 'PIPEDA',
    requiresExplicitConsent: true,
    requiresOptOut: true,
    requiresGranularControl: true,
    requiresConsentWithdrawal: true,
    requiresDataPortability: false,
    requiresRightToBeforgotten: false,
    consentMustBeFreely: true,
    defaultConsent: false,
    showRejectAll: true,
    consentExpiryDays: 365,
    privacyPolicyRequired: true
  },
  [REGIONS.US_OTHER]: {
    name: 'United States (General)',
    regulation: 'State Laws',
    requiresExplicitConsent: false,
    requiresOptOut: true,
    requiresGranularControl: false,
    requiresConsentWithdrawal: true,
    requiresDataPortability: false,
    requiresRightToBeforgotten: false,
    consentMustBeFreely: false,
    defaultConsent: true,
    showRejectAll: false,
    consentExpiryDays: 365,
    privacyPolicyRequired: true
  },
  [REGIONS.OTHER]: {
    name: 'Other Regions',
    regulation: 'General',
    requiresExplicitConsent: false,
    requiresOptOut: false,
    requiresGranularControl: false,
    requiresConsentWithdrawal: false,
    requiresDataPortability: false,
    requiresRightToBeforgotten: false,
    consentMustBeFreely: false,
    defaultConsent: true,
    showRejectAll: false,
    consentExpiryDays: 365,
    privacyPolicyRequired: true
  }
}

export const CONSENT_ACTIONS = {
  ACCEPT_ALL: 'accept_all',
  REJECT_ALL: 'reject_all',
  SAVE_PREFERENCES: 'save_preferences',
  WITHDRAW_CONSENT: 'withdraw_consent',
  UPDATE_PREFERENCES: 'update_preferences'
}

export const BANNER_POSITIONS = {
  BOTTOM: 'bottom',
  TOP: 'top',
  CENTER: 'center'
}

export const BANNER_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}
