export const schoolDetailsValidationRules = {
  schoolName: {
    required: 'School name is required'
  },
  schoolPhone: {
    required: 'Phone number is required',
    pattern: /^\d{3}-\d{3}-\d{4}$/,
    message: 'Phone must be in format: 123-456-7890'
  },
  country: {
    required: 'Country is required'
  },
  region: {
    required: 'Region/State is required'
  },
  schoolWebsite: {
    required: 'Website is required',
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid website URL (e.g., https://example.com)'
  },
  schoolDistrict: {
    required: 'School district/board is required'
  }
}
