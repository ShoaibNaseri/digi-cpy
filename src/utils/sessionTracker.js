import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/firebase/config'

class SessionTracker {
  constructor() {
    this.sessionStartTime = null
    this.currentUserId = null
    this.isTracking = false
    this.beforeUnloadListener = null
  }

  /**
   * Starts session tracking for a user
   * @param {string} userId - The user's UID
   */
  startSession(userId) {
    if (!userId) {
      console.error('User ID is required to start session tracking')
      return
    }

    // End any existing session first
    this.endSession()

    this.currentUserId = userId
    this.sessionStartTime = Date.now()
    this.isTracking = true

    // Set up beforeunload listener to save session when user leaves
    this.beforeUnloadListener = () => {
      this.endSession()
    }

    window.addEventListener('beforeunload', this.beforeUnloadListener)

    // Also listen for page visibility changes (when user switches tabs)
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    )

  }

  /**
   * Handles visibility change events (tab switching)
   */
  handleVisibilityChange() {
    if (document.visibilityState === 'hidden' && this.isTracking) {
      // User switched away from the tab, pause tracking
      this.pauseSession()
    } else if (
      document.visibilityState === 'visible' &&
      this.currentUserId &&
      !this.isTracking
    ) {
      // User returned to the tab, resume tracking
      this.resumeSession()
    }
  }

  /**
   * Pauses session tracking (when user switches tabs)
   */
  pauseSession() {
    if (!this.isTracking || !this.sessionStartTime) return

    const sessionDuration = Date.now() - this.sessionStartTime
    this.updateTotalTimeSpent(sessionDuration)
    this.isTracking = false

  }

  /**
   * Resumes session tracking (when user returns to tab)
   */
  resumeSession() {
    if (this.isTracking || !this.currentUserId) return

    this.sessionStartTime = Date.now()
    this.isTracking = true
  }

  /**
   * Ends the current session and updates total time spent
   */
  endSession() {
    if (!this.isTracking || !this.sessionStartTime || !this.currentUserId) {
      return
    }

    const sessionDuration = Date.now() - this.sessionStartTime
    this.updateTotalTimeSpent(sessionDuration)

    // Clean up
    this.cleanup()

  }

  /**
   * Updates the total time spent in Firestore
   * @param {number} duration - Session duration in milliseconds
   */
  async updateTotalTimeSpent(duration) {
    if (!this.currentUserId || !duration || duration < 0) return

    try {
      const userDocRef = doc(db, 'users', this.currentUserId)
      await updateDoc(userDocRef, {
        totalTimeSpent: increment(duration)
      })
    } catch (error) {
      console.error('Error updating total time spent:', error)
    }
  }

  /**
   * Cleans up session tracking
   */
  cleanup() {
    if (this.beforeUnloadListener) {
      window.removeEventListener('beforeunload', this.beforeUnloadListener)
      this.beforeUnloadListener = null
    }

    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    )

    this.sessionStartTime = null
    this.currentUserId = null
    this.isTracking = false
  }

  /**
   * Gets the current session duration
   * @returns {number} Current session duration in milliseconds
   */
  getCurrentSessionDuration() {
    if (!this.isTracking || !this.sessionStartTime) return 0
    return Date.now() - this.sessionStartTime
  }

  /**
   * Checks if session is currently being tracked
   * @returns {boolean} True if session is being tracked
   */
  isSessionActive() {
    return this.isTracking && this.sessionStartTime !== null
  }
}

// Create a singleton instance
const sessionTracker = new SessionTracker()

export default sessionTracker
