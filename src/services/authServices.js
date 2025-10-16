import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { auth, db } from '@/firebase/config'
import {
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { createLog } from './logService'
import { trackUserLogin } from '@/utils/loginTracker'
import { ROLES } from '@/config/roles'
import { encryptFields, decryptFields } from './encryptionService'

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(username) {
  const usernameQuery = query(
    collection(db, 'usernames'),
    where('username', '==', username.toLowerCase())
  )
  const querySnapshot = await getDocs(usernameQuery)
  return querySnapshot.empty
}

/**
 * Store username mapping
 */
export async function storeUsernameMapping(username, email, uid) {
  await setDoc(doc(db, 'usernames', uid), {
    username: username.toLowerCase(),
    email: email,
    uid: uid,
    createdAt: serverTimestamp()
  })
}

/**
 * Get email by username
 */
export async function getEmailByUsername(username) {
  const usernameQuery = query(
    collection(db, 'usernames'),
    where('username', '==', username.toLowerCase())
  )
  const querySnapshot = await getDocs(usernameQuery)

  if (querySnapshot.empty) {
    throw new Error('Username not found')
  }

  const doc = querySnapshot.docs[0]
  return doc.data().email
}

/**
 * Sign up (Create a new user)
 */
export async function signUp(email, password, role) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  const userData = {
    email: email,
    role: role,
    createdAt: serverTimestamp(),
    hasSubscription: false,
    lastDateOfConsent: role === ROLES.PARENT ? serverTimestamp() : null
  }

  const encryptedData = encryptFields(userData)
  await setDoc(doc(db, 'users', userCredential.user.uid), encryptedData)

  return userCredential
}

export async function schoolTeacherSignUp(
  email,
  password,
  firstName,
  lastName,
  schoolId,
  uid,
  country,
  region,
  phone
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  const userData = {
    email: email,
    role: 'TEACHER',
    createdAt: serverTimestamp(),
    firstName,
    lastName,
    schoolId,
    status: 'ACCEPTED',
    country,
    region,
    phone
  }

  const encryptedData = encryptFields(userData)
  await setDoc(doc(db, 'users', userCredential.user.uid), encryptedData)

  await createLog({
    userId: userCredential.user.uid,
    collectionName: 'users',
    data: userData,
    schoolId: schoolId,
    action: 'CREATE_TEACHER'
  })

  await deleteDoc(doc(db, 'users', uid))

  return userCredential
}

export async function schoolAdminSignUp(email, password, firstName, lastName) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  const userData = {
    email: email,
    role: 'SCHOOL_ADMIN',
    createdAt: serverTimestamp(),
    firstName,
    lastName,
    isSchoolOnboarded: false,
    status: 'ACCEPTED'
  }

  const encryptedData = encryptFields(userData)
  await setDoc(doc(db, 'users', userCredential.user.uid), encryptedData)

  await createLog({
    userId: userCredential.user.uid,
    collectionName: 'users',
    data: userData,
    schoolId: 'system',
    action: 'CREATE_SCHOOL_ADMIN'
  })

  return userCredential
}

export async function schoolStudentSignUp(
  email,
  password,
  firstName,
  lastName,
  schoolId,
  studentId,
  classId,
  docId,
  country,
  region,
  username = null
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  const userData = {
    email: email,
    role: 'STUDENT',
    createdAt: serverTimestamp(),
    firstName,
    lastName,
    schoolId,
    studentId,
    classId,
    docId,
    status: 'ACCEPTED',
    country,
    region,
    username: username
  }

  const encryptedData = encryptFields(userData)
  await setDoc(doc(db, 'users', userCredential.user.uid), encryptedData)

  // Store username mapping if provided
  if (username) {
    await storeUsernameMapping(username, email, userCredential.user.uid)
  }

  await createLog({
    userId: userCredential.user.uid,
    collectionName: 'users',
    data: userData,
    schoolId: schoolId,
    action: 'CREATE_STUDENT'
  })

  if (docId) {
    await deleteDoc(doc(db, 'users', docId))
  }

  return userCredential
}

/**
 * Sign in (Login) an existing user with username or email
 */
export async function signIn(identifier, password) {
  let email = identifier

  // Check if identifier is a username (not an email)
  if (!identifier.includes('@')) {
    try {
      email = await getEmailByUsername(identifier)
    } catch (error) {
      throw new Error('Invalid username or password')
    }
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  await trackUserLogin(userCredential.user.uid)
  return userCredential
}

/**
 * Log out (Logout) the current user
 */
export async function logOut() {
  return await signOut(auth)
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  await trackUserLogin(result.user.uid)

  const userDoc = await getDoc(doc(db, 'users', result.user.uid))

  if (!userDoc.exists()) {
    const userData = {
      email: result.user.email,
      role: 'STUDENT',
      createdAt: serverTimestamp(),
      firstName: result.user.displayName?.split(' ')[0] || '',
      lastName: result.user.displayName?.split(' ')[1] || '',
      photoURL: result.user.photoURL
    }

    const encryptedData = encryptFields(userData)
    await setDoc(doc(db, 'users', result.user.uid), encryptedData)
  }

  return result
}

export async function signInWithApple() {
  const provider = new OAuthProvider('apple.com')
  const result = await signInWithPopup(auth, provider)
  await trackUserLogin(result.user.uid)

  const userDoc = await getDoc(doc(db, 'users', result.user.uid))

  if (!userDoc.exists()) {
    const userData = {
      email: result.user.email,
      role: 'STUDENT',
      createdAt: serverTimestamp(),
      firstName: result.user.displayName?.split(' ')[0] || '',
      lastName: result.user.displayName?.split(' ')[1] || '',
      photoURL: result.user.photoURL
    }

    const encryptedData = encryptFields(userData)
    await setDoc(doc(db, 'users', result.user.uid), encryptedData)
  }

  return result
}

export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider()
  const result = await signInWithPopup(auth, provider)
  await trackUserLogin(result.user.uid)

  const userDoc = await getDoc(doc(db, 'users', result.user.uid))

  if (!userDoc.exists()) {
    const userData = {
      email: result.user.email,
      role: 'STUDENT',
      createdAt: serverTimestamp(),
      firstName: result.user.displayName?.split(' ')[0] || '',
      lastName: result.user.displayName?.split(' ')[1] || '',
      photoURL: result.user.photoURL
    }

    const encryptedData = encryptFields(userData)
    await setDoc(doc(db, 'users', result.user.uid), encryptedData)
  }

  return result
}

export async function resetPassword(email) {
  return await sendPasswordResetEmail(auth, email)
}

/**
 * Change password for the current user
 */
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser

  if (!user) {
    throw new Error('No user is currently signed in')
  }

  // Create credential with current password
  const credential = EmailAuthProvider.credential(user.email, currentPassword)

  // Reauthenticate user
  await reauthenticateWithCredential(user, credential)

  // Update password
  await updatePassword(user, newPassword)

  return { success: true }
}
