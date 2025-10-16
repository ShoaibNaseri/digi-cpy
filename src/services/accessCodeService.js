import { db, auth } from '@/firebase/config'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  getDoc,
  writeBatch
} from 'firebase/firestore'
import { createLog } from './logService'
import { decryptFields } from './encryptionService'
import { schoolStudentSignUp } from './authServices'
import {
  checkSchoolHasEnoughSeats,
  updateSchoolSeatUsage
} from './seatsManageService'

// Access code statuses
export const ACCESS_CODE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  INVALID: 'invalid'
}

/**
 * Generate a random access code in format XXXX-XXXX-XXX
 * @returns {string} Generated access code
 */
export const generateAccessCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'

  // Generate a random code in format XXXX-XXXX-XXX
  const part1 = [...Array(4)]
    .map(() => characters[Math.floor(Math.random() * characters.length)])
    .join('')
  const part2 = [...Array(4)]
    .map(() => numbers[Math.floor(Math.random() * numbers.length)])
    .join('')
  const part3 = [...Array(3)]
    .map(() => characters[Math.floor(Math.random() * characters.length)])
    .join('')

  return `${part1}-${part2}-${part3}`
}

/**
 * Create a new access code
 * @param {Object} accessCodeData - Access code data
 * @returns {Promise<Object>} Created access code document reference
 */
export const createAccessCode = async (accessCodeData) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Generate expiration date (24 hours from now)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const accessCodeRef = collection(db, 'accessCodes')
    const newAccessCode = {
      code: generateAccessCode(),
      classId: accessCodeData.classId,
      className: accessCodeData.className,
      grade: accessCodeData.grade,
      teacherId: user.uid,
      schoolId: accessCodeData.schoolId,
      status: ACCESS_CODE_STATUS.ACTIVE,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt,
      usedBy: [], // Array to track which students used this code
      ...accessCodeData
    }

    const docRef = await addDoc(accessCodeRef, newAccessCode)

    // Create log entry
    await createLog({
      userId: user.uid,
      collectionName: 'accessCodes',
      data: newAccessCode,
      schoolId: accessCodeData.schoolId,
      action: 'CREATE_ACCESS_CODE'
    })

    return { id: docRef.id, ...newAccessCode }
  } catch (error) {
    console.error('Error creating access code:', error)
    throw error
  }
}

/**
 * Get all access codes for a teacher
 * @param {string} teacherId - Teacher ID
 * @param {string} schoolId - School ID
 * @returns {Promise<Array>} Array of access codes
 */
export const getTeacherAccessCodes = async (teacherId, schoolId) => {
  try {
    const accessCodesRef = collection(db, 'accessCodes')
    const q = query(
      accessCodesRef,
      where('teacherId', '==', teacherId),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const accessCodes = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Convert Firestore timestamp to Date for expiration calculations
      const expiresAt = data.expiresAt?.toDate() || new Date()
      const now = new Date()

      // Auto-update status if expired
      let status = data.status
      if (status === ACCESS_CODE_STATUS.ACTIVE && now > expiresAt) {
        status = ACCESS_CODE_STATUS.EXPIRED
        // Update in Firebase asynchronously
        updateAccessCodeStatus(doc.id, ACCESS_CODE_STATUS.EXPIRED)
      }

      accessCodes.push({
        id: doc.id,
        ...data,
        status,
        expiresAt
      })
    })

    return accessCodes
  } catch (error) {
    console.error('Error getting access codes:', error)
    throw error
  }
}

/**
 * Update access code status
 * @param {string} accessCodeId - Access code ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateAccessCodeStatus = async (accessCodeId, status) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    const accessCodeRef = doc(db, 'accessCodes', accessCodeId)
    await updateDoc(accessCodeRef, {
      status,
      updatedAt: serverTimestamp()
    })

    // Create log entry
    await createLog({
      userId: user.uid,
      collectionName: 'accessCodes',
      data: { accessCodeId, status },
      schoolId: 'system', // Will be updated with proper schoolId if needed
      action: 'UPDATE_ACCESS_CODE_STATUS'
    })
  } catch (error) {
    console.error('Error updating access code status:', error)
    throw error
  }
}

/**
 * Delete an access code
 * @param {string} accessCodeId - Access code ID
 * @returns {Promise<void>}
 */
export const deleteAccessCode = async (accessCodeId) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    const accessCodeRef = doc(db, 'accessCodes', accessCodeId)
    await deleteDoc(accessCodeRef)

    // Create log entry
    await createLog({
      userId: user.uid,
      collectionName: 'accessCodes',
      data: { accessCodeId },
      schoolId: 'system',
      action: 'DELETE_ACCESS_CODE'
    })
  } catch (error) {
    console.error('Error deleting access code:', error)
    throw error
  }
}

/**
 * Set up real-time listener for teacher's access codes
 * @param {string} teacherId - Teacher ID
 * @param {string} schoolId - School ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAccessCodes = (teacherId, schoolId, callback) => {
  try {
    const accessCodesRef = collection(db, 'accessCodes')
    const q = query(
      accessCodesRef,
      where('teacherId', '==', teacherId),
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const accessCodes = []
      const now = new Date()

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const expiresAt = data.expiresAt?.toDate() || new Date()

        // Auto-update status if expired
        let status = data.status
        if (status === ACCESS_CODE_STATUS.ACTIVE && now > expiresAt) {
          status = ACCESS_CODE_STATUS.EXPIRED
          // Update in Firebase asynchronously
          updateAccessCodeStatus(doc.id, ACCESS_CODE_STATUS.EXPIRED)
        }

        accessCodes.push({
          id: doc.id,
          ...data,
          status,
          expiresAt
        })
      })

      callback(accessCodes)
    })
  } catch (error) {
    console.error('Error setting up access codes listener:', error)
    throw error
  }
}

/**
 * Validate and verify an access code
 * @param {string} code - Access code to validate
 * @returns {Promise<Object>} Access code data if valid
 */
export const validateAccessCode = async (code) => {
  try {
    const accessCodesRef = collection(db, 'accessCodes')
    const q = query(
      accessCodesRef,
      where('code', '==', code),
      where('status', '==', ACCESS_CODE_STATUS.ACTIVE)
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error('Invalid or expired access code')
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()
    const expiresAt = data.expiresAt?.toDate() || new Date()
    const now = new Date()

    // Check if code is expired
    if (now > expiresAt) {
      // Update status to expired
      await updateAccessCodeStatus(doc.id, ACCESS_CODE_STATUS.EXPIRED)
      throw new Error('Access code has expired')
    }

    return {
      id: doc.id,
      ...data,
      expiresAt
    }
  } catch (error) {
    console.error('Error validating access code:', error)
    throw error
  }
}

/**
 * Mark access code as used by a student
 * @param {string} accessCodeId - Access code ID
 * @param {string} studentId - Student ID
 * @returns {Promise<void>}
 */
export const markAccessCodeUsed = async (accessCodeId, studentId) => {
  try {
    const accessCodeRef = doc(db, 'accessCodes', accessCodeId)
    await updateDoc(accessCodeRef, {
      usedBy: [
        ...((await getDoc(accessCodeRef)).data().usedBy || []),
        studentId
      ],
      lastUsedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error marking access code as used:', error)
    throw error
  }
}

/**
 * Calculate time remaining until expiration
 * @param {Date} expiresAt - Expiration date
 * @returns {Object} Time remaining object
 */
export const calculateTimeRemaining = (expiresAt) => {
  const now = new Date()
  const timeRemaining = expiresAt.getTime() - now.getTime()

  if (timeRemaining <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  return { hours, minutes, seconds, expired: false }
}

/**
 * Format time remaining as string
 * @param {Object} timeRemaining - Time remaining object
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (timeRemaining) => {
  if (timeRemaining.expired) {
    return 'Expired'
  }

  const { hours, minutes, seconds } = timeRemaining
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`
}

/**
 * Register a student account using access code data
 * @param {Object} studentData - Student registration data
 * @param {Object} accessCodeData - Access code data from validation
 * @returns {Promise<Object>} Created user credential
 */
export const registerStudentWithAccessCode = async (
  studentData,
  accessCodeData
) => {
  try {
    // Check if school has enough seats before registration
    const seatCheckResult = await checkSchoolHasEnoughSeats(
      accessCodeData.schoolId,
      'unified',
      1 // Only need 1 seat for a single student registration
    )

    if (!seatCheckResult.hasEnoughSeats) {
      throw new Error(
        `School has reached its seat limit. Please contact your school administrator.`
      )
    }

    // Create the student account
    const userCredential = await schoolStudentSignUp(
      studentData.email,
      studentData.password,
      studentData.firstName,
      studentData.lastName,
      accessCodeData.schoolId,
      `student_${Date.now()}`, // Generate unique student ID
      accessCodeData.classId,
      null, // No docId for access code registration
      studentData.country || 'United States',
      studentData.region || '',
      studentData.username // Pass username to the signup function
    )

    // Update school seat usage after successful registration
    await updateSchoolSeatUsage(
      accessCodeData.schoolId,
      'unified',
      1 // One student registered
    )

    // Mark the access code as used by this student
    await markAccessCodeUsed(
      accessCodeData.accessCodeId,
      userCredential.user.uid
    )

    // Create log entry for access code registration
    await createLog({
      userId: userCredential.user.uid,
      collectionName: 'users',
      data: {
        ...studentData,
        accessCodeId: accessCodeData.accessCodeId,
        registrationMethod: 'access_code'
      },
      schoolId: accessCodeData.schoolId,
      action: 'REGISTER_STUDENT_VIA_ACCESS_CODE'
    })

    return userCredential
  } catch (error) {
    console.error('Error registering student with access code:', error)
    throw error
  }
}

/**
 * Get class information for student registration
 * @param {string} classId - Class ID
 * @returns {Promise<Object>} Class information
 */
export const getClassInfoForRegistration = async (classId) => {
  try {
    const classRef = doc(db, 'classes', classId)
    const classDoc = await getDoc(classRef)

    if (!classDoc.exists()) {
      throw new Error('Class not found')
    }

    const data = classDoc.data()
    const decryptedData = decryptFields(data)

    return {
      id: classDoc.id,
      ...decryptedData
    }
  } catch (error) {
    console.error('Error getting class info:', error)
    throw error
  }
}

export const getSchoolInfoForRegistration = async (schoolId) => {
  try {
    const schoolRef = doc(db, 'schools', schoolId)
    const schoolDoc = await getDoc(schoolRef)

    if (!schoolDoc.exists()) {
      throw new Error('School not found')
    }

    const data = schoolDoc.data()
    const decryptedData = decryptFields(data)

    return decryptedData
  } catch (error) {
    console.error('Error getting school info:', error)
    throw error
  }
}

/**
 * Invalidate all active access codes for a specific class
 * @param {string} classId - Class ID
 * @returns {Promise<void>}
 */
export const invalidateAccessCodesForClass = async (classId) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    const accessCodesRef = collection(db, 'accessCodes')
    const q = query(
      accessCodesRef,
      where('classId', '==', classId),
      where('status', '==', ACCESS_CODE_STATUS.ACTIVE)
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log('No active access codes found for class:', classId)
      return
    }

    // Update all active access codes to invalid status
    const batch = writeBatch(db)
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: ACCESS_CODE_STATUS.INVALID,
        invalidatedAt: serverTimestamp(),
        invalidatedReason: 'class_deleted'
      })
    })

    await batch.commit()

    // Create log entry for bulk invalidation
    await createLog({
      userId: user.uid,
      collectionName: 'accessCodes',
      data: {
        classId,
        invalidatedCount: querySnapshot.size,
        reason: 'class_deleted'
      },
      schoolId: 'system',
      action: 'INVALIDATE_ACCESS_CODES_FOR_CLASS'
    })

    console.log(
      `Invalidated ${querySnapshot.size} access codes for class:`,
      classId
    )
  } catch (error) {
    console.error('Error invalidating access codes for class:', error)
    throw error
  }
}
