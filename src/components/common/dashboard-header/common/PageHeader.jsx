import React, { useState, useEffect } from 'react'
import { FaSearch, FaBell } from 'react-icons/fa'
import SearchModal from './SearchModal'
import NotificationPopup from './NotificationPopup'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/context/AuthContext'
import './PageHeader.css'

const PageHeader = ({
  title,
  subtitle,
  children,
  menuItems = [],
  notifications = []
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false)
  const { currentUser } = useAuth()

  // Get notifications using React Query
  const { data: userNotifications = [] } = useNotifications(
    currentUser?.uid,
    true
  )

  // Calculate unread count
  const unreadCount = userNotifications.filter(
    (notification) => !notification.read
  ).length

  const handleSearchClick = () => {
    setIsSearchModalOpen(true)
  }

  const handleNotificationClick = () => {
    setIsNotificationPopupOpen(true)
  }

  // Listen for force open notification popup event
  useEffect(() => {
    const handleForceOpenNotificationPopup = () => {
      setIsNotificationPopupOpen(true)
    }

    window.addEventListener(
      'forceOpenNotificationPopup',
      handleForceOpenNotificationPopup
    )

    return () => {
      window.removeEventListener(
        'forceOpenNotificationPopup',
        handleForceOpenNotificationPopup
      )
    }
  }, [])

  return (
    <>
      <div className='educator-page-header'>
        <div className='educator-page-header__content'>
          <h1 className='educator-page-header__title'>{title}</h1>
          {subtitle && (
            <p className='educator-page-header__subtitle'>{subtitle}</p>
          )}
        </div>

        <div className='educator-page-header__right'>
          <div className='educator-page-header__search-container'>
            <button
              className='educator-page-header__search-button'
              onClick={handleSearchClick}
              aria-label='Search'
            >
              <FaSearch className='educator-page-header__search-icon' />
              <span className='educator-page-header__search-text'>
                Search...
              </span>
            </button>
          </div>
          <button
            className='educator-page-header__notification-button'
            onClick={handleNotificationClick}
            aria-label='Notifications'
          >
            <FaBell className='educator-page-header__notification-icon' />
            {unreadCount > 0 && (
              <span className='educator-page-header__notification-badge'></span>
            )}
          </button>
        </div>

        {children && (
          <div className='educator-page-header__actions'>{children}</div>
        )}
      </div>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        menuItems={menuItems}
      />

      <NotificationPopup
        isOpen={isNotificationPopupOpen}
        onClose={() => setIsNotificationPopupOpen(false)}
      />
    </>
  )
}

export default PageHeader
