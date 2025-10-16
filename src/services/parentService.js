import { db } from '@/firebase/config'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
// import { encryptFields, decryptFields } from './encryptionService'
import {
  decryptFields,
  encryptFields,
  encrypt,
  decrypt
} from './encryptionService'
// Temporary fallback functions until encryption service is available
// const encryptFields = (data) => data
// const decryptFields = (data) => data
import { getAllChildrenMissionsProgress } from './childMissionProgress'

export async function createChildrenAccount({ parentId, children }) {
  const parentRef = doc(db, 'profiles', parentId)
  const parentDoc = await getDoc(parentRef)

  const formattedChildren = children.map((child) => ({
    childId: child.childId,
    parentId: parentId,
    firstName: encrypt(child.firstName),
    lastName: encrypt(child.lastName),
    birthDay: encrypt(child.birthDay),
    accountCreated: child.accountCreated,
    accountStatus: child.accountStatus
  }))

  let allChildren = []

  if (parentDoc.exists()) {
    const parentData = decryptFields(parentDoc.data())
    let existingChildren = parentData.children || []

    // Ensure existingChildren is always an array
    if (!Array.isArray(existingChildren)) {
      if (existingChildren && typeof existingChildren === 'object') {
        // Convert object with numeric keys to array
        existingChildren = Object.values(existingChildren)
      } else {
        existingChildren = []
      }
    }

    allChildren = [...existingChildren, ...formattedChildren]

    await updateDoc(parentRef, { children: encryptFields(allChildren) })
  } else {
    allChildren = formattedChildren
    await setDoc(parentRef, {
      children: encryptFields(formattedChildren)
    })
  }

  // Also add children array to parent's user document for tracking
  await updateParentUserChildren(parentId, allChildren)
}

export async function getChildrenProfiles(parentId) {
  try {
    const parentRef = doc(db, 'profiles', parentId)
    const parentDoc = await getDoc(parentRef)

    if (parentDoc.exists()) {
      const parentData = parentDoc.data()

      // Get children array without decrypting the whole array
      let children = parentData.children || []

      // Ensure we return an array - convert object to array if necessary
      let childrenArray = []
      if (Array.isArray(children)) {
        childrenArray = children
      } else if (children && typeof children === 'object') {
        // Convert object with numeric keys to array
        childrenArray = Object.values(children)
      }

      // Decrypt individual sensitive fields for each child and filter out soft-deleted ones
      return (
        childrenArray
          // .filter((child) => !child.isDeleted) // Filter out soft-deleted children
          .map((child) => ({
            ...child,
            firstName: decrypt(child.firstName),
            lastName: decrypt(child.lastName),
            birthDay: decrypt(child.birthDay)
          }))
      )
    }
    return []
  } catch (error) {
    console.error('Error fetching children profiles:', error)
    return []
  }
}

export async function updateChildrenProfiles(parentId, children) {
  try {
    const parentRef = doc(db, 'profiles', parentId)

    // Encrypt sensitive fields for each child
    const encryptedChildren = children.map((child) => ({
      ...child,
      firstName: encrypt(child.firstName),
      lastName: encrypt(child.lastName),
      birthDay: encrypt(child.birthDay)
    }))

    await updateDoc(parentRef, { children: encryptedChildren })

    // Also update children array in parent's user document for tracking
    await updateParentUserChildren(parentId, encryptedChildren)

    return true
  } catch (error) {
    console.error('Error updating children profiles:', error)
    throw error
  }
}

/**
 * Soft delete children profiles - marks as deleted instead of removing
 * @param {string} parentId - Parent's user ID
 * @param {string} childId - Child ID to soft delete
 */
export async function softDeleteChildProfile(parentId, childId) {
  try {
    const parentRef = doc(db, 'profiles', parentId)
    const parentDoc = await getDoc(parentRef)

    if (!parentDoc.exists()) {
      throw new Error('Parent profile not found')
    }

    const parentData = parentDoc.data()
    let children = parentData.children || []

    // Ensure children is always an array
    if (!Array.isArray(children)) {
      if (children && typeof children === 'object') {
        // Convert object with numeric keys to array
        children = Object.values(children)
      } else {
        children = []
      }
    }

    // Find and soft delete the specific child
    const updatedChildren = children.map((child) => {
      if (child.childId === childId) {
        const deletedAt = new Date().toISOString()
        const willBeDeleted = new Date()
        willBeDeleted.setMonth(willBeDeleted.getMonth() + 1) // One month from now

        return {
          ...child,
          isDeleted: true,
          deletedAt: deletedAt,
          willBeDeleted: willBeDeleted.toISOString(),
          accountStatus: 'Deleted'
        }
      }
      return child
    })

    // Check if data is already encrypted and handle accordingly
    const encryptedChildren = updatedChildren.map((child) => {
      // Check if firstName is already encrypted
      const isAlreadyEncrypted =
        child.firstName && child.firstName.toString().startsWith('U2FsdGVk')

      if (isAlreadyEncrypted) {
        // Data is already encrypted, just return as is
        return child
      } else {
        // Data needs to be encrypted
        return {
          ...child,
          firstName: encrypt(child.firstName),
          lastName: encrypt(child.lastName),
          birthDay: encrypt(child.birthDay)
        }
      }
    })

    // Update profiles collection
    await updateDoc(parentRef, { children: encryptedChildren })

    // Also update parent's user document with deleted status for tracking
    await updateParentUserChildren(parentId, encryptedChildren)

    return true
  } catch (error) {
    console.error('Error soft deleting child profile:', error)
    throw error
  }
}

/**
 * Delete children profiles - only updates profiles collection, keeps tracking in user document
 * @param {string} parentId - Parent's user ID
 * @param {Array} children - Updated children array (after deletion)
 */
export async function deleteChildrenProfiles(parentId, children) {
  try {
    const parentRef = doc(db, 'profiles', parentId)

    // Encrypt sensitive fields for each child
    const encryptedChildren = children.map((child) => ({
      ...child,
      firstName: encrypt(child.firstName),
      lastName: encrypt(child.lastName),
      birthDay: encrypt(child.birthDay)
    }))

    // Only update profiles collection, don't touch parent's user document
    await updateDoc(parentRef, { children: encryptedChildren })

    return true
  } catch (error) {
    console.error('Error deleting children profiles:', error)
    throw error
  }
}

export async function updateParentProfile(parentId, data) {
  const encryptedData = encryptFields(data)
  const parentRef = doc(db, 'users', parentId)
  await updateDoc(parentRef, encryptedData)
}

/**
 * Update children array in parent's user document for tracking
 * @param {string} parentId - Parent's user ID
 * @param {Array} children - Array of children data
 */
export async function updateParentUserChildren(parentId, children) {
  try {
    const parentUserRef = doc(db, 'users', parentId)
    const parentUserDoc = await getDoc(parentUserRef)

    if (parentUserDoc.exists()) {
      const parentUserData = decryptFields(parentUserDoc.data())

      // Create a simplified children array for tracking (without sensitive data)
      const trackingChildren = children.map((child) => ({
        childId: child.childId,
        parentId: child.parentId,
        accountCreated: child.accountCreated,
        accountStatus: child.accountStatus
        // Note: firstName, lastName, birthDay are not included for privacy
      }))

      await updateDoc(parentUserRef, {
        children: encryptFields(trackingChildren),
        lastUpdated: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error updating parent user children tracking:', error)
    // Don't throw error as this is for tracking purposes only
  }
}

/**
 * Get mission progress statistics for all children of a parent
 * @param {string} parentId - The parent's user ID
 * @returns {Object} - Progress statistics including percentage and averages
 */
export async function getChildrenMissionProgressStats(parentId) {
  try {
    // Get all children profiles for this parent
    const children = await getChildrenProfiles(parentId)

    if (!children || children.length === 0) {
      return {
        totalChildren: 0,
        childrenStats: [],
        overallStats: {
          averageProgress: 0,
          totalMissionsStarted: 0,
          totalMissionsCompleted: 0,
          averageCompletionRate: 0,
          totalTimeSpent: 0,
          averageTimePerChild: 0
        }
      }
    }

    // Get all mission progress for all children of this parent
    const allMissionProgress = await getAllChildrenMissionsProgress()

    // Calculate stats for each child
    const childrenStats = children.map((child) => {
      // Filter progress for this specific child
      const childProgress = allMissionProgress.filter(
        (progress) => progress.childId === child.childId
      )

      // Calculate individual child stats
      const missionsStarted = childProgress.length
      const missionsCompleted = childProgress.filter(
        (progress) => progress.isComplete === true
      ).length

      const totalProgress = childProgress.reduce(
        (sum, progress) => sum + (progress.progress || 0),
        0
      )
      const averageProgress =
        missionsStarted > 0 ? totalProgress / missionsStarted : 0

      const totalTimeSpent = childProgress.reduce(
        (sum, progress) => sum + (progress.totalTimeSpent || 0),
        0
      )

      const completionRate =
        missionsStarted > 0 ? (missionsCompleted / missionsStarted) * 100 : 0

      return {
        childId: child.childId,
        firstName: child.firstName,
        lastName: child.lastName,
        missionsStarted,
        missionsCompleted,
        averageProgress: Math.round(averageProgress * 100) / 100, // Round to 2 decimals
        completionRate: Math.round(completionRate * 100) / 100,
        totalTimeSpent,
        averageTimePerMission:
          missionsStarted > 0
            ? Math.round(totalTimeSpent / missionsStarted / 1000)
            : 0, // Convert to seconds
        lastActivity:
          childProgress.length > 0
            ? Math.max(
                ...childProgress.map(
                  (p) => p.updatedAt?.toDate?.()?.getTime() || 0
                )
              )
            : null
      }
    })

    // Calculate overall stats across all children
    const overallStats = {
      averageProgress:
        childrenStats.length > 0
          ? Math.round(
              (childrenStats.reduce(
                (sum, child) => sum + child.averageProgress,
                0
              ) /
                childrenStats.length) *
                100
            ) / 100
          : 0,

      totalMissionsStarted: childrenStats.reduce(
        (sum, child) => sum + child.missionsStarted,
        0
      ),

      totalMissionsCompleted: childrenStats.reduce(
        (sum, child) => sum + child.missionsCompleted,
        0
      ),

      averageCompletionRate:
        childrenStats.length > 0
          ? Math.round(
              (childrenStats.reduce(
                (sum, child) => sum + child.completionRate,
                0
              ) /
                childrenStats.length) *
                100
            ) / 100
          : 0,

      totalTimeSpent: childrenStats.reduce(
        (sum, child) => sum + child.totalTimeSpent,
        0
      ),

      averageTimePerChild:
        childrenStats.length > 0
          ? Math.round(
              childrenStats.reduce(
                (sum, child) => sum + child.totalTimeSpent,
                0
              ) /
                childrenStats.length /
                1000
            )
          : 0 // Convert to seconds
    }

    return {
      totalChildren: children.length,
      childrenStats,
      overallStats
    }
  } catch (error) {
    console.error('Error fetching children mission progress stats:', error)
    throw error
  }
}

/**
 * Get detailed mission progress for a specific child
 * @param {string} parentId - The parent's user ID
 * @param {string} childId - The specific child's ID
 * @returns {Object} - Detailed progress for the child
 */
export async function getChildMissionProgressDetails(parentId, childId) {
  try {
    // Verify the child belongs to this parent
    const children = await getChildrenProfiles(parentId)
    const child = children.find((c) => c.childId === childId)

    if (!child) {
      throw new Error('Child not found or does not belong to this parent')
    }

    // Get all mission progress for this specific child
    const allMissionProgress = await getAllChildrenMissionsProgress()
    const childProgress = allMissionProgress.filter(
      (progress) => progress.childId === childId
    )

    // Group progress by mission ID for easier access
    const progressByMission = {}
    childProgress.forEach((progress) => {
      progressByMission[progress.missionId] = progress
    })

    // Define all available missions (should match the missions list from components)
    const allMissions = [
      { id: 1, title: 'Cyberbullying' },
      { id: 2, title: 'IP Addresses & Digital Footprints' },
      { id: 3, title: 'Online Scams & Password Protection' },
      { id: 4, title: 'Personal Information & Identity Theft' },
      { id: 5, title: 'Artificial Intelligence & Deepfakes' },
      { id: 6, title: 'Extortion' },
      { id: 7, title: 'Cat fishing & Fake Profiles' },
      { id: 8, title: 'Grooming' },
      { id: 9, title: 'Online Predators' },
      { id: 10, title: 'Social Engineering' }
    ]

    // Create detailed mission status
    const missionDetails = allMissions.map((mission) => {
      const progress = progressByMission[mission.id]

      return {
        missionId: mission.id,
        title: mission.title,
        status: progress
          ? progress.isComplete
            ? 'completed'
            : 'in_progress'
          : 'not_started',
        progress: progress?.progress || 0,
        attemptCount: progress?.attemptCount || 0,
        totalTimeSpent: progress?.totalTimeSpent || 0,
        lastAttempt: progress?.lastAttemptStartTime?.toDate?.() || null,
        updatedAt: progress?.updatedAt?.toDate?.() || null
      }
    })

    return {
      child: {
        childId: child.childId,
        firstName: child.firstName,
        lastName: child.lastName
      },
      missionDetails,
      summary: {
        totalMissions: allMissions.length,
        missionsStarted: childProgress.length,
        missionsCompleted: childProgress.filter((p) => p.isComplete).length,
        totalTimeSpent: childProgress.reduce(
          (sum, p) => sum + (p.totalTimeSpent || 0),
          0
        ),
        averageProgress:
          childProgress.length > 0
            ? childProgress.reduce((sum, p) => sum + (p.progress || 0), 0) /
              childProgress.length
            : 0
      }
    }
  } catch (error) {
    console.error('Error fetching child mission progress details:', error)
    throw error
  }
}

export async function getChildProfile(parentId, childId) {
  const children = await getChildrenProfiles(parentId)
  const child = children.find((c) => c.childId === childId)
  return child
}
