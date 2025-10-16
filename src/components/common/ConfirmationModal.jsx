import React from 'react'
import './ConfirmationModal.css'

const ConfirmationModal = ({
  type = 'success',
  open,
  onCancel,
  onConfirm,
  title,
  description,
  icon,
  disabled = false
}) => {
  if (!open) return null

  const iconColor = type === 'delete' ? '#e74c3c' : '#2ecc71'

  const renderedIcon =
    icon && React.isValidElement(icon)
      ? React.cloneElement(icon, { color: iconColor, size: 48 })
      : icon

  return (
    <div className='confirmation-modal__backdrop'>
      <div className='confirmation-modal__container'>
        <div className='confirmation-modal__icon'>{renderedIcon}</div>
        <h2 className='confirmation-modal__title'>{title}</h2>
        <p className='confirmation-modal__description'>{description}</p>
        <div className='confirmation-modal__actions'>
          {type !== 'success' ? (
            <button className='confirmation-modal__cancel' onClick={onCancel}>
              Cancel
            </button>
          ) : (
            <div />
          )}
          <button
            className={`confirmation-modal__confirm${
              type === 'delete' ? ' confirmation-modal__confirm--delete' : ''
            }${disabled ? ' confirmation-modal__confirm--disabled' : ''}`}
            onClick={onConfirm}
            disabled={disabled}
          >
            {type === 'success' ? 'Complete' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
