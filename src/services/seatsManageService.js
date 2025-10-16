// services/seatsManageService.js
import { db } from '@/firebase/config'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { decryptFields } from './encryptionService'

/**
 * Calculate and update available seats for a school
 * @param {string} schoolId School ID
 * @returns {Promise<Object>} Update result
 */
export const updateSchoolAvailableSeats = async (schoolId) => {
  try {
    if (!schoolId) {
      console.error(
        'Missing required parameters for updateSchoolAvailableSeats'
      )
      return { success: false, availableSeats: 0, usedSeats: 0 }
    }

    // 1. Get school data
    const schoolRef = doc(db, 'schools', schoolId)
    const schoolDoc = await getDoc(schoolRef)

    if (!schoolDoc.exists()) {
      console.error(`School document not found with ID: ${schoolId}`)
      return { success: false, availableSeats: 0, usedSeats: 0 }
    }

    const schoolData = schoolDoc.data()
    // 2. Get principal email
    const paymentId = schoolData.paymentId
    if (!paymentId) {
      console.error('School document does not have a paymentId')
      return { success: false, availableSeats: 0, usedSeats: 0 }
    }

    // 3. Query payment records matching the principal's email
    const paymentsRef = collection(db, 'payments')

    const q = query(paymentsRef, where('sessionId', '==', paymentId))

    const querySnapshot = await getDocs(q)

    // 4. Calculate total seats of all types
    let totalSeats = 0

    // Log details for each payment record
    querySnapshot.forEach((docSnapshot) => {
      const paymentData = decryptFields(docSnapshot.data())
      const paymentId = docSnapshot.id
      // Check if this payment record has seat count
      if (paymentData.numOfSeats && !isNaN(paymentData.numOfSeats)) {
        const seats = parseInt(paymentData.numOfSeats, 10)
        totalSeats += seats
      } else {
        console.log(`✗ Payment ${paymentId} does not have valid seat count:`, {
          hasNumOfSeats: !!paymentData.numOfSeats,
          isNumeric: !isNaN(paymentData.numOfSeats)
        })
      }
    })

    console.log(`Total seats calculated: ${totalSeats}`)

    // 5. Get used seats count
    const usedSeats = schoolData.usedSeats || 0

    // 6. Update available seats in school document
    const availableSeatsField = 'availableSeats'

    // Log pre-update value
    const oldAvailableSeats = schoolData[availableSeatsField] || 0

    // Update document
    await updateDoc(schoolRef, {
      [availableSeatsField]: totalSeats
    })

    console.log(
      `Updated ${availableSeatsField} from ${oldAvailableSeats} to ${totalSeats}`
    )

    return {
      success: true,
      availableSeats: totalSeats,
      usedSeats: usedSeats
    }
  } catch (error) {
    console.error('Error updating school available seats:', error)
    return { success: false, availableSeats: 0, usedSeats: 0 }
  }
}

/**
 * Check if school has enough seats
 * @param {string} schoolId School ID
 * @param {string} seatType Seat type (parameter retained but not used)
 * @param {number} requiredSeats Required seats
 * @returns {Promise<Object>} Check result
 */
export const checkSchoolHasEnoughSeats = async (
  schoolId,
  seatType,
  requiredSeats
) => {
  try {
    // First update the number of available seats
    const { success, availableSeats, usedSeats } =
      await updateSchoolAvailableSeats(schoolId)

    if (!success) {
      return { hasEnoughSeats: false, availableSeats: 0, usedSeats: 0 }
    }

    // Calculate if there are enough seats
    const requiredSeatsNum = parseInt(requiredSeats, 10) || 0
    const hasEnoughSeats = availableSeats >= usedSeats + requiredSeatsNum

    console.log(
      `Seat check results - Available: ${availableSeats}, Used: ${usedSeats}, Required: ${requiredSeatsNum}, HasEnough: ${hasEnoughSeats}`
    )

    return {
      hasEnoughSeats,
      availableSeats,
      usedSeats
    }
  } catch (error) {
    console.error('Error checking school seats:', error)
    return { hasEnoughSeats: false, availableSeats: 0, usedSeats: 0 }
  }
}

/**
 * Update the school's used seat count
 * @param {string} schoolId School ID
 * @param {string} seatType Seat type (parameter retained but not used)
 * @param {number} studentCount Student count
 * @returns {Promise<boolean>} Update result
 */
export const updateSchoolSeatUsage = async (
  schoolId,
  seatType,
  studentCount
) => {
  try {
    if (!schoolId || !studentCount) {
      console.warn('Missing parameters for updateSchoolSeatUsage:', {
        schoolId,
        studentCount
      })
      return false
    }

    // Get school document reference
    const schoolRef = doc(db, 'schools', schoolId)

    // Get current school data
    const schoolDoc = await getDoc(schoolRef)

    if (!schoolDoc.exists()) {
      console.error('School document not found with ID:', schoolId)
      return false
    }

    const schoolData = schoolDoc.data()
    console.log('Current school data:', schoolData)

    // Convert studentCount to number
    const numStudents = parseInt(studentCount, 10) || 0

    // Update unified usage count
    const currentSeats = schoolData.usedSeats || 0
    console.log(
      `Updating usedSeats from ${currentSeats} to ${currentSeats + numStudents}`
    )

    await updateDoc(schoolRef, {
      usedSeats: currentSeats + numStudents
    })

    console.log('School seat usage updated successfully')
    return true
  } catch (error) {
    console.error('Error updating school seat usage:', error)
    return false
  }
}

export const updateSchoolPurchasedSeat = async (schoolId, purchasedSeat) => {
  try {
    const schoolRef = doc(db, 'schools', schoolId)
    const schoolDoc = await getDoc(schoolRef)
    if (!schoolDoc.exists()) {
      console.error('School document not found with ID:', schoolId)
      return { success: false, error: 'School document not found' }
    }
    const schoolData = schoolDoc.data()
    const currentAvailableSeat = schoolData.availableSeats || 0
    await updateDoc(schoolRef, {
      availableSeats: currentAvailableSeat + purchasedSeat
    })
    return {
      success: true,
      availableSeats: currentAvailableSeat + purchasedSeat
    }
  } catch (error) {
    console.error('Error updating school purchased seat:', error)
    return { success: false, error: error.message }
  }
}
