import React, { useEffect, useState } from 'react'
import './RedirectModal.css'

const RedirectModal = ({ isOpen, onClose, seconds = 5 }) => {
  const [countdown, setCountdown] = useState(seconds)

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className='redirect-modal-overlay'>
      <div className='redirect-modal-content'>
        <div className='redirect-modal-spinner'>
          <div className='redirect-modal-spinner-icon'></div>
        </div>
        <h3>Redirecting in {countdown} seconds...</h3>
        <p>Great! Check your inbox for your invite.</p>
        <p>
          If you have any issues please contact{' '}
          <a href='mailto:clientsupport@digipalz.io'>
            clientsupport@digipalz.io
          </a>
        </p>
      </div>
    </div>
  )
}

export default RedirectModal
