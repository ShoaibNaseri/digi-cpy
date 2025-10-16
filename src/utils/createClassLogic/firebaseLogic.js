// utils/createClassLogic/firebaseLogic.js
// This file now imports seat management functionality from the dedicated service
// and re-exports them to maintain backward compatibility

// Import seat management functionality from the new service
import {
  updateSchoolAvailableSeats,
  checkSchoolHasEnoughSeats,
  updateSchoolSeatUsage
} from '@/services/seatsManageService'

// Re-export seat management functions
export {
  updateSchoolAvailableSeats,
  checkSchoolHasEnoughSeats,
  updateSchoolSeatUsage
}

// Import necessary Firebase functions
import { createMission } from '@/services/missionService'
import { createClass, updateClass } from '@/services/classService'
import { addStudent } from '@/services/teacherService'

/**
 * Save all missions to Firebase
 * @param {string} classId Class ID
 * @param {Array} scheduledMissions Scheduled missions
 * @param {Object} currentUser Current user
 * @param {Object} formData Form data
 * @returns {Promise<Array>} Mission references
 */
export const saveMissionsToFirebase = async (
  classId,
  scheduledMissions,
  currentUser,
  formData
) => {
  try {
    if (!currentUser || !classId) {
      throw new Error('No user is signed in or invalid class ID')
    }

    // Ensure currentUser has a valid schoolId
    if (!currentUser.schoolId) {
      console.warn(
        'Warning: currentUser missing schoolId in saveMissionsToFirebase'
      )
      currentUser.schoolId = '' // Use the value you see in Firebase
    }

    const classTitle = formData.grade
      ? `${formData.className} - Grade ${formData.grade}`
      : formData.className

    // Array to store mission references
    const missionRefs = []

    // Create each mission as a separate document
    for (const mission of scheduledMissions) {
      // Prepare mission data for Firestore
      const missionToSave = {
        createdBy: currentUser.uid,
        schoolId: currentUser.schoolId,
        classId: classId,
        missionName: mission.missionName,
        grade: formData.grade,
        className: formData.className,
        classTitle: classTitle,
        dueDate: mission.dueDate,
        scheduleTime: mission.scheduleTime,
        classIds: classId ? [classId] : [],
        createdAt: new Date(),
        updatedAt: new Date(),
        seatType: 'unified', // Use unified seat type
        canShow: true
      }

      // Add the mission to Firestore
      const missionDocRef = await createMission(missionToSave)

      // Store mission reference for later class update
      missionRefs.push({
        id: missionDocRef.id,
        name: mission.missionName,
        dueDate: mission.dueDate
      })
    }

    // Add valid schoolId when updating the class
    const updateData = {
      assignmentsPending: missionRefs.length,
      missions: missionRefs,
      schoolId: currentUser.schoolId
    }

    // Update the class with mission references
    await updateClass(updateData, classId)

    return missionRefs
  } catch (error) {
    console.error('Error saving missions:', error)
    throw error
  }
}

/**
 * Save a single class to Firebase
 * @param {Object} classData Class data
 * @param {Object} currentUser Current user
 * @returns {Promise<string>} Created class ID
 */
export const saveClassToFirebase = async (classData, currentUser) => {
  if (!currentUser) {
    throw new Error('No user is signed in')
  }

  // Ensure currentUser has a valid schoolId
  if (!currentUser.schoolId) {
    console.warn('Warning: currentUser missing schoolId in saveClassToFirebase')
    currentUser.schoolId = '' // Use the value you see in Firebase
  }

  // Create a new document in the classes collection for this user
  const classToSave = {
    createdBy: currentUser.uid,
    schoolId: currentUser.schoolId,

    // Individual fields that can be accessed and updated separately
    className: classData.className || 'New Class',
    grade: classData.grade || '',
    title: classData.title || classData.className || 'New Class',
    nextClass: classData.nextClass || 'TBD',
    unit: classData.unit || '',
    description:
      classData.description ||
      `Class created on ${new Date().toLocaleDateString()}`,
    students: classData.students || [],

    // Additional fields stored separately
    numberOfStudents: classData.numberOfStudents || '0',
    classDays: classData.classDays || {},
    classDaysFormatted: classData.classDaysFormatted || '',
    frequency: classData.frequency || 'weekly',
    enableAIChatroom: classData.enableAIChatroom || false,

    // Dates stored separately
    startDate: classData.startDate || '',
    formattedStartDate: classData.formattedStartDate || '',

    // Mission information
    selectedMission: 'All 12 Missions',
    scheduleTime: classData.scheduleTime || '',

    // Seat type field - using unified seat type
    seatType: 'unified',

    // Metadata
    createdAt: new Date(),
    assignmentsPending: 0,
    classSessions: classData.classSessions || [],
    missions: [],
    canShow: true
  }

  // Add the document to Firestore
  const docRef = await createClass(classToSave)

  return docRef.id
}

/**
 * Send email notifications to students
 * @param {Array} students Students array
 * @param {string} classId Class ID
 * @param {Object} currentUser Current user
 * @returns {Promise<boolean>} Success status
 */
export const sendStudentEmailNotifications = async (
  students,
  classId,
  currentUser
) => {
  try {
    if (!students || students.length === 0) {
      return false
    }

    // Count successfully added students
    let successCount = 0

    // Process all students
    for (const student of students) {
      try {
        // Ensure necessary fields exist, provide default values
        const studentData = {
          firstName: student.firstName || 'Unknown',
          lastName: student.lastName || '',
          email: student.email || '',
          studentId:
            student.studentId ||
            student.id ||
            `generated-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          classId: classId,
          schoolId: currentUser.schoolId,
          seatType: 'unified' // Use unified seat type
        }

        // Add student to database
        await addStudent(studentData)
        successCount++
      } catch (studentError) {
        console.error(
          'Error processing individual student:',
          studentError,
          student
        )
        // Continue processing other students
      }
    }

    return successCount > 0
  } catch (error) {
    console.error('Error in sendStudentEmailNotifications:', error)
    return false
  }
}
