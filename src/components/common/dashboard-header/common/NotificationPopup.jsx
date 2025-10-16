import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTimes,
  FaEye,
  FaCheck,
  FaBell,
  FaCircle,
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
  FaTrash,
  FaTrashAlt
} from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import {
  useNotifications,
  useMarkNotificationAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  useMarkAllAsRead
} from '@/hooks/useNotifications'
// import { formatDistanceToNow } from 'date-fns'
import './NotificationPopup.css'

const NotificationPopup = ({ isOpen, onClose }) => {
  const popupRef = useRef(null)
  const { currentUser } = useAuth()

  // React Query hooks
  const {
    data: notifications = [],
    isLoading: loading,
    error
  } = useNotifications(currentUser?.uid, isOpen)

  const markAsReadMutation = useMarkNotificationAsRead()
  const deleteMutation = useDeleteNotification()
  const deleteAllMutation = useDeleteAllNotifications()
  const markAllAsReadMutation = useMarkAllAsRead()

  // Calculate unread count
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  // Simple date formatting function
  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time'

    // Handle Firestore timestamp
    const notificationDate = date.toDate ? date.toDate() : new Date(date)
    const now = new Date()
    const diffInSeconds = Math.floor((now - notificationDate) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  // Sort notifications: unread first, then by timestamp
  const sortedNotifications = notifications.sort((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1 // Unread first
    }
    // Handle Firestore timestamp
    const aTime = a.createdAt?.toDate
      ? a.createdAt.toDate()
      : new Date(a.createdAt)
    const bTime = b.createdAt?.toDate
      ? b.createdAt.toDate()
      : new Date(b.createdAt)
    return bTime - aTime // Newest first
  })

  // Listen for custom event to open notification popup
  useEffect(() => {
    const handleOpenNotificationPopup = () => {
      if (!isOpen) {
        // Trigger the popup to open by calling the parent's onOpen function
        // This assumes the parent component has a way to open the popup
        window.dispatchEvent(new CustomEvent('forceOpenNotificationPopup'))
      }
    }

    window.addEventListener(
      'openNotificationPopup',
      handleOpenNotificationPopup
    )

    return () => {
      window.removeEventListener(
        'openNotificationPopup',
        handleOpenNotificationPopup
      )
    }
  }, [isOpen])

  // Animation variants
  const popupVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  }

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync(notifications)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleViewAll = () => {
    // TODO: Navigate to full notifications page
    console.log('View all clicked')
    onClose()
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      try {
        await markAsReadMutation.mutateAsync(notification.id)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    // TODO: Handle notification action if needed
    console.log('Notification clicked:', notification)
  }

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation() // Prevent triggering the notification click

    try {
      await deleteMutation.mutateAsync(notificationId)
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleDeleteAllNotifications = async () => {
    if (!currentUser?.uid) return

    try {
      await deleteAllMutation.mutateAsync(currentUser.uid)
    } catch (error) {
      console.error('Error deleting all notifications:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />
      case 'info':
        return <FaInfoCircle />
      case 'warning':
        return <FaExclamationTriangle />
      case 'error':
        return <FaTimesCircle />
      case 'user':
        return <FaUser />
      case 'settings':
        return <FaCog />
      case 'payment':
        return <FaCreditCard />
      case 'security':
        return <FaShieldAlt />
      case 'education':
        return <FaBook />
      case 'analytics':
        return <FaChartLine />
      case 'school':
        return <FaSchool />
      case 'students':
        return <FaUsers />
      default:
        return <FaBell />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
      case 'info':
        return 'linear-gradient(90deg, #d60c7b 0%, #6b2db3 100%)'
      case 'warning':
        return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
      case 'error':
        return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
      default:
        return 'linear-gradient(90deg, #d60c7b 0%, #6b2db3 100%)'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='notification-popup-overlay'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className='notification-popup'
            ref={popupRef}
            variants={popupVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            {/* Header */}
            <div className='notification-popup__header'>
              <div className='notification-popup__title'>
                <div className='notification-popup__title-content'>
                  <FaBell className='notification-popup__icon' />
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <div className='notification-popup__badge'>
                      <span className='notification-popup__count'>
                        {unreadCount}
                      </span>
                      <span className='notification-popup__badge-text'>
                        Unread notifications
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className='notification-popup__close'
                onClick={onClose}
                aria-label='Close notifications'
              >
                <FaTimes />
              </button>
            </div>

            {/* Notifications List */}
            <div className='notification-popup__content'>
              {loading ? (
                <div className='notification-popup__loading'>
                  <div className='gradient-spinner'></div>
                  <p>Loading notifications...</p>
                </div>
              ) : sortedNotifications.length === 0 ? (
                <div className='notification-popup__empty'>
                  <FaBell className='notification-popup__empty-icon' />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className='notification-popup__list'>
                  {sortedNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      className={`notification-popup__item ${
                        !notification.read ? 'unread' : ''
                      }`}
                      variants={itemVariants}
                      initial='hidden'
                      animate='visible'
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className='notification-popup__item-icon'>
                        <div
                          className='notification-icon-wrapper'
                          style={{
                            background: getNotificationColor(notification.type),
                            color: 'white'
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className='notification-popup__item-content'>
                        <div className='notification-popup__item-header'>
                          <h4 className='notification-popup__item-title'>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <FaCircle className='notification-popup__unread-dot' />
                          )}
                        </div>
                        <p className='notification-popup__item-message'>
                          {notification.message}
                        </p>
                        <div className='notification-popup__item-footer'>
                          <span className='notification-popup__item-time'>
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <button
                            className='notification-popup__delete-btn'
                            onClick={(e) =>
                              handleDeleteNotification(notification.id, e)
                            }
                            aria-label='Delete notification'
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {sortedNotifications.length > 0 && (
              <div className='notification-popup__footer'>
                <button
                  className='notification-popup__action-btn secondary'
                  onClick={handleMarkAllAsRead}
                >
                  <FaCheck />
                  Mark all as read
                </button>
                <button
                  className='notification-popup__action-btn danger'
                  onClick={handleDeleteAllNotifications}
                >
                  <FaTrashAlt />
                  Delete all
                </button>
                {/* <button
                  className='notification-popup__action-btn primary'
                  onClick={handleViewAll}
                >
                  <FaEye />
                  View all
                </button> */}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationPopup
