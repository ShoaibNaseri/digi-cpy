export const educatorAccountSetupValidationRules = {
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
