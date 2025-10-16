import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { getSchoolInfo } from './adminService'
import { getUserByUid } from './userService'

export const createLog = async ({
  userId,
  collectionName,
  data,
  schoolId,
  action
}) => {
  const logRef = doc(collection(db, 'logs'))
  const schoolInfo = await getSchoolInfo(schoolId)
  const userInfo = await getUserByUid(userId)

  const schoolName =
    userId === 'system' || schoolId === 'system'
      ? 'System'
      : schoolInfo
      ? schoolInfo.schoolName
      : 'Unknown'

  await setDoc(logRef, {
    collection: collectionName,
    data,
    schoolId,
    userId,
    schoolName,
    userName: userInfo ? userInfo.firstName + ' ' + userInfo.lastName : userId,
    action,
    createdAt: serverTimestamp()
  })
}

export const getLogs = async () => {
  try {
    const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error fetching logs:', error)
    return []
  }
}
