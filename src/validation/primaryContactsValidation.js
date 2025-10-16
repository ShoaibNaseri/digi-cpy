export const primaryContactsValidationRules = {
  itAdminName: {},
  itAdminEmail: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  principalName: {},
  principalEmail: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  vicePrincipalName: {},
  vicePrincipalEmail: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  educDepartmentName: {},
  educDepartmentEmail: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  }
}

export function validatePrincipalOrVicePrincipal(values) {
  const principalFilled =
    values.principalName?.trim() && values.principalEmail?.trim()
  const viceFilled =
    values.vicePrincipalName?.trim() && values.vicePrincipalEmail?.trim()
  if (!principalFilled && !viceFilled) {
    return 'At least one of Principal or Vice Principal (name and email) is required.'
  }
  return ''
}
