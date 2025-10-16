/**
 * LocalStorage utility functions for mission notes
 */

const NOTES_STORAGE_KEY = 'mission_notes'

/**
 * Save note data to localStorage
 * @param {string} missionId - Mission ID
 * @param {string} missionTitle - Mission Title
 * @param {string} userId - User ID
 * @param {Object} noteData - Note data object
 */
export const saveNoteToLocalStorage = (
  missionId,
  missionTitle,
  userId,
  noteData
) => {
  try {
    console.log('saveNoteToLocalStorage called with:', {
      missionId,
      missionTitle,
      userId,
      noteData
    })

    const noteKey = `${missionId}_${userId}`
    const noteObject = {
      missionId,
      missionTitle,
      userId,
      content: noteData.content || '',
      htmlContent: noteData.htmlContent || '',
      backgroundColor: noteData.backgroundColor || '#fff3cd',
      position: noteData.position || { x: 50, y: 50 },
      size: noteData.size || { width: 300, height: 200 },
      lastUpdated: new Date().toISOString()
    }

    console.log('Created note object:', noteObject)

    // Get existing notes
    const existingNotes = getNotesFromLocalStorage()
    console.log('Existing notes:', existingNotes)

    // Update or add the note
    existingNotes[noteKey] = noteObject

    // Save back to localStorage
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes))

    // Verify the save
    const savedNotes = getNotesFromLocalStorage()
    console.log('Notes after save:', savedNotes)

    console.log('Note saved to localStorage:', noteKey)
    return { success: true, data: noteObject }
  } catch (error) {
    console.error('Error saving note to localStorage:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Load note data from localStorage
 * @param {string} missionId - Mission ID
 * @param {string} userId - User ID
 */
export const loadNoteFromLocalStorage = (missionId, userId) => {
  try {
    console.log('loadNoteFromLocalStorage called with:', { missionId, userId })

    const noteKey = `${missionId}_${userId}`
    console.log('Looking for note key:', noteKey)

    const existingNotes = getNotesFromLocalStorage()
    console.log('All existing notes:', existingNotes)

    if (existingNotes[noteKey]) {
      console.log('Found note in localStorage:', existingNotes[noteKey])
      return { success: true, data: existingNotes[noteKey] }
    } else {
      console.log('Note not found in localStorage for key:', noteKey)
      return { success: true, data: null }
    }
  } catch (error) {
    console.error('Error loading note from localStorage:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all notes from localStorage
 */
export const getNotesFromLocalStorage = () => {
  try {
    const notes = localStorage.getItem(NOTES_STORAGE_KEY)
    return notes ? JSON.parse(notes) : {}
  } catch (error) {
    console.error('Error getting notes from localStorage:', error)
    return {}
  }
}

/**
 * Save all notes from localStorage to Firebase
 * @param {string} userId - User ID
 * @param {Function} saveToFirebase - Function to save to Firebase
 */
export const saveAllNotesToFirebase = async (userId, saveToFirebase) => {
  try {
    const allNotes = getNotesFromLocalStorage()
    const userNotes = Object.values(allNotes).filter(
      (note) => note.userId === userId
    )

    const savePromises = userNotes.map((note) =>
      saveToFirebase(note.userId, note.missionId, note.missionTitle, {
        content: note.content,
        htmlContent: note.htmlContent,
        backgroundColor: note.backgroundColor,
        position: note.position,
        size: note.size
      })
    )

    await Promise.all(savePromises)

    // Clear localStorage after successful save
    localStorage.removeItem(NOTES_STORAGE_KEY)

    console.log('All notes saved to Firebase and localStorage cleared')
    return { success: true, count: userNotes.length }
  } catch (error) {
    console.error('Error saving all notes to Firebase:', error)
    throw error
  }
}

/**
 * Load notes from Firebase and save to localStorage
 * @param {string} userId - User ID
 * @param {string} missionId - Mission ID
 * @param {Function} loadFromFirebase - Function to load from Firebase
 */
export const loadNotesFromFirebaseToLocalStorage = async (
  userId,
  missionId,
  loadFromFirebase
) => {
  try {
    const result = await loadFromFirebase(userId, missionId)

    if (result.success && result.data) {
      // Save to localStorage
      const noteData = {
        content: result.data.content,
        htmlContent: result.data.htmlContent,
        backgroundColor: result.data.backgroundColor,
        position: result.data.position,
        size: result.data.size
      }

      saveNoteToLocalStorage(
        missionId,
        result.data.missionTitle,
        userId,
        noteData
      )
      return { success: true, data: result.data }
    } else {
      return { success: true, data: null }
    }
  } catch (error) {
    console.error('Error loading notes from Firebase to localStorage:', error)
    throw error
  }
}

/**
 * Clear specific note from localStorage
 * @param {string} missionId - Mission ID
 * @param {string} userId - User ID
 */
export const clearNoteFromLocalStorage = (missionId, userId) => {
  try {
    const noteKey = `${missionId}_${userId}`
    const existingNotes = getNotesFromLocalStorage()

    if (existingNotes[noteKey]) {
      delete existingNotes[noteKey]
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes))
      console.log('Note cleared from localStorage:', noteKey)
    }

    return { success: true }
  } catch (error) {
    console.error('Error clearing note from localStorage:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Clear all notes from localStorage
 */
export const clearAllNotesFromLocalStorage = () => {
  try {
    localStorage.removeItem(NOTES_STORAGE_KEY)
    console.log('All notes cleared from localStorage')
    return { success: true }
  } catch (error) {
    console.error('Error clearing all notes from localStorage:', error)
    return { success: false, error: error.message }
  }
}
