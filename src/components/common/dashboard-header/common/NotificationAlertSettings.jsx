import React from 'react'
import { useNotificationAlerts } from '@/context/NotificationAlertContext'
import { FaBell, FaBellSlash, FaCog, FaPlay, FaPause } from 'react-icons/fa'
import './NotificationAlertSettings.css'

const NotificationAlertSettings = () => {
  const {
    isEnabled,
    setIsEnabled,
    pollingInterval,
    setPollingInterval,
    isPolling,
    manualCheck
  } = useNotificationAlerts()

  const handleToggle = () => {
    setIsEnabled(!isEnabled)
  }

  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value) * 1000 // Convert to milliseconds
    setPollingInterval(newInterval)
  }

  const formatInterval = (ms) => {
    return Math.round(ms / 1000)
  }

  return (
    <div className='notification-alert-settings'>
      <div className='notification-alert-settings__header'>
        <FaBell className='notification-alert-settings__icon' />
        <h3>Notification Alerts</h3>
      </div>

      <div className='notification-alert-settings__content'>
        <div className='notification-alert-settings__item'>
          <div className='notification-alert-settings__label'>
            <span>Enable Notifications</span>
            <span className='notification-alert-settings__status'>
              {isPolling ? (
                <span className='status-active'>
                  <FaPlay /> Active
                </span>
              ) : (
                <span className='status-inactive'>
                  <FaPause /> Inactive
                </span>
              )}
            </span>
          </div>
          <button
            className={`notification-alert-settings__toggle ${
              isEnabled ? 'active' : 'inactive'
            }`}
            onClick={handleToggle}
            aria-label={
              isEnabled ? 'Disable notifications' : 'Enable notifications'
            }
          >
            {isEnabled ? <FaBell /> : <FaBellSlash />}
          </button>
        </div>

        <div className='notification-alert-settings__item'>
          <div className='notification-alert-settings__label'>
            <span>Check Interval</span>
            <span className='notification-alert-settings__value'>
              {formatInterval(pollingInterval)}s
            </span>
          </div>
          <input
            type='range'
            min='10'
            max='300'
            step='10'
            value={formatInterval(pollingInterval)}
            onChange={handleIntervalChange}
            className='notification-alert-settings__slider'
            disabled={!isEnabled}
          />
        </div>

        <div className='notification-alert-settings__item'>
          <button
            className='notification-alert-settings__test-btn'
            onClick={manualCheck}
            disabled={!isEnabled}
          >
            <FaCog />
            Test Check Now
          </button>
        </div>
      </div>

      <div className='notification-alert-settings__info'>
        <p>
          {isEnabled
            ? `Checking for new notifications every ${formatInterval(
                pollingInterval
              )} seconds`
            : 'Notification alerts are disabled'}
        </p>
      </div>
    </div>
  )
}

export default NotificationAlertSettings
