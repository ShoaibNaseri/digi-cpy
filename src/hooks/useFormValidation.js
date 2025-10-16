import { useState } from 'react'

const useFormValidation = (initialState = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateField = (name, value, allValues = values) => {
    if (!validationRules[name]) return ''

    const rules = validationRules[name]
    let error = ''

    if (rules.required) {
      // Handle different data types for required validation
      if (typeof value === 'boolean') {
        if (!value) {
          error = rules.required
        }
      } else if (typeof value === 'string') {
        if (!value || value.trim() === '') {
          error = rules.required
        }
      } else {
        // For other types (numbers, objects, etc.)
        if (!value) {
          error = rules.required
        }
      }
    } else if (rules.pattern && value && !rules.pattern.test(value)) {
      error = rules.message
    } else if (rules.validate) {
      error = rules.validate(value, allValues)
    }

    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: value
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, { ...values, [name]: value })
    }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name], values)
      if (error) {
        newErrors[name] = error
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setValues(initialState)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues
  }
}

export default useFormValidation
