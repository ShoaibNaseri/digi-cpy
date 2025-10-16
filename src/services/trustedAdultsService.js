import { db, auth } from '@/firebase/config'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { decryptFields, encryptFields } from './encryptionService'

/**
 * Fetch trusted adults data for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<string[]>} Array of trusted adults or empty array with 3 empty strings
 */
export const fetchTrustedAdults = async (userId) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }
  try {
    const docRef = doc(db, 'trustedAdults', user.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = decryptFields(docSnap.data())
      if (data.adults && Array.isArray(data.adults)) {
        return data.adults
      }
    }

    // Return default empty array if no data exists
    return ['', '', '']
  } catch (error) {
    console.error('Error fetching trusted adults:', error)
    throw error
  }
}

/**
 * Save trusted adults data for a user
 * @param {string} userId - The user's UID
 * @param {string[]} adults - Array of trusted adults
 * @returns {Promise<boolean>} Success status
 */
export const saveTrustedAdults = async (userId, adults) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }
  if (!Array.isArray(adults)) {
    throw new Error('Adults must be an array')
  }

  try {
    await setDoc(doc(db, 'trustedAdults', user.uid), {
      adults: encryptFields(adults),
      userId: user.uid,
      updatedAt: new Date().toISOString()
    })

    return true
  } catch (error) {
    console.error('Error saving trusted adults:', error)
    throw error
  }
}
