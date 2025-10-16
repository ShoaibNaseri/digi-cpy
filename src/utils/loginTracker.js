import {
  doc,
  updateDoc,
  setDoc,
  arrayUnion,
  getDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * Tracks user login activity and updates Firestore
 * @param {Object|string} userOrUserId - The authenticated user object or user ID string
 */
export const trackUserLogin = async (userOrUserId) => {
  let userId, userEmail, displayName

  // Handle both user object and userId string
  if (typeof userOrUserId === 'string') {
    userId = userOrUserId
    // Get user details from Firestore if only userId is provided
    try {
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        const userData = userDoc.data()
        userEmail = userData.email || ''
        displayName =
          userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`
            : userData.name || ''
      }
    } catch (error) {
      console.error('Error fetching user details for login tracking:', error)
    }
  } else if (userOrUserId && userOrUserId.uid) {
    userId = userOrUserId.uid
    userEmail = userOrUserId.email || ''
    displayName = userOrUserId.displayName || ''
  } else {
    console.error('Invalid user data provided to trackUserLogin')
    return
  }

  if (!userId) {
    console.error('User ID is required for login tracking')
    return
  }

  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    // Use Firestore Timestamp for consistent timing
    const currentTimestamp = Timestamp.now()

    if (userDoc.exists()) {
      // User exists, increment login count
      const userData = userDoc.data()
      const currentLoginCount = userData.loginCount || 0

      await updateDoc(userDocRef, {
        lastLogin: currentTimestamp,
        loginHistory: arrayUnion(currentTimestamp),
        name: displayName || userData.name || '',
        email: userEmail || userData.email || '',
        loginCount: currentLoginCount + 1
      })

      console.log('Login tracked successfully for existing user')
    } else {
      // New user, create document with initial data
      await setDoc(userDocRef, {
        lastLogin: currentTimestamp,
        loginHistory: [currentTimestamp],
        name: displayName || '',
        email: userEmail || '',
        loginCount: 1,
        totalTimeSpent: 0,
        createdAt: currentTimestamp
      })

      console.log('New user document created with login tracking')
    }
  } catch (error) {
    console.error('Error tracking user login:', error)
  }
}

/**
 * Updates user data without affecting login tracking
 * @param {string} userId - The user's UID
 * @param {Object} data - Data to update
 */
export const updateUserData = async (userId, data) => {
  if (!userId) {
    console.error('User ID is required for updateUserData')
    return
  }

  try {
    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, data)
    console.log('User data updated successfully')
  } catch (error) {
    console.error('Error updating user data:', error)
  }
}
