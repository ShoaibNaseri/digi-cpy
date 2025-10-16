import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Save feedback to Firestore
 * @param {Object} feedbackData - The feedback data object
 * @returns {Promise<string>} - The document ID of the saved feedback
 */
export const saveFeedback = async (feedbackData) => {
  try {
    const feedbackRef = collection(db, 'feedbacks')

    const feedbackDoc = {
      ...feedbackData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(feedbackRef, feedbackDoc)

    return docRef.id
  } catch (error) {
    console.error('Error saving feedback:', error)
    throw new Error('Failed to save feedback: ' + error.message)
  }
}

/**
 * Get feedback statistics (optional helper function)
 * @param {string} resourceId - The resource ID to get stats for
 * @returns {Promise<Object>} - Feedback statistics
 */
export const getFeedbackStats = async (resourceId) => {
  try {
    // This can be implemented later if needed for analytics
    // For now, just return a placeholder
    return {
      averageRating: 0,
      totalFeedbacks: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    }
  } catch (error) {
    console.error('Error getting feedback stats:', error)
    throw new Error('Failed to get feedback stats: ' + error.message)
  }
}
