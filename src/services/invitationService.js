import { jwtVerify, SignJWT } from 'jose'
import { sendEmail } from './emailService'
import { db } from '@/firebase/config'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key'
const INVITATION_EXPIRY = 7 * 24 * 60 * 60
const EMAIL_INVITATION_EXPIRY = 60 * 60 // 1 hour

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET)
}

export const generateInvitationToken = async (email, role, schoolId, uid) => {
  const payload = {
    email,
    role,
    schoolId,
    uid,
    type: 'invitation'
  }
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${INVITATION_EXPIRY}s`)
    .sign(getSecretKey())
  return jwt
}

export const generateEmailInvitationToken = async (
  email,
  sessionId,
  role = 'SCHOOL_ADMIN'
) => {
  const payload = {
    email,
    sessionId,
    role,
    type: 'email'
  }
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${EMAIL_INVITATION_EXPIRY}s`)
    .sign(getSecretKey())
  return jwt
}

export const generateStudentInvitationToken = async (
  firstName,
  lastName,
  email,
  schoolId,
  studentId,
  classId,
  docId
) => {
  const payload = {
    firstName,
    lastName,
    email,
    schoolId,
    studentId,
    classId,
    docId,
    type: 'studentInvitation'
  }
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${EMAIL_INVITATION_EXPIRY}s`)
    .sign(getSecretKey())
  return jwt
}

// Helper function to check if a class exists
const checkClassExists = async (classId) => {
  try {
    const classRef = doc(db, 'classes', classId)
    const classDoc = await getDoc(classRef)
    return classDoc.exists()
  } catch (error) {
    return false
  }
}

// Helper function to check if a token has been invalidated
const checkTokenInvalidation = async (token) => {
  try {
    const invalidatedTokenRef = doc(db, 'invalidatedTokens', token)
    const invalidatedTokenDoc = await getDoc(invalidatedTokenRef)
    return invalidatedTokenDoc.exists()
  } catch (error) {
    console.error('Error checking token invalidation:', error)
    return false
  }
}

// Helper function to invalidate a token
const invalidateToken = async (token) => {
  try {
    const invalidatedTokenRef = doc(db, 'invalidatedTokens', token)
    await setDoc(invalidatedTokenRef, {
      invalidatedAt: new Date(),
      type: 'invitation'
    })
  } catch (error) {
    console.error('Error invalidating token:', error)
    throw new Error('Failed to invalidate token')
  }
}

export const verifyInvitationToken = async (token) => {
  try {
    // First check if the token has been invalidated
    const isInvalidated = await checkTokenInvalidation(token)
    if (isInvalidated) {
      throw new Error('This invitation token has already been used')
    }

    const { payload } = await jwtVerify(token, getSecretKey())
    if (
      payload.type !== 'invitation' &&
      payload.type !== 'email' &&
      payload.type !== 'studentInvitation'
    ) {
      throw new Error('Invalid token type')
    }

    // For student invitation tokens, verify that the class still exists
    if (payload.type === 'studentInvitation' && payload.classId) {
      const classExists = await checkClassExists(payload.classId)
      if (!classExists) {
        throw new Error(
          'This invitation is no longer valid because the class has been deleted'
        )
      }
    }

    return payload
  } catch (error) {
    const errorMessage = error.message.includes('class has been deleted')
      ? error.message
      : error.message.includes('already been used')
      ? error.message
      : 'Invalid or expired invitation token'
    throw new Error(errorMessage)
  }
}

// Function to invalidate invitation token after successful registration
export const invalidateInvitationToken = async (token) => {
  try {
    await invalidateToken(token)
    return true
  } catch (error) {
    console.error('Error invalidating invitation token:', error)
    throw error
  }
}

// Function to clean up old invalidated tokens (can be run periodically)
export const cleanupInvalidatedTokens = async (daysOld = 30) => {
  try {
    // This would require a Cloud Function or server-side implementation
    // For now, we'll just return a success message
    console.log('Token cleanup would be implemented on the server side')
    return true
  } catch (error) {
    console.error('Error cleaning up invalidated tokens:', error)
    throw error
  }
}

export const sendInvitationEmail = async (email, role, invitationLink) => {
  const subject = 'Welcome to Digipalz - Complete Your Registration'
  const message = `
    Hello,
    
    You have been invited to join Digipalz as a ${role.toLowerCase()}.
    
    Please click the link below to complete your registration:
    ${invitationLink}
    
    This invitation link will expire in 7 days.
    
    If you did not request this invitation, please ignore this email.
    
    Best regards,
    The Digipalz Team
  `
  try {
    await sendEmail({
      supportType: 'technical support',
      to_email: email,
      subject,
      message
    })
    return true
  } catch (error) {
    console.error('Error sending invitation email:', error)
    throw error
  }
}

export const sendStudentInvitationEmail = async (
  firstName,
  lastName,
  email,
  invitationLink
) => {
  const subject = 'Welcome to Digipalz - Complete Your Registration'
  const message = `
    Hello ${firstName} ${lastName},
    
    You have been invited to join Digipalz as a student.
    
    Please click the link below to complete your registration:
    ${invitationLink}
    
    This invitation link will expire in 7 days.
    
    If you did not request this invitation, please ignore this email.
    
    Best regards,
    The Digipalz Team
  `
  try {
    await sendEmail({
      supportType: 'technical support',
      to_email: email,
      subject,
      message
    })
    return true
  } catch (error) {
    console.error('Error sending student invitation email:', error)
    throw error
  }
}

export const sendSchoolAdminInvitationEmail = async (email, invitationLink) => {
  const subject = 'Welcome to Digipalz - Complete Your Registration'
  const message = `
    Hello, 

    You have been invited to join Digipalz as a school admin.
    
    Please click the link below to complete your registration:
    ${invitationLink}
    
    This invitation link will expire in 7 days.
    
    If you did not request this invitation, please ignore this email.
    
    Best regards,
    The Digipalz Team
  `
  try {
    await sendEmail({
      supportType: 'technical support',
      to_email: email,
      subject,
      message
    })
    return true
  } catch (error) {
    console.error('Error sending school admin invitation email:', error)
    throw error
  }
}
