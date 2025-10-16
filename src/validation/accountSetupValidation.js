export const accountSetupValidationRules = {
  firstName: {
    required: 'First name is required',
    validate: (value) => {
      const trimmed = value.trim()
      if (!/^[A-Za-z]+(\s+[A-Za-z]+)*$/.test(trimmed)) {
        return 'Only alphabetic characters are allowed'
      }
      return ''
    }
  },
  lastName: {
    required: 'Last name is required',
    validate: (value) => {
      const trimmed = value.trim()
      if (!/^[A-Za-z]+(\s+[A-Za-z]+)*$/.test(trimmed)) {
        return 'Only alphabetic characters are allowed'
      }
      return ''
    }
  },
  phone: {
    pattern: /^\d{3}-\d{3}-\d{4}$/,
    message: 'Phone must be in format: 123-456-7890'
  },
  password: {
    required: 'Password is required',
    validate: (value) =>
      value && value.length < 6
        ? 'Password must be at least 6 characters long'
        : ''
  },
  confirmPassword: {
    required: 'Please confirm your password',
    validate: (value, values) =>
      value !== values.password ? 'Passwords do not match' : ''
  },
  country: {
    required: 'Country is required'
  },
  region: {
    required: 'State/Province is required'
  },
  agreeToTerms: {
    required: 'You must agree to the terms and conditions',
    validate: (value) =>
      value === true ? '' : 'You must agree to the terms and conditions'
  }
}
