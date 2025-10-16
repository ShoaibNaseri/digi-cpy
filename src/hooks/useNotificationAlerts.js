import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaUser,
  FaCog,
  FaCreditCard,
  FaShieldAlt,
  FaBook,
  FaChartLine,
  FaSchool,
  FaUsers,
  FaBell
} from 'react-icons/fa'
import { getUserNotifications } from '@/services/notificationService'
import { useAuth } from '@/context/AuthContext'

/**
 * Custom hook to monitor for new notifications and show toast alerts
 * @param {boolean} enabled - Whether to enable notification monitoring
 * @param {number} interval - Polling interval in milliseconds (default: 30000 = 30 seconds)
 */
export const useNotificationAlerts = (enabled = true, interval = 30000) => {
  const { currentUser } = useAuth()
  const lastNotificationCount = useRef(0)
  const lastNotificationIds = useRef(new Set())
  const intervalRef = useRef(null)

  // Initialize tracking from sessionStorage
  useEffect(() => {
    const savedCount = sessionStorage.getItem('notificationCount')
    const savedIds = sessionStorage.getItem('notificationIds')

    if (savedCount) {
      lastNotificationCount.current = parseInt(savedCount, 10)
    }

    if (savedIds) {
      try {
        const idsArray = JSON.parse(savedIds)
        lastNotificationIds.current = new Set(idsArray)
      } catch (error) {
        console.error('Error parsing saved notification IDs:', error)
        lastNotificationIds.current = new Set()
      }
    }
  }, [])

  // Function to check for new notifications
  const checkForNewNotifications = async () => {
    if (!currentUser?.uid || !enabled) return

    try {
      const notifications = await getUserNotifications(currentUser.uid)
      const currentCount = notifications.length
      const currentIds = new Set(notifications.map((n) => n.id))

      // Check if there are new notifications
      if (currentCount > lastNotificationCount.current) {
        const newNotifications = notifications.filter(
          (notification) => !lastNotificationIds.current.has(notification.id)
        )

        // Show toast for each new notification
        newNotifications.forEach((notification) => {
          const notificationType = notification.type || 'info'
          const icon = getNotificationIcon(notificationType)

          toast(notification.title, {
            description: notification.message,
            duration: 2000,
            icon: icon,
            action: {
              label: 'View',
              onClick: () => {
                // This could trigger opening the notification popup
                window.dispatchEvent(new CustomEvent('openNotificationPopup'))
              }
            },
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              color: '#1f2937',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              maxWidth: '400px',
              margin: '8px'
            }
          })
        })
      }

      // Update refs
      lastNotificationCount.current = currentCount
      lastNotificationIds.current = currentIds

      // Save to sessionStorage
      sessionStorage.setItem('notificationCount', currentCount.toString())
      sessionStorage.setItem(
        'notificationIds',
        JSON.stringify(Array.from(currentIds))
      )
    } catch (error) {
      console.error('Error checking for new notifications:', error)
    }
  }

  // Function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle style={{ color: '#10b981' }} />
      case 'info':
        return <FaInfoCircle style={{ color: '#3b82f6' }} />
      case 'warning':
        return <FaExclamationTriangle style={{ color: '#f59e0b' }} />
      case 'error':
        return <FaTimesCircle style={{ color: '#ef4444' }} />
      case 'user':
        return <FaUser style={{ color: '#6b7280' }} />
      case 'settings':
        return <FaCog style={{ color: '#6b7280' }} />
      case 'payment':
        return <FaCreditCard style={{ color: '#10b981' }} />
      case 'security':
        return <FaShieldAlt style={{ color: '#ef4444' }} />
      case 'education':
        return <FaBook style={{ color: '#3b82f6' }} />
      case 'analytics':
        return <FaChartLine style={{ color: '#8b5cf6' }} />
      case 'school':
        return <FaSchool style={{ color: '#f59e0b' }} />
      case 'students':
        return <FaUsers style={{ color: '#06b6d4' }} />
      default:
        return <FaBell style={{ color: '#6b7280' }} />
    }
  }

  // Set up polling interval
  useEffect(() => {
    if (!enabled || !currentUser?.uid) return

    // Initial check
    checkForNewNotifications()

    // Set up interval
    intervalRef.current = setInterval(checkForNewNotifications, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, currentUser?.uid, interval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    checkForNewNotifications
  }
}
