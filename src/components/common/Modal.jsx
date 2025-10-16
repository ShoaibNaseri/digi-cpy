import React, { useEffect } from 'react'
import './Modal.css'

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal')) {
      onClose()
    }
  }

  // Close modal with Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      // Restore scrolling when modal is closed
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className='modal' onClick={handleBackdropClick}>
      <div className='modal__container'>
        <div className='modal__header'>
          <h2 className='modal__title'>{title}</h2>
          <button className='modal__close-btn' onClick={onClose}>
            &times;
          </button>
        </div>
        <div className='modal__content'>{children}</div>
        <div className='modal__footer'>{footer}</div>
      </div>
    </div>
  )
}

export default Modal
