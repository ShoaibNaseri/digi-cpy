import { saveUserNotification } from './notificationService'
import { db } from '@/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { decryptFields } from './encryptionService'

/**
 * Create student achievement notification
 * @param {string} userId - Student ID
 * @param {string} achievement - Achievement name
 * @param {string} description - Achievement description
 */
export const createStudentAchievementNotification = async (
  userId,
  achievement,
  description
) => {
  const notification = {
    title: `Achievement Unlocked: ${achievement}`,
    message: description,
    type: 'success',
    action: 'view_achievements'
  }

  await saveUserNotification(userId, notification)
}

export const createSchoolNotificationOnStudentUpdate = async (
  schoolId,
  studentName
) => {
  const notification = {
    title: `Student Updated: ${studentName}`,
    message: `A student has been updated in your school.`,
    type: 'info',
    action: 'view_students'
  }

  const getUserIdBasedOnSchoolId = async (schoolId) => {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('role', '==', 'SCHOOL_ADMIN'),
      where('schoolId', '==', schoolId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.id)
  }

  const userIds = await getUserIdBasedOnSchoolId(schoolId)
  console.log('School Admin User IDs:', userIds)
  console.log('Notification:', notification)

  if (userIds.length === 0) {
    console.warn(`No school admin found for school ID: ${schoolId}`)
    return
  }

  // Send notification to all school admins
  const notificationPromises = userIds.map((userId) =>
    saveUserNotification(userId, notification)
  )

  await Promise.all(notificationPromises)
  console.log(`Notification sent to ${userIds.length} school admin(s)`)
}

/**
 * Create student mission completion notification
 * @param {string} userId - Student ID
 * @param {string} missionName - Mission name
 * @param {number} score - Mission score
 */
export const createMissionCompletionNotification = async (
  userId,
  missionName
) => {
  const notification = {
    title: `Mission Completed: ${missionName}`,
    message: `Great job! You completed the mission now you can go to the next mission.`,
    type: 'success',
    action: 'view_missions'
  }

  await saveUserNotification(userId, notification)
}

/**
 * Create student progress milestone notification
 * @param {string} userId - Student ID
 * @param {string} milestone - Milestone description
 */
export const createProgressMilestoneNotification = async (
  userId,
  milestone
) => {
  const notification = {
    title: 'Progress Milestone Reached!',
    message: milestone,
    type: 'info',
    action: 'view_progress'
  }

  await saveUserNotification(userId, notification)
}

/**
 * Create student reminder notification
 * @param {string} userId - Student ID
 * @param {string} reminder - Reminder message
 */
export const createStudentReminderNotification = async (userId, reminder) => {
  const notification = {
    title: 'Reminder',
    message: reminder,
    type: 'info',
    action: null
  }

  await saveUserNotification(userId, notification)
}

export const createWelcomeNotification = async (userId, userName) => {
  const notification = {
    title: 'Welcome to the app!',
    message: `Thank you for joining our app ${userName}. We hope you enjoy it!`,
    type: 'info',
    action: null
  }

  await saveUserNotification(userId, notification)
}

export const createStudentAccountCreationNotificationForTeacher = async (
  teacherId,
  studentName
) => {
  const notification = {
    title: 'Invitation Accepted',
    message: `A new student account has been created for ${studentName}.`,
    type: 'info',
    action: null
  }

  await saveUserNotification(teacherId, notification)
}
