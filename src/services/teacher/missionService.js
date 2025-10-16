import { db } from '@/firebase/config'
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import { getTeacherClassroom } from '@/services/teacherService'

// Mission number mapping
export const missionNumberMap = {
  Cyberbullying: 1,
  'Artificial Intelligence & Deepfakes': 12,
  'IP Addresses & Digital Footprints': 2,
  'Passwords & Device Safety': 3,
  'Personal & Private Information': 4,
  'Identity Theft & Phishing': 5,
  'Online Scams': 6,
  Malware: 7,
  'Catfishing & Fake Profiles': 8,
  'Grooming & Online Predators': 9,
  'Social Engineering': 10,
  Extortion: 11
}

/**
 * Fetch teacher classes and missions based on filter criteria
 * @param {string} userId - Current user ID
 * @param {string} schoolId - School ID
 * @param {string} selectedClass - Selected class filter
 * @param {string} selectedMenu - Selected mission type filter
 * @returns {Object} - Teacher classes and grouped missions
 */
export const fetchMissionsAndClasses = async (
  userId,
  schoolId,
  selectedClass,
  selectedMenu
) => {
  try {
    // First, fetch all classes using teacherService
    const teacherClasses = await getTeacherClassroom(userId, schoolId)

    // Create a map of classId to class details
    const classMap = {}
    teacherClasses.forEach((classData) => {
      classMap[classData.classId] = {
        id: classData.classId,
        title:
          classData.className && classData.grade
            ? `${classData.className} - Grade ${classData.grade}`
            : classData.className || classData.title || 'Unnamed Class',
        grade: classData.grade || '',
        className: classData.className || '',
        missions: []
      }
    })

    // Reference to the missions collection
    const missionsRef = collection(db, 'missions')

    // Create a base query ordered by due date
    let missionsQuery = query(
      missionsRef,
      where('createdBy', '==', userId),
      where('schoolId', '==', schoolId),
      orderBy('dueDate')
    )

    // If we're filtering by class/grade (not "All Grades"), add a where clause
    if (selectedClass !== 'All Grades') {
      const selectedGradeNum = selectedClass.replace('Grade ', '')
      missionsQuery = query(
        missionsRef,
        where('createdBy', '==', userId),
        where('schoolId', '==', schoolId),
        where('grade', '==', selectedGradeNum),
        orderBy('dueDate')
      )
    }

    const querySnapshot = await getDocs(missionsQuery)

    // Convert the documents to mission objects
    const missions = []
    let missionCounter = 1

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      let missionDisplayTitle = data.missionName || 'Untitled Mission'

      missions.push({
        id: doc.id,
        missionNumber: missionCounter++,
        missionName: data.missionName || 'Untitled Mission',
        grade: data.grade || '',
        className: data.className || '',
        classTitle: data.classTitle || '',
        displayTitle: missionDisplayTitle,
        dueDate: data.dueDate ? data.dueDate.toDate() : new Date(),
        classIds: data.classIds || [],
        classes: data.classes || []
      })
    })

    // If we're filtering by mission type (not "All Missions"), apply the filter
    let filteredMissions = missions
    if (selectedMenu !== 'All Missions') {
      filteredMissions = missions.filter(
        (mission) => mission.missionName === selectedMenu
      )
    }

    // Group missions by class
    const groupedMissions = {}

    // First, try to group by class if available - using the exact class names from Firebase
    filteredMissions.forEach((mission) => {
      let addedToClass = false

      // Try to add to a specific class first
      if (mission.classIds && mission.classIds.length > 0) {
        mission.classIds.forEach((classId) => {
          if (classMap[classId]) {
            if (!groupedMissions[classId]) {
              groupedMissions[classId] = {
                ...classMap[classId],
                missions: []
              }
            }
            groupedMissions[classId].missions.push(mission)
            addedToClass = true
          }
        })
      }

      // If not added to a specific class, group by grade
      if (!addedToClass && mission.grade) {
        const gradeKey = `grade-${mission.grade}`

        // Try to find if there's an existing class with this grade
        const matchingClasses = Object.values(classMap).filter(
          (cls) => cls.grade === mission.grade
        )

        if (matchingClasses.length > 0) {
          // Use the first matching class
          const matchingClass = matchingClasses[0]
          if (!groupedMissions[matchingClass.id]) {
            groupedMissions[matchingClass.id] = {
              ...matchingClass,
              missions: []
            }
          }
          groupedMissions[matchingClass.id].missions.push(mission)
        } else {
          // If no matching class, create a fallback based on grade
          if (!groupedMissions[gradeKey]) {
            groupedMissions[gradeKey] = {
              id: gradeKey,
              title: `Grade ${mission.grade}`,
              grade: mission.grade,
              missions: []
            }
          }
          groupedMissions[gradeKey].missions.push(mission)
        }
      }

      // If no grade either, add to "Unassigned" group
      if (!addedToClass && !mission.grade) {
        if (!groupedMissions['unassigned']) {
          groupedMissions['unassigned'] = {
            id: 'unassigned',
            title: 'Unassigned',
            grade: '',
            missions: []
          }
        }
        groupedMissions['unassigned'].missions.push(mission)
      }
    })

    // Sort groups by grade number first, then by title
    const sortedGroupedMissions = {}
    Object.keys(groupedMissions)
      .sort((a, b) => {
        const gradeA = groupedMissions[a].grade
          ? parseInt(groupedMissions[a].grade)
          : 999
        const gradeB = groupedMissions[b].grade
          ? parseInt(groupedMissions[b].grade)
          : 999

        if (gradeA !== gradeB) {
          return gradeA - gradeB
        }

        return groupedMissions[a].title.localeCompare(groupedMissions[b].title)
      })
      .forEach((key) => {
        sortedGroupedMissions[key] = groupedMissions[key]
        // Sort missions by date within each class
        sortedGroupedMissions[key].missions.sort(
          (a, b) => a.dueDate - b.dueDate
        )
      })

    return {
      teacherClasses,
      assignedMissions: filteredMissions,
      missionsByClass: sortedGroupedMissions
    }
  } catch (error) {
    console.error('Error fetching missions:', error)
    throw error
  }
}

/**
 * Delete a mission from Firebase
 * @param {string} missionId - ID of the mission to delete
 * @param {string} userId - Current user ID
 * @returns {Promise<void>}
 */
export const deleteMission = async (missionId, userId) => {
  try {
    // Reference to the specific mission document
    const missionDocRef = doc(db, 'users', userId, 'missions', missionId)

    // Delete the document from Firestore
    await deleteDoc(missionDocRef)

    return true
  } catch (error) {
    console.error('Error deleting mission:', error)
    throw error
  }
}

/**
 * Update a mission in Firebase
 * @param {Object} updatedMission - Updated mission data
 * @returns {Promise<void>}
 */
export const updateMission = async (updatedMission) => {
  try {
    // Reference to the specific mission document
    const missionDocRef = doc(db, 'missions', updatedMission.id)

    // Prepare the update data
    const updateData = {
      dueDate: updatedMission.dueDate,
      classTitle: updatedMission.classTitle,
      classIds: updatedMission.classIds
    }

    // Update the document in Firestore
    await updateDoc(missionDocRef, updateData)

    return true
  } catch (error) {
    console.error('Error updating mission:', error)
    throw error
  }
}
