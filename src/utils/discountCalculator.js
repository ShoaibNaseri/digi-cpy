/**
 * Utility functions for calculating discounts and pricing
 */

/**
 * Calculate the discounted price after applying a percentage discount
 * @param {number} originalPrice - The original price
 * @param {number} discountPercentage - The discount percentage (0-100)
 * @returns {number} The discounted price rounded to 2 decimal places
 */
export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  if (
    typeof originalPrice !== 'number' ||
    typeof discountPercentage !== 'number'
  ) {
    throw new Error('Both originalPrice and discountPercentage must be numbers')
  }

  if (originalPrice < 0) {
    throw new Error('Original price cannot be negative')
  }

  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100')
  }

  const discountAmount = originalPrice * (discountPercentage / 100)
  const discountedPrice = originalPrice - discountAmount

  return Math.round(discountedPrice * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate the discount amount in dollars
 * @param {number} originalPrice - The original price
 * @param {number} discountPercentage - The discount percentage (0-100)
 * @returns {number} The discount amount rounded to 2 decimal places
 */
export const calculateDiscountAmount = (originalPrice, discountPercentage) => {
  if (
    typeof originalPrice !== 'number' ||
    typeof discountPercentage !== 'number'
  ) {
    throw new Error('Both originalPrice and discountPercentage must be numbers')
  }

  if (originalPrice < 0) {
    throw new Error('Original price cannot be negative')
  }

  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100')
  }

  const discountAmount = originalPrice * (discountPercentage / 100)
  return Math.round(discountAmount * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate the total price for multiple items with discount
 * @param {number} originalPrice - The original price per item
 * @param {number} quantity - The number of items
 * @param {number} discountPercentage - The discount percentage (0-100)
 * @returns {number} The total discounted price rounded to 2 decimal places
 */
export const calculateTotalDiscountedPrice = (
  originalPrice,
  quantity,
  discountPercentage
) => {
  const discountedPrice = calculateDiscountedPrice(
    originalPrice,
    discountPercentage
  )
  const total = discountedPrice * quantity
  return Math.round(total * 100) / 100 // Round to 2 decimal places
}

/**
 * Get discount rate based on quantity (for volume discounts)
 * @param {number} quantity - The quantity of items
 * @returns {number|null} The discount rate (0-1) or null for custom pricing
 */
export const getVolumeDiscountRate = (quantity) => {
  if (quantity >= 5000) return 0.15 // 15% discount
  if (quantity >= 3000 && quantity <= 4999) return 0.13 // 13% discount
  if (quantity >= 2000 && quantity <= 2999) return 0.09 // 9% discount
  if (quantity >= 1000 && quantity <= 1999) return 0.07 // 7% discount
  if (quantity >= 500 && quantity <= 999) return 0.05 // 5% discount
  if (quantity >= 1 && quantity <= 499) return 0.0 // No discount
  return null // Custom pricing required
}

/**
 * Format price for display with currency symbol
 * @param {number} price - The price to format
 * @param {string} currency - The currency symbol (default: '$')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = '$') => {
  if (typeof price !== 'number') {
    throw new Error('Price must be a number')
  }
  return `${currency}${price.toFixed(2)}`
}

/**
 * Format discount percentage to avoid floating-point precision issues
 * @param {number} discountRate - The discount rate (0-1)
 * @returns {string} Formatted discount percentage string
 */
export const formatDiscountPercentage = (discountRate) => {
  if (typeof discountRate !== 'number') {
    throw new Error('Discount rate must be a number')
  }

  // Convert to percentage and round to avoid floating-point issues
  const percentage = Math.round(discountRate * 10000) / 100 // Round to 2 decimal places
  return `${percentage}%`
}

/**
 * Calculate and format pricing information for display
 * @param {number} originalPrice - The original price
 * @param {number} quantity - The quantity of items
 * @param {number} discountPercentage - The discount percentage (0-100)
 * @returns {object} Object containing formatted pricing information
 */
export const calculatePricingInfo = (
  originalPrice,
  quantity,
  discountPercentage
) => {
  const discountedPrice = calculateDiscountedPrice(
    originalPrice,
    discountPercentage
  )
  const discountAmount = calculateDiscountAmount(
    originalPrice,
    discountPercentage
  )
  const totalPrice = calculateTotalDiscountedPrice(
    originalPrice,
    quantity,
    discountPercentage
  )

  return {
    originalPrice: formatPrice(originalPrice),
    discountedPrice: formatPrice(discountedPrice),
    discountAmount: formatPrice(discountAmount),
    totalPrice: formatPrice(totalPrice),
    savings: formatPrice(discountAmount * quantity),
    discountPercentage: discountPercentage
  }
}
