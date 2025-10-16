import { db, auth } from '@/firebase/config'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { createLog } from './logService'
import { encryptFields, decryptFields } from './encryptionService'

export const updateUser = async (uid, data) => {
  const userRef = doc(db, 'users', uid)
  const updateData = { ...data }

  if ('email' in data) {
    console.log('Processing email update:', {
      newEmail: data.email,
      pendingEmail: data.pendingEmail
    })
    updateData.email = data.email
    updateData.pendingEmail = data.pendingEmail
  }

  const encryptedData = encryptFields(updateData)

  await updateDoc(userRef, encryptedData)

  const updatedUserData = await getUserByUid(uid)

  await createLog({
    userId: auth.currentUser.uid,
    collectionName: 'users',
    data: data,
    schoolId: updatedUserData.schoolId ?? null,
    action: 'UPDATE_USER'
  })

  return updatedUserData
}

export const getUserByUid = async (uid) => {
  const userRef = doc(db, 'users', uid)
  const docSnap = await getDoc(userRef)
  const userData = docSnap.data()
  const decryptedData = decryptFields(userData)
  return decryptedData
}

export const getTrustedAdults = async (uid) => {
  const userRef = doc(db, 'trustedAdults', uid)
  const docSnap = await getDoc(userRef)
  return docSnap.data()
}

export const getUserSchool = async (schoolId) => {
  const schoolRef = doc(db, 'schools', schoolId)
  const docSnap = await getDoc(schoolRef)
  const decryptedData = decryptFields(docSnap.data())
  return decryptedData
}

/**
 * Downloads all user data by searching collections using three query strategies:
 * 1. Direct document ID queries (using userId as the document ID)
 * 2. Field queries (where collections contain fields like userId, studentId)
 * 3. Relationship queries (using IDs from user data like schoolId, classId)
 *
 * The function retrieves: user profile, trusted adults, school data,
 * payment history, student quizzes, messages, class info, incident reports,
 * and activity logs - all organized into a structured JSON object.
 *
 * Security measures are implemented to protect sensitive information and
 * ensure users only access data they are authorized to view.
 */
export const downloadUserData = async (userId) => {
  try {
    // Security check
    if (!userId || !auth.currentUser) {
      throw new Error('Unable to download data: User not authenticated')
    }

    // Verify the requesting user matches the requested data
    if (auth.currentUser.uid !== userId) {
      throw new Error('You can only download your own data')
    }

    // Use existing function to get user data
    let userData = null
    try {
      userData = await getUserByUid(userId)
      if (!userData) {
        throw new Error('User data not found')
      }
    } catch (error) {
      console.error('Error getting user data:', error)
      throw new Error('Failed to retrieve user data')
    }

    // Get trusted adults data (might not exist)
    let trustedAdultsData = null
    try {
      trustedAdultsData = await getTrustedAdults(userId)
    } catch (error) {
      console.log('No trusted adults data found')
    }

    // Get school data (if exists) - sanitized
    let schoolData = null
    if (userData.schoolId) {
      try {
        const rawSchoolData = await getUserSchool(userData.schoolId)
        if (rawSchoolData) {
          // Sanitize school data to remove sensitive information
          schoolData = {
            id: userData.schoolId,
            name: rawSchoolData.name,
            address: rawSchoolData.address,
            contact: rawSchoolData.contact,
            // Remove administrative details and other sensitive fields
            admins: undefined,
            apiKeys: undefined,
            billingInfo: undefined
          }
        }
      } catch (error) {
        console.log('No school data found')
      }
    }

    // Get payment history (if applicable)
    let paymentHistory = []
    if (userData.role === 'parent') {
      try {
        const paymentsRef = collection(db, 'payments')
        const q = query(paymentsRef, where('userId', '==', userId))
        const querySnapshot = await getDocs(q)

        querySnapshot.forEach((doc) => {
          const paymentData = doc.data()
          // Sanitize payment data to remove sensitive details
          paymentHistory.push({
            id: doc.id,
            amount: paymentData.amount,
            date: paymentData.date,
            status: paymentData.status,
            description: paymentData.description,
            // Remove payment method details
            paymentMethod: paymentData.paymentMethod
              ? {
                  type: paymentData.paymentMethod.type,
                  last4: paymentData.paymentMethod.last4
                }
              : undefined
          })
        })
      } catch (error) {
        console.log('No payment history found', error)
      }
    }

    // Get student quizzes data
    let studentQuizzes = []
    try {
      const studentQuizzesRef = collection(db, 'studentQuizzes')
      const q = query(studentQuizzesRef, where('studentId', '==', userId))
      const querySnapshot = await getDocs(q)

      querySnapshot.forEach((doc) => {
        const quizData = doc.data()
        // Sanitize quiz data to remove sensitive information
        studentQuizzes.push({
          id: doc.id,
          quizTitle: quizData.quizTitle,
          status: quizData.status,
          createdAt: quizData.createdAt,
          dueDate: quizData.dueDate,
          mission: quizData.mission,
          score: quizData.score,
          isExpired: quizData.isExpired,
          questions: quizData.questions,
          answers: quizData.answers,
          // Remove sensitive fields
          authorEmail: undefined,
          authorId: undefined
        })
      })
    } catch (error) {
      console.log('No student quizzes found', error)
    }

    // Get messages data - only those directly related to the user
    let messages = []
    try {
      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('participants', 'array-contains', userId)
      )
      const querySnapshot = await getDocs(q)

      querySnapshot.forEach((doc) => {
        const messageData = doc.data()
        messages.push({
          id: doc.id,
          content: messageData.content,
          timestamp: messageData.timestamp,
          subject: messageData.subject,
          isRead: messageData.isRead,
          // Include only necessary participant info
          sender: {
            id: messageData.sender.id,
            name: messageData.sender.name,
            role: messageData.sender.role
          },
          // Filter out detailed info about other participants
          recipients: messageData.recipients?.map((r) => ({
            id: r.id,
            name: r.name,
            role: r.role
          }))
        })
      })
    } catch (error) {
      console.log('No messages found', error)
    }

    // Get class data - sanitized to protect other students' information
    let classes = []
    if (userData.classId) {
      try {
        const classRef = doc(db, 'classes', userData.classId)
        const classSnap = await getDoc(classRef)

        if (classSnap.exists()) {
          const classData = classSnap.data()

          // Sanitize class data to protect privacy
          const sanitizedClassData = {
            id: classSnap.id,
            className: classData.className,
            title: classData.title,
            grade: classData.grade,
            description: classData.description,
            unit: classData.unit,
            nextClass: classData.nextClass,
            classDaysFormatted: classData.classDaysFormatted,
            startDate: classData.startDate,
            formattedStartDate: classData.formattedStartDate,

            // Filter to include only current user's information
            students: classData.students
              ? classData.students.filter(
                  (s) =>
                    s.studentId === userData.studentId ||
                    s.email === userData.email
                )
              : [],

            // Include only upcoming missions (next 3)
            missions: classData.missions ? classData.missions.slice(0, 3) : [],

            // Remove sensitive management information
            createdBy: undefined,
            enableAIChatroom: undefined
          }

          classes.push(sanitizedClassData)
        }
      } catch (error) {
        console.log('No class data found', error)
      }
    }

    // Get incident reports - only if they involve this user
    let incidentReports = []
    try {
      const reportsRef = collection(db, 'incidentReports')
      const q = query(reportsRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      querySnapshot.forEach((doc) => {
        const reportData = doc.data()
        // Sanitize report data to protect others' privacy
        incidentReports.push({
          id: doc.id,
          type: reportData.type,
          date: reportData.date,
          status: reportData.status,
          summary: reportData.summary,
          // Remove sensitive details about other users
          reportedBy:
            reportData.reportedBy === userId
              ? reportData.reportedBy
              : undefined,
          otherInvolved: undefined
        })
      })
    } catch (error) {
      console.log('No incident reports found', error)
    }

    // Get user activity logs - only user-relevant logs
    let logs = []
    try {
      const logsRef = collection(db, 'logs')
      const q = query(logsRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      querySnapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          action: doc.data().action,
          createdAt: doc.data().createdAt,
          collection: doc.data().collection,
          // Remove detailed data payload
          data: {}
        })
      })
    } catch (error) {
      console.log('No logs found', error)
    }

    // Combine all data
    const completeUserData = {
      personalInfo: {
        ...userData,
        // Remove sensitive information
        password: undefined,
        authToken: undefined
      },
      trustedAdults: trustedAdultsData,
      school: schoolData,
      paymentHistory: paymentHistory,
      // Additional data sections
      studentQuizzes: studentQuizzes,
      messages: messages,
      classes: classes,
      incidentReports: incidentReports,
      logs: logs,
      exportDate: new Date().toISOString()
    }

    // Log download activity
    try {
      await createLog({
        userId: auth.currentUser.uid,
        collectionName: 'users',
        action: 'DOWNLOAD_USER_DATA',
        schoolId: 'system', // Explicitly use 'system' to avoid schoolName being undefined
        data: {},
        visibility: 'all' // Mark this log as visible to all (admin and user)
      })
    } catch (error) {
      console.error('Error logging download activity:', error)
      // Continue execution, don't interrupt the download process
    }

    return completeUserData
  } catch (error) {
    console.error('Error downloading user data:', error)
    throw new Error('Failed to download user data: ' + error.message)
  }
}

export const deleteUserAccount = async (userId, password) => {
  try {
    if (!userId || !auth.currentUser) {
      throw new Error('Unable to delete account: User not authenticated')
    }

    if (auth.currentUser.uid !== userId) {
      throw new Error('You can only delete your own account')
    }
    const user = auth.currentUser

    if (!user.email) {
      throw new Error(
        'Unable to authenticate: No email associated with account'
      )
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)
    } catch (error) {
      console.error('Reauthentication failed:', error)
      throw new Error('Incorrect password or authentication failed')
    }

    let userData = null
    try {
      userData = await getUserByUid(userId)
      if (!userData) {
        throw new Error('User data not found')
      }
    } catch (error) {
      console.error('Error getting user data for deletion:', error)
      throw new Error('Failed to retrieve user data for deletion')
    }

    try {
      await createLog({
        userId: userId,
        collectionName: 'users',
        action: 'DELETE_USER_ACCOUNT',
        schoolId: 'system',
        data: {}
      })
    } catch (error) {
      console.error('Error logging account deletion:', error)
    }

    try {
      const trustedAdultsRef = doc(db, 'trustedAdults', userId)
      const trustedAdultsDoc = await getDoc(trustedAdultsRef)
      if (trustedAdultsDoc.exists()) {
        await deleteDoc(trustedAdultsRef)
      }
    } catch (error) {
      console.log('Error or no trusted adults data to delete:', error)
    }

    if (userData.role === 'parent') {
      try {
        const paymentsRef = collection(db, 'payments')
        const q = query(paymentsRef, where('userId', '==', userId))
        const querySnapshot = await getDocs(q)

        const deletePromises = []
        querySnapshot.forEach((document) => {
          deletePromises.push(deleteDoc(doc(db, 'payments', document.id)))
        })

        if (deletePromises.length > 0) {
          await Promise.all(deletePromises)
        }
      } catch (error) {
        console.log('Error deleting payment data:', error)
      }
    }

    try {
      const userRef = doc(db, 'users', userId)
      await deleteDoc(userRef)
    } catch (error) {
      console.error('Error deleting user document:', error)
      throw new Error('Failed to delete user document')
    }

    try {
      await deleteUser(user)
    } catch (error) {
      console.error('Error deleting auth account:', error)
      throw new Error(
        'User document deleted but failed to delete authentication account'
      )
    }

    return true
  } catch (error) {
    console.error('Error deleting account:', error)
    throw new Error(error.message || 'Failed to delete account')
  }
}

/**
 * Creates or updates a user profile document in Firestore
 * @param {string} userId - The user's UID
 * @param {Object} profileData - The profile data to save
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (userId, profileData) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const docSnapshot = await getDoc(userDocRef)

    const updatedData = {
      ...profileData,
      updatedAt: serverTimestamp()
    }

    const encryptedData = encryptFields(updatedData)

    if (!docSnapshot.exists()) {
      encryptedData.createdAt = serverTimestamp()
      await setDoc(userDocRef, encryptedData)
    } else {
      await updateDoc(userDocRef, encryptedData)
    }

    await createLog({
      userId: auth.currentUser.uid,
      collectionName: 'users',
      data: profileData,
      schoolId: profileData.schoolId ?? null,
      action: 'UPDATE_PROFILE'
    })
  } catch (error) {
    console.error('Error saving profile data:', error)
    throw new Error('Failed to save profile data')
  }
}

/**
 * Fetches a user's profile data from Firestore
 * @param {string} userId - The user's UID
 * @returns {Promise<Object>} The user's profile data
 */
export const fetchUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const docSnapshot = await getDoc(userDocRef)

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data()
      return decryptFields(userData)
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching profile data:', error)
    throw new Error('Failed to fetch profile data')
  }
}
