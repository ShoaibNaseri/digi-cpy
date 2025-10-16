import CryptoJS from 'crypto-js'

// Fields that should be encrypted/decrypted
export const ENCRYPTED_FIELDS = [
  // user fields
  'country',
  'firstName',
  'lastName',
  'pendingEmail',
  'dateOfBirth',
  'email',
  'name',
  'region',

  // school fields
  'schoolName',
  'schoolAdminEmail',
  'address',
  'phone',
  'plan',
  'educDepartmentEmail',
  'educDepartmentName',
  'itAdminEmail',
  'itAdminName',
  'principalEmail',
  'principalName',
  'vicePrincipalEmail',
  'vicePrincipalName',
  'schoolDistrict',
  'schoolPhone',

  // payment fields
  'customer_details',
  'customer_email',
  'amount_total',

  // trusted adults fields
  'adults',

  // parent fields
  'children',

  // message fields
  'message',

  // incident report fields
  'incidentReport'
]

const getEncryptionKey = () => {
  const key = import.meta.env.VITE_ENCRYPTION_KEY
  if (!key) {
    throw new Error('Encryption key not found in environment variables')
  }
  return key
}

export const encrypt = (value) => {
  if (!value) return value
  const key = getEncryptionKey()
  // Convert objects/arrays to JSON string before encryption
  const stringValue =
    typeof value === 'object' || Array.isArray(value)
      ? JSON.stringify(value)
      : String(value)
  return CryptoJS.AES.encrypt(stringValue, key).toString()
}

export const decrypt = (encryptedValue) => {
  if (!encryptedValue) return encryptedValue
  if (!encryptedValue.toString().startsWith('U2FsdGVk')) {
    return encryptedValue
  }
  const key = getEncryptionKey()
  const bytes = CryptoJS.AES.decrypt(encryptedValue, key)
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8)

  // Try to parse as JSON if it looks like JSON
  try {
    if (decryptedString.startsWith('{') || decryptedString.startsWith('[')) {
      return JSON.parse(decryptedString)
    }
  } catch (e) {
    // If parsing fails, it's not a valid JSON
  }
  return decryptedString
}

export const encryptFields = (data) => {
  if (!data) return data

  const encryptedData = { ...data }
  ENCRYPTED_FIELDS.forEach((field) => {
    if (encryptedData[field]) {
      // Check if the field is already encrypted (base64 format starting with U2FsdGVk)
      if (!encryptedData[field].toString().startsWith('U2FsdGVk')) {
        encryptedData[field] = encrypt(encryptedData[field].toString())
      }
    }
  })

  return encryptedData
}

export const decryptFields = (data) => {
  if (!data) return data

  const decryptedData = { ...data }
  ENCRYPTED_FIELDS.forEach((field) => {
    if (decryptedData[field]) {
      decryptedData[field] = decrypt(decryptedData[field])
    }
  })

  return decryptedData
}
