import { db, auth } from '@/firebase/config'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  serverTimestamp,
  getDocs,
  updateDoc,
  arrayUnion,
  query,
  where
} from 'firebase/firestore'

/**
 * Save mission progress for a child
 * @param {Object} missionData - Mission data to save
 * @param {string} childId - The child's ID from the selected profile
 */
export const saveChildMissionProgress = async (missionData, childId) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!childId) {
    throw new Error('Child ID is required')
  }

  // Use a composite key of childId and missionId to ensure unique documents
  const docId = `${childId}_${missionData.missionId}`
  const childMissionRef = doc(db, 'childMissionProgress', docId)

  const newChildMission = {
    ...missionData,
    childId: childId,
    parentUserId: user.uid, // Track which parent created this
    updatedAt: serverTimestamp()
    // Only set createdAt if it's a new document
  }

  // Check if document exists to set createdAt only once
  const docSnap = await getDoc(childMissionRef)
  if (!docSnap.exists()) {
    newChildMission.createdAt = serverTimestamp()
  }

  await setDoc(childMissionRef, newChildMission, { merge: true })
}

/**
 * Track when a child starts a mission attempt
 * @param {string} missionId - The mission ID
 * @param {string} missionTitle - The mission title
 * @param {string} childId - The child's ID from the selected profile
 */
export const startChildMissionAttempt = async (
  missionId,
  missionTitle,
  childId
) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!childId) {
    throw new Error('Child ID is required')
  }

  try {
    const docId = `${childId}_${missionId}`
    const childMissionRef = doc(db, 'childMissionProgress', docId)
    const docSnap = await getDoc(childMissionRef)

    const currentTime = new Date()
    const attemptData = {
      startTime: currentTime,
      endTime: null,
      duration: 0
    }

    if (docSnap.exists()) {
      const existingData = docSnap.data()
      const currentAttemptCount = existingData.attemptCount || 0
      const attempts = existingData.attempts || []

      // Update existing document
      await updateDoc(childMissionRef, {
        missionTitle: missionTitle,
        attemptCount: currentAttemptCount + 1,
        attempts: arrayUnion(attemptData),
        lastAttemptStartTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new document
      const newDoc = {
        missionId: missionId,
        missionTitle: missionTitle,
        childId: childId,
        parentUserId: user.uid,
        step: 'intro_scene',
        progress: 0,
        attemptCount: 1,
        attempts: [attemptData],
        lastAttemptStartTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(childMissionRef, newDoc)
    }

    return attemptData.startTime
  } catch (error) {
    console.error('Error starting child mission attempt:', error)
    throw error
  }
}

/**
 * Track when a child ends a mission attempt
 * @param {string} missionId - The mission ID
 * @param {Date} startTime - The start time of the session
 * @param {string} childId - The child's ID from the selected profile
 */
export const endChildMissionAttempt = async (missionId, startTime, childId) => {
  const user = auth.currentUser
  if (!user || !startTime || !childId) {
    return // Silently return if missing required parameters
  }

  try {
    const docId = `${childId}_${missionId}`
    const childMissionRef = doc(db, 'childMissionProgress', docId)
    const docSnap = await getDoc(childMissionRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      const attempts = data.attempts || []

      // Find the most recent attempt that matches the start time
      const attemptIndex = attempts.findIndex((attempt) => {
        const attemptStartTime =
          attempt.startTime instanceof Date
            ? attempt.startTime
            : attempt.startTime.toDate()
        return Math.abs(attemptStartTime.getTime() - startTime.getTime()) < 1000 // Within 1 second
      })

      if (attemptIndex !== -1) {
        const endTime = new Date()
        const duration = endTime.getTime() - startTime.getTime()

        // Update the specific attempt
        attempts[attemptIndex] = {
          ...attempts[attemptIndex],
          endTime: endTime,
          duration: duration
        }

        // Calculate total time spent across all attempts
        const totalTimeSpent = attempts.reduce((total, attempt) => {
          return total + (attempt.duration || 0)
        }, 0)

        await updateDoc(childMissionRef, {
          attempts: attempts,
          totalTimeSpent: totalTimeSpent,
          lastSessionDuration: duration,
          updatedAt: serverTimestamp()
        })
      }
    }
  } catch (error) {
    console.error('Error ending child mission attempt:', error)
  }
}

/**
 * Get mission analytics data for a child
 * @param {string} missionId - The mission ID
 * @param {string} childId - The child's ID from the selected profile
 */
export const getChildMissionAnalytics = async (missionId, childId) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!childId) {
    throw new Error('Child ID is required')
  }

  try {
    const docId = `${childId}_${missionId}`
    const childMissionRef = doc(db, 'childMissionProgress', docId)
    const docSnap = await getDoc(childMissionRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      const attempts = data.attempts || []

      // Calculate analytics
      const completedAttempts = attempts.filter(
        (attempt) => attempt.endTime
      ).length
      const totalDuration = attempts.reduce(
        (total, attempt) => total + (attempt.duration || 0),
        0
      )
      const averageDuration =
        completedAttempts > 0 ? totalDuration / completedAttempts : 0

      return {
        attemptCount: data.attemptCount || 0,
        completedAttempts,
        totalTimeSpent: totalDuration,
        averageSessionDuration: averageDuration,
        attempts: attempts.map((attempt) => ({
          startTime:
            attempt.startTime instanceof Date
              ? attempt.startTime
              : attempt.startTime?.toDate(),
          endTime:
            attempt.endTime instanceof Date
              ? attempt.endTime
              : attempt.endTime?.toDate?.(),
          duration: attempt.duration || 0
        })),
        lastAttempt: data.lastAttemptStartTime?.toDate?.() || null
      }
    }

    return {
      attemptCount: 0,
      completedAttempts: 0,
      totalTimeSpent: 0,
      averageSessionDuration: 0,
      attempts: [],
      lastAttempt: null
    }
  } catch (error) {
    console.error('Error fetching child mission analytics:', error)
    throw error
  }
}

/**
 * Get mission progress for a specific child and mission
 * @param {string} missionId - The mission ID
 * @param {string} childId - The child's ID from the selected profile
 */
export const getChildMissionProgress = async (missionId, childId) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!childId) {
    throw new Error('Child ID is required')
  }

  try {
    const docId = `${childId}_${missionId}`
    const childMissionRef = doc(db, 'childMissionProgress', docId)
    const docSnap = await getDoc(childMissionRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return data
    } else {
      // Return default progress if no document exists
      return {
        missionId: missionId,
        childId: childId,
        parentUserId: user.uid,
        step: 'intro_scene',
        progress: 0,
        attemptCount: 0,
        totalTimeSpent: 0,
        attempts: []
      }
    }
  } catch (error) {
    console.error('Error fetching child mission progress:', error)
    throw error
  }
}

/**
 * Get all mission progress for a specific child
 * @param {string} childId - The child's ID from the selected profile
 */
export const getChildMissionsProgress = async (childId) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!childId) {
    throw new Error('Child ID is required')
  }

  try {
    const childMissionsRef = collection(db, 'childMissionProgress')
    const q = query(childMissionsRef, where('childId', '==', childId))
    const docSnap = await getDocs(q)

    const missionsProgress = docSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // Include analytics data in the response
        analytics: {
          attemptCount: data.attemptCount || 0,
          totalTimeSpent: data.totalTimeSpent || 0,
          lastAttempt: data.lastAttemptStartTime?.toDate?.() || null,
          averageSessionDuration:
            data.attempts?.length > 0
              ? (data.totalTimeSpent || 0) / data.attempts.length
              : 0
        }
      }
    })

    return missionsProgress
  } catch (error) {
    console.error('Error fetching child missions progress:', error)
    throw error
  }
}

/**
 * Get all mission progress for all children of the current parent
 */
export const getAllChildrenMissionsProgress = async () => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    const childMissionsRef = collection(db, 'childMissionProgress')
    const q = query(childMissionsRef, where('parentUserId', '==', user.uid))
    const docSnap = await getDocs(q)

    const missionsProgress = docSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // Include analytics data in the response
        analytics: {
          attemptCount: data.attemptCount || 0,
          totalTimeSpent: data.totalTimeSpent || 0,
          lastAttempt: data.lastAttemptStartTime?.toDate?.() || null,
          averageSessionDuration:
            data.attempts?.length > 0
              ? (data.totalTimeSpent || 0) / data.attempts.length
              : 0
        }
      }
    })

    return missionsProgress
  } catch (error) {
    console.error('Error fetching all children missions progress:', error)
    throw error
  }
}
