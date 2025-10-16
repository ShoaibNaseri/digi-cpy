import React from 'react'
import { FaExclamationTriangle, FaTimes, FaTrash } from 'react-icons/fa'
import './DeleteConfirmationModal.css'

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
  itemName,
  warningText = 'This action cannot be undone.',
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel'
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className='delete-confirmation-modal-overlay'
      onClick={handleBackdropClick}
    >
      <div className='delete-confirmation-modal'>
        <div className='delete-confirmation-modal-header'>
          <div className='delete-confirmation-modal-icon'>
            <FaExclamationTriangle />
          </div>
          <h3>{title}</h3>
          <button
            className='delete-confirmation-modal-close'
            onClick={onClose}
            aria-label='Close modal'
          >
            <FaTimes />
          </button>
        </div>
        <div className='delete-confirmation-modal-content'>
          <p>
            {message ||
              `Are you sure you want to delete ${
                itemName ? `"${itemName}"` : 'this item'
              }?`}
          </p>
          <div className='delete-confirmation-modal-warning'>
            <FaExclamationTriangle className='delete-warning-icon' />
            <span>{warningText}</span>
          </div>
        </div>
        <div className='delete-confirmation-modal-actions'>
          <button
            className='delete-confirmation-modal-cancel'
            onClick={onClose}
          >
            {cancelButtonText}
          </button>
          <button
            className='delete-confirmation-modal-confirm'
            onClick={handleConfirm}
          >
            <FaTrash className='delete-confirmation-modal-confirm-icon' />
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
