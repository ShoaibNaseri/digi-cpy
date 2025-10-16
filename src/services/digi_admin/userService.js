import { db, auth } from '@/firebase/config'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore'
import { createLog } from '../logService'
import { encryptFields, decryptFields } from '../encryptionService'

// Allowed roles (excluding ADMIN)
export const USER_ROLES = {
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT'
}

export const validateSchoolExists = async (schoolId) => {
  try {
    if (!schoolId) return false
    const schoolRef = doc(db, 'schools', schoolId)
    const docSnap = await getDoc(schoolRef)
    return docSnap.exists()
  } catch (error) {
    console.error('Error validating school:', error)
    return false
  }
}

export const validateMultipleSchools = async (schoolIds) => {
  try {
    const uniqueSchoolIds = [...new Set(schoolIds.filter((id) => id))]
    const validationPromises = uniqueSchoolIds.map(async (schoolId) => {
      const exists = await validateSchoolExists(schoolId)
      return { schoolId, exists }
    })

    const validationResults = await Promise.all(validationPromises)
    const validationMap = {}

    validationResults.forEach(({ schoolId, exists }) => {
      validationMap[schoolId] = exists
    })

    return validationMap
  } catch (error) {
    console.error('Error validating multiple schools:', error)
    return {}
  }
}

export const getSchoolDetails = async (schoolId) => {
  try {
    if (!schoolId) return null
    const schoolRef = doc(db, 'schools', schoolId)
    const docSnap = await getDoc(schoolRef)
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...decryptFields(docSnap.data())
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching school details:', error)
    return null
  }
}

export const getMultipleSchoolDetails = async (schoolIds) => {
  try {
    const uniqueSchoolIds = [...new Set(schoolIds.filter((id) => id))]
    const schoolPromises = uniqueSchoolIds.map(async (schoolId) => {
      const schoolData = await getSchoolDetails(schoolId)
      return { schoolId, schoolData }
    })

    const schoolResults = await Promise.all(schoolPromises)
    const schoolMap = {}

    schoolResults.forEach(({ schoolId, schoolData }) => {
      schoolMap[schoolId] = schoolData
    })

    return schoolMap
  } catch (error) {
    console.error('Error fetching multiple school details:', error)
    return {}
  }
}

export const getAllUsers = async (
  searchQuery = '',
  roleFilter = '',
  sortField = 'createdAt',
  sortDirection = 'desc'
) => {
  try {
    const usersRef = collection(db, 'users')
    let q = query(usersRef, orderBy(sortField, sortDirection))

    const querySnapshot = await getDocs(q)
    let users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.id,
      ...decryptFields(doc.data())
    }))

    // Exclude ADMIN users
    users = users.filter((user) => user.role !== 'ADMIN')

    // Get all unique school IDs and fetch their details
    const schoolIds = users.map((user) => user.schoolId).filter((id) => id)
    const schoolDetails = await getMultipleSchoolDetails(schoolIds)

    // Add school details to each user
    users = users.map((user) => ({
      ...user,
      schoolData: user.schoolId ? schoolDetails[user.schoolId] : null,
      schoolExists: user.schoolId ? !!schoolDetails[user.schoolId] : null
    }))

    // Filter by role if specified
    if (roleFilter && roleFilter !== 'ALL') {
      users = users.filter((user) => user.role === roleFilter)
    }

    // Filter users based on search query if provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      users = users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.role?.toLowerCase().includes(searchLower) ||
          user.schoolId?.toLowerCase().includes(searchLower) ||
          user.schoolData?.schoolName?.toLowerCase().includes(searchLower)
      )
    }

    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export const getPaginatedUsers = async (
  allUsers,
  currentPage = 1,
  pageSize = 8
) => {
  try {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedUsers = allUsers.slice(startIndex, endIndex)

    const totalPages = Math.ceil(allUsers.length / pageSize)

    return {
      users: paginatedUsers,
      totalUsers: allUsers.length,
      totalPages,
      currentPage,
      pageSize,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  } catch (error) {
    console.error('Error paginating users:', error)
    throw error
  }
}

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        uid: docSnap.id,
        ...decryptFields(docSnap.data())
      }
    } else {
      throw new Error('User not found')
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export const addUser = async (userData) => {
  try {
    const usersRef = collection(db, 'users')
    const docRef = await addDoc(usersRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'ACTIVE'
    })

    await createLog({
      userId: auth.currentUser?.uid || 'system',
      collectionName: 'users',
      data: userData,
      schoolId: userData.schoolId,
      action: 'ADD_USER'
    })

    return docRef.id
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...encryptFields(userData),
      updatedAt: serverTimestamp()
    })

    await createLog({
      userId: auth.currentUser?.uid || 'system',
      collectionName: 'users',
      data: userData,
      schoolId: userData.schoolId,
      action: 'UPDATE_USER'
    })

    return true
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    await deleteDoc(userRef)

    await createLog({
      userId: auth.currentUser?.uid || 'system',
      collectionName: 'users',
      data: { userId },
      schoolId: null,
      action: 'DELETE_USER'
    })

    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export const getUserStats = async () => {
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))

    // Exclude ADMIN users
    const filteredUsers = users.filter((user) => user.role !== 'ADMIN')

    const totalUsers = filteredUsers.length
    const activeUsers = filteredUsers.filter(
      (user) => user.status === 'ACTIVE'
    ).length
    const inactiveUsers = filteredUsers.filter(
      (user) => user.status === 'INACTIVE'
    ).length

    // Calculate users by role
    const roleStats = filteredUsers.reduce((acc, user) => {
      const role = user.role || 'Unknown'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})

    // Calculate users by status
    const statusStats = filteredUsers.reduce((acc, user) => {
      const status = user.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleStats,
      statusStats
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw error
  }
}

export const getUsersByRole = async (role) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', role))
    const querySnapshot = await getDocs(q)

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.id,
      ...decryptFields(doc.data())
    }))

    return users
  } catch (error) {
    console.error(`Error fetching ${role} users:`, error)
    throw error
  }
}

export const searchUsers = async (searchTerm, roleFilter = '') => {
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)
    let users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.id,
      ...decryptFields(doc.data())
    }))

    // Exclude ADMIN users
    users = users.filter((user) => user.role !== 'ADMIN')

    // Filter by role if specified
    if (roleFilter && roleFilter !== 'ALL') {
      users = users.filter((user) => user.role === roleFilter)
    }

    const searchLower = searchTerm.toLowerCase()
    const filteredUsers = users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
    )

    return filteredUsers
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}
