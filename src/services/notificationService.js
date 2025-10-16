import { db } from '@/firebase/config'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

/**
 * Save notification to Firestore for user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
export const saveUserNotification = async (userId, notification) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type, // 'info', 'warning', 'error', 'success'
      action: notification.action || null,
      read: false,
      createdAt: serverTimestamp()
    })

    // Trigger immediate notification check
    window.dispatchEvent(new CustomEvent('checkNotifications'))
  } catch (error) {
    console.error('Error saving notification:', error)
  }
}

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {boolean} unreadOnly - Only get unread notifications
 * @returns {Promise<Array>} Array of notifications
 */
export const getUserNotifications = async (userId, unreadOnly = false) => {
  try {
    const notificationsRef = collection(db, 'notifications')
    let q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    if (unreadOnly) {
      q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      )
    }

    const querySnapshot = await getDocs(q)
    const notifications = []

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return notifications
  } catch (error) {
    console.error('Error getting notifications:', error)
    return []
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 */
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await deleteDoc(notificationRef)
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

/**
 * Delete all notifications for a user
 * @param {string} userId - User ID
 */
export const deleteAllNotifications = async (userId) => {
  try {
    const notifications = await getUserNotifications(userId)
    const deletePromises = notifications.map((notification) =>
      deleteNotification(notification.id)
    )
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting all notifications:', error)
    throw error
  }
}
