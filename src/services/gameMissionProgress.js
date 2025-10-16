import { db, auth } from '@/firebase/config'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  serverTimestamp,
  getDocs,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'

export const saveMissionProgress = async (missionData) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Use a composite key of userId and missionId to ensure unique documents
  const docId = `${user.uid}_${missionData.missionId}`
  const studentMissionRef = doc(db, 'studentMissionsProgress', docId)

  const newStudentMission = {
    ...missionData,
    userId: user.uid,
    updatedAt: serverTimestamp()
    // Only set createdAt if it's a new document
  }

  // Check if document exists to set createdAt only once
  const docSnap = await getDoc(studentMissionRef)
  if (!docSnap.exists()) {
    newStudentMission.createdAt = serverTimestamp()
  }

  await setDoc(studentMissionRef, newStudentMission, { merge: true })
}

/**
 * Track when a user starts a mission attempt
 * @param {string} missionId - The mission ID
 * @param {string} missionTitle - The mission title
 */
export const startMissionAttempt = async (missionId, missionTitle) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    const docId = `${user.uid}_${missionId}`
    const studentMissionRef = doc(db, 'studentMissionsProgress', docId)
    const docSnap = await getDoc(studentMissionRef)

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
      await updateDoc(studentMissionRef, {
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
        userId: user.uid,
        step: 'intro_scene',
        progress: 0,
        attemptCount: 1,
        attempts: [attemptData],
        lastAttemptStartTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(studentMissionRef, newDoc)
    }

    return attemptData.startTime
  } catch (error) {
    console.error('Error starting mission attempt:', error)
    throw error
  }
}

/**
 * Track when a user ends a mission attempt
 * @param {string} missionId - The mission ID
 * @param {Date} startTime - The start time of the session
 */
export const endMissionAttempt = async (missionId, startTime) => {
  const user = auth.currentUser
  if (!user || !startTime) {
    return // Silently return if no user or start time
  }

  try {
    const docId = `${user.uid}_${missionId}`
    const studentMissionRef = doc(db, 'studentMissionsProgress', docId)
    const docSnap = await getDoc(studentMissionRef)

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

        await updateDoc(studentMissionRef, {
          attempts: attempts,
          totalTimeSpent: totalTimeSpent,
          lastSessionDuration: duration,
          updatedAt: serverTimestamp()
        })
      }
    }
  } catch (error) {
    console.error('Error ending mission attempt:', error)
  }
}

/**
 * Get mission analytics data
 * @param {string} missionId - The mission ID
 */
export const getMissionAnalytics = async (missionId) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    const docId = `${user.uid}_${missionId}`
    const studentMissionRef = doc(db, 'studentMissionsProgress', docId)
    const docSnap = await getDoc(studentMissionRef)

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
    console.error('Error fetching mission analytics:', error)
    throw error
  }
}

export const getMissionProgress = async (missionId) => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    const docId = `${user.uid}_${missionId}`
    const studentMissionRef = doc(db, 'studentMissionsProgress', docId)
    const docSnap = await getDoc(studentMissionRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return data
    } else {
      // Return default progress if no document exists
      return {
        missionId: missionId,
        userId: user.uid,
        step: 'intro_scene',
        progress: 0,
        attemptCount: 0,
        totalTimeSpent: 0,
        attempts: []
      }
    }
  } catch (error) {
    console.error('Error fetching mission progress:', error)
    throw error
  }
}

export const getStudentMissionsProgress = async () => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    const studentMissionsRef = collection(db, 'studentMissionsProgress')
    const docSnap = await getDocs(studentMissionsRef)
    const missionsProgress = docSnap.docs
      .map((doc) => {
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
      .filter((progress) => progress.userId === user.uid) // Filter by current user

    return missionsProgress
  } catch (error) {
    console.error('Error fetching student missions progress:', error)
    throw error
  }
}
