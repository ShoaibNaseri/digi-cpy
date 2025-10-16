import React from 'react'
import {
  FaTimes,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaEnvelope
} from 'react-icons/fa'
import './DeletedAccountInfoModal.css'

const DeletedAccountInfoModal = ({ isOpen, onClose, childData }) => {
  if (!isOpen || !childData) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div
      className='deleted-account-info-modal-overlay'
      onClick={handleBackdropClick}
    >
      <div className='deleted-account-info-modal'>
        <div className='deleted-account-info-modal-header'>
          <h3>Deleted Account Information</h3>
          <button
            className='deleted-account-info-modal-close'
            onClick={onClose}
            aria-label='Close modal'
          >
            <FaTimes />
          </button>
        </div>

        <div className='deleted-account-info-modal-content'>
          <div className='deleted-account-info-child-details'>
            <h4>Account Details</h4>
            <div className='account-details-grid'>
              <div className='account-detail-item'>
                <span className='detail-label'>Account Name:</span>
                <span className='detail-value'>
                  {childData.firstName} {childData.lastName}
                </span>
              </div>
              <div className='account-detail-item'>
                <span className='detail-label'>Account Created:</span>
                <span className='detail-value'>
                  {formatDate(childData.accountCreated)}
                </span>
              </div>
              <div className='account-detail-item'>
                <span className='detail-label'>Account Status:</span>
                <span className='detail-value status-deleted'>Deleted</span>
              </div>
              <div className='account-detail-item'>
                <span className='detail-label'>Deleted On:</span>
                <span className='detail-value'>
                  {formatDate(childData.deletedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* <div className='deleted-account-info-timeline'>
            <div className='deleted-account-info-timeline-item'>
              <FaCalendarAlt className='timeline-icon warning' />
              <div className='timeline-content'>
                <h5>Permanent Deletion</h5>
                <p>{formatDate(childData.willBeDeleted)}</p>
              </div>
            </div>
          </div> */}

          <div className='deleted-account-info-warning'>
            <div className='warning-content'>
              <FaExclamationTriangle className='warning-icon' />
              <div>
                <h5>Important Notice</h5>
                <p>
                  This account will be permanently deleted on{' '}
                  <strong>{formatDate(childData.willBeDeleted)}</strong>. All
                  associated data will be permanently removed and cannot be
                  recovered.
                </p>
              </div>
            </div>
          </div>

          <div className='deleted-account-info-contact'>
            <h5>Need Help?</h5>
            <p>
              If you believe this deletion was made in error or need assistance,
              please contact Digipalz support immediately.
            </p>
            <div className='contact-options'>
              <button className='contact-support-btn'>
                <FaEnvelope />
                Contact Support
              </button>
              {/* <button className='request-inquiry-btn'>Request Inquiry</button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeletedAccountInfoModal
