/**
 * GTM Components Export
 * Centralized export for all GTM-related components
 */

export { default as GTMTestPanel } from './GTMTestPanel'

// Export GTM utilities for convenience
export { default as gtmService } from '../../services/gtm/gtmService'
export { default as gtmTracker } from '../../utils/gtmTracker'
export { default as useGTM } from '../../hooks/useGTM'
export * from '../../config/gtm'
