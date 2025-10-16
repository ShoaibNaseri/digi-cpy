import { db } from '@/firebase/config'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import {
  saveNoteToLocalStorage,
  loadNoteFromLocalStorage,
  clearNoteFromLocalStorage
} from '@/utils/notesLocalStorage'

/**
 * Save notes to Firebase userNotes collection
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 * @param {string} missionTitle - Mission Title
 * @param {Object} noteData - Note data object
 */
export const saveNotesToFirebase = async (
  userId,
  missionId,
  missionTitle,
  noteData
) => {
  try {
    if (!userId || !missionId) {
      throw new Error('User ID and Mission ID are required')
    }

    const userNotesRef = doc(db, 'userNotes', `${userId}_${missionId}`)

    const noteDocument = {
      userId,
      missionId,
      missionTitle,
      content: noteData.content || '',
      htmlContent: noteData.htmlContent || '',
      backgroundColor: noteData.backgroundColor || '#fff3cd',
      position: noteData.position || { x: 50, y: 50 },
      size: noteData.size || { width: 300, height: 200 },
      lastSaved: serverTimestamp(),
      createdAt: noteData.createdAt || serverTimestamp()
    }

    await setDoc(userNotesRef, noteDocument, { merge: true })

    console.log('Notes saved to Firebase successfully')
    return { success: true, data: noteDocument }
  } catch (error) {
    console.error('Error saving notes to Firebase:', error)
    throw error
  }
}

/**
 * Load notes from Firebase for a specific mission
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 */
export const loadNotesFromFirebase = async (userId, missionId) => {
  try {
    if (!userId || !missionId) {
      throw new Error('User ID and Mission ID are required')
    }

    const userNotesRef = doc(db, 'userNotes', `${userId}_${missionId}`)
    const noteDoc = await getDoc(userNotesRef)

    if (noteDoc.exists()) {
      const data = noteDoc.data()
      return {
        success: true,
        data: {
          content: data.content || '',
          htmlContent: data.htmlContent || '',
          backgroundColor: data.backgroundColor || '#fff3cd',
          position: data.position || { x: 50, y: 50 },
          size: data.size || { width: 300, height: 200 },
          missionTitle: data.missionTitle || '',
          lastSaved: data.lastSaved
        }
      }
    } else {
      return { success: true, data: null }
    }
  } catch (error) {
    console.error('Error loading notes from Firebase:', error)
    throw error
  }
}

/**
 * Get all notes for a user
 * @param {string} userId - User ID
 */
export const getAllUserNotes = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const userNotesRef = collection(db, 'userNotes')
    const q = query(userNotesRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    const notes = []
    querySnapshot.forEach((doc) => {
      notes.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return { success: true, data: notes }
  } catch (error) {
    console.error('Error loading all user notes:', error)
    throw error
  }
}

/**
 * Delete notes for a specific mission
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 */
export const deleteNotesFromFirebase = async (userId, missionId) => {
  try {
    if (!userId || !missionId) {
      throw new Error('User ID and Mission ID are required')
    }

    const userNotesRef = doc(db, 'userNotes', `${userId}_${missionId}`)
    await updateDoc(userNotesRef, {
      content: '',
      lastSaved: serverTimestamp()
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting notes from Firebase:', error)
    throw error
  }
}

/**
 * Save note to localStorage during mission play
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 * @param {string} missionTitle - Mission Title
 * @param {Object} noteData - Note data object
 */
export const saveNoteToLocalStorageService = (
  userId,
  missionId,
  missionTitle,
  noteData
) => {
  try {
    console.log('Saving note to localStorage via service:', {
      userId,
      missionId,
      missionTitle,
      noteData
    })

    const result = saveNoteToLocalStorage(
      missionId,
      missionTitle,
      userId,
      noteData
    )

    if (result.success) {
      console.log('Note saved to localStorage successfully via service')
    } else {
      console.error('Error saving to localStorage via service:', result.error)
    }

    return result
  } catch (error) {
    console.error('Error in saveNoteToLocalStorageService:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Load note from localStorage during mission play
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 */
export const loadNoteFromLocalStorageService = (userId, missionId) => {
  try {
    console.log('Loading note from localStorage via service:', {
      userId,
      missionId
    })

    const result = loadNoteFromLocalStorage(missionId, userId)

    if (result.success && result.data) {
      console.log('Note loaded from localStorage successfully via service')
    } else {
      console.log('No note found in localStorage via service')
    }

    return result
  } catch (error) {
    console.error('Error in loadNoteFromLocalStorageService:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Load note with fallback: localStorage first, then Firebase
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 * @param {string} missionTitle - Mission Title (optional, for fallback)
 */
export const loadNoteWithFallback = async (
  userId,
  missionId,
  missionTitle = 'Mission'
) => {
  try {
    console.log('Loading note with fallback via service:', {
      userId,
      missionId,
      missionTitle
    })

    // First try localStorage
    const localResult = loadNoteFromLocalStorageService(userId, missionId)

    if (localResult.success && localResult.data) {
      console.log('Note found in localStorage, returning data')
      return {
        success: true,
        data: localResult.data,
        source: 'localStorage'
      }
    }

    // Fallback to Firebase
    console.log('Note not in localStorage, checking Firebase...')
    const firebaseResult = await loadNotesFromFirebase(userId, missionId)

    if (firebaseResult.success && firebaseResult.data) {
      console.log(
        'Note found in Firebase, saving to localStorage for future use'
      )

      // Save to localStorage for future use
      const saveResult = saveNoteToLocalStorageService(
        userId,
        missionId,
        firebaseResult.data.missionTitle || missionTitle,
        {
          content: firebaseResult.data.content,
          htmlContent: firebaseResult.data.htmlContent,
          backgroundColor: firebaseResult.data.backgroundColor,
          position: firebaseResult.data.position,
          size: firebaseResult.data.size
        }
      )

      if (saveResult.success) {
        console.log('Firebase note saved to localStorage for future use')
      }

      return {
        success: true,
        data: firebaseResult.data,
        source: 'firebase'
      }
    }

    console.log('No note found in localStorage or Firebase')
    return {
      success: true,
      data: null,
      source: 'none'
    }
  } catch (error) {
    console.error('Error in loadNoteWithFallback:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save note during mission play (localStorage)
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 * @param {string} missionTitle - Mission Title
 * @param {Object} noteData - Note data object
 */
export const saveNoteDuringMission = (
  userId,
  missionId,
  missionTitle,
  noteData
) => {
  try {
    console.log('Saving note during mission via service:', {
      userId,
      missionId,
      missionTitle,
      noteData
    })

    return saveNoteToLocalStorageService(
      userId,
      missionId,
      missionTitle,
      noteData
    )
  } catch (error) {
    console.error('Error in saveNoteDuringMission:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save note when exiting mission (Firebase + localStorage cleanup)
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 * @param {string} missionTitle - Mission Title
 * @param {Object} noteData - Note data object
 */
export const saveNoteOnExit = async (
  userId,
  missionId,
  missionTitle,
  noteData
) => {
  try {
    console.log('Saving note on exit via service:', {
      userId,
      missionId,
      missionTitle,
      noteData
    })

    // Save to Firebase
    const firebaseResult = await saveNotesToFirebase(
      userId,
      missionId,
      missionTitle,
      noteData
    )

    if (firebaseResult.success) {
      console.log('Note saved to Firebase on exit successfully')

      // Keep localStorage for persistence (don't clear immediately)
      console.log(
        'Note saved to Firebase, keeping localStorage for persistence'
      )

      return { success: true, data: firebaseResult.data }
    } else {
      console.error('Failed to save note to Firebase on exit')
      return { success: false, error: 'Failed to save to Firebase' }
    }
  } catch (error) {
    console.error('Error in saveNoteOnExit:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Clear note from localStorage
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 */
export const clearNoteFromLocalStorageService = (userId, missionId) => {
  try {
    console.log('Clearing note from localStorage via service:', {
      userId,
      missionId
    })

    const result = clearNoteFromLocalStorage(missionId, userId)

    if (result.success) {
      console.log('Note cleared from localStorage successfully via service')
    }

    return result
  } catch (error) {
    console.error('Error in clearNoteFromLocalStorageService:', error)
    return { success: false, error: error.message }
  }
}
