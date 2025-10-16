import { db } from '@/firebase/config'
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'

export const getTeacherMissions = async (userId, schoolId) => {
  const missionsRef = collection(db, 'missions')
  const q = query(
    missionsRef,
    where('createdBy', '==', userId),
    where('schoolId', '==', schoolId)
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ missionId: doc.id, ...doc.data() }))
}

export const createMission = async (missionToSave) => {
  const missionRef = await addDoc(collection(db, 'missions'), {
    ...missionToSave
  })

  return missionRef
}

export const saveMissionAssignment = async (userId, assignmentData) => {
  if (!userId) {
    throw new Error('No user ID provided')
  }

  // Convert dueDate string and scheduleTime to Date object
  const dueDateParts = assignmentData.dueDate.split('-')
  const timeParts = assignmentData.scheduleTime.split(':')

  const dueDateObj = new Date(
    parseInt(dueDateParts[0]), // year
    parseInt(dueDateParts[1]) - 1, // month (0-indexed)
    parseInt(dueDateParts[2]), // day
    parseInt(timeParts[0]), // hours
    parseInt(timeParts[1]) // minutes
  )

  // Create a reference to the missions collection for this user
  const missionsCollectionRef = collection(db, 'users', userId, 'missions')

  // Create mission documents for each grade
  const missionPromises = assignmentData.classes.map((classData) => {
    const missionData = {
      missionName: assignmentData.mission,
      grade: parseInt(classData.id[0]), // Extract grade from class ID (e.g., "1A" -> 1)
      dueDate: dueDateObj,
      scheduleTime: assignmentData.scheduleTime,
      classes: [classData],
      classIds: [classData.id],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    return addDoc(missionsCollectionRef, missionData)
  })

  // Wait for all missions to be added
  await Promise.all(missionPromises)
  return true
}
