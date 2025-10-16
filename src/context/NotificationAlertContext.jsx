import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { showNotificationToast } from '@/utils/toastUtils'
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
import { notificationKeys } from '@/hooks/useNotifications'

const NotificationAlertContext = createContext()

export const useNotificationAlerts = () => {
  const context = useContext(NotificationAlertContext)
  if (!context) {
    throw new Error(
      'useNotificationAlerts must be used within a NotificationAlertProvider'
    )
  }
  return context
}

export const NotificationAlertProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEnabled, setIsEnabled] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(5000) // 5 seconds
  const lastNotificationCount = useRef(0)
  const lastNotificationIds = useRef(new Set())
  const intervalRef = useRef(null)
  const [isPolling, setIsPolling] = useState(false)

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

    // Initialize tracking silently for new login sessions to prevent showing existing notifications as new
    if (currentUser?.uid && isEnabled) {
      initializeTrackingOnLogin()
    }
  }, [currentUser?.uid, isEnabled])

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

  // Function to initialize tracking silently on login to prevent existing notifications from being shown as new
  const initializeTrackingOnLogin = async () => {
    if (!currentUser?.uid || !isEnabled) return

    try {
      setIsPolling(true)
      const notifications = await getUserNotifications(currentUser.uid)
      const currentCount = notifications.length
      const currentIds = new Set(notifications.map((n) => n.id))

      // Initialize tracking without showing toasts
      lastNotificationCount.current = currentCount
      lastNotificationIds.current = currentIds

      // Save to sessionStorage
      sessionStorage.setItem('notificationCount', currentCount.toString())
      sessionStorage.setItem(
        'notificationIds',
        JSON.stringify(Array.from(currentIds))
      )

      console.log('Notification tracking initialized silently for login')
    } catch (error) {
      console.error('Error initializing notification tracking:', error)
    } finally {
      setIsPolling(false)
    }
  }

  // Function to check for new notifications
  const checkForNewNotifications = async () => {
    if (!currentUser?.uid || !isEnabled) return

    try {
      setIsPolling(true)
      const notifications = await getUserNotifications(currentUser.uid)
      const currentCount = notifications.length
      const currentIds = new Set(notifications.map((n) => n.id))

      // Check if there are new notifications
      const newNotifications = notifications.filter(
        (notification) => !lastNotificationIds.current.has(notification.id)
      )

      if (
        currentCount > lastNotificationCount.current &&
        newNotifications.length > 0
      ) {
        // Show toast for each new notification
        newNotifications.forEach((notification) => {
          const notificationType = notification.type || 'info'
          const icon = getNotificationIcon(notificationType)

          showNotificationToast(notification.title, {
            description: notification.message,
            duration: 2000,
            icon: icon,
            action: {
              label: 'View',
              onClick: () => {
                // Dispatch custom event to open notification popup
                window.dispatchEvent(new CustomEvent('openNotificationPopup'))
              }
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

      // Invalidate React Query cache to trigger refetch in NotificationPopup
      if (newNotifications.length > 0) {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error)
    } finally {
      setIsPolling(false)
    }
  }

  // Start polling
  const startPolling = () => {
    if (intervalRef.current) return

    if (currentUser?.uid && isEnabled) {
      // Set up interval for regular checks
      intervalRef.current = setInterval(
        checkForNewNotifications,
        pollingInterval
      )
    }
  }

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Set up polling when user changes or settings change
  useEffect(() => {
    stopPolling()

    // Reset tracking when user changes (logout/login)
    if (!currentUser?.uid) {
      resetTracking()
    } else {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [currentUser?.uid, isEnabled, pollingInterval])

  // Listen for immediate notification check events
  useEffect(() => {
    const handleCheckNotifications = () => {
      if (currentUser?.uid && isEnabled) {
        // Small delay to ensure database write has completed
        setTimeout(() => {
          checkForNewNotifications()
        }, 500)
      }
    }

    window.addEventListener('checkNotifications', handleCheckNotifications)

    return () => {
      window.removeEventListener('checkNotifications', handleCheckNotifications)
    }
  }, [currentUser?.uid, isEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  // Manual check function
  const manualCheck = () => {
    checkForNewNotifications()
  }

  // Reset notification tracking (useful when user logs out)
  const resetTracking = () => {
    lastNotificationCount.current = 0
    lastNotificationIds.current.clear()
    sessionStorage.removeItem('notificationCount')
    sessionStorage.removeItem('notificationIds')
  }

  const value = {
    isEnabled,
    setIsEnabled,
    pollingInterval,
    setPollingInterval,
    isPolling,
    manualCheck,
    resetTracking,
    checkForNewNotifications
  }

  return (
    <NotificationAlertContext.Provider value={value}>
      {children}
    </NotificationAlertContext.Provider>
  )
}
