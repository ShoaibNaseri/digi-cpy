import React from 'react'
import './InfoModal.css'

const InfoModal = ({ open, onConfirm, title, description, icon }) => {
  if (!open) return null

  const renderedIcon =
    icon && React.isValidElement(icon)
      ? React.cloneElement(icon, { color: '#e74c3c', size: 48 })
      : icon

  return (
    <div className='info-modal__backdrop'>
      <div className='info-modal__container'>
        <div className='info-modal__icon'>{renderedIcon}</div>
        <h2 className='info-modal__title'>{title}</h2>
        <p className='info-modal__description'>{description}</p>
        <div className='info-modal__actions'>
          <button className='info-modal__confirm' onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoModal
