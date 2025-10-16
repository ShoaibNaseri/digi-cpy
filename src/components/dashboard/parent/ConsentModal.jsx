import Modal from '../../common/modal/Modal'

const ConsentModal = ({
  isOpen,
  onClose,
  consentChecked,
  setConsentChecked,
  handleConsentSubmit
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Consent Required to Continue'
    >
      <div className='consent-modal-content'>
        <p>
          To comply with updated data protection standards, we are requesting
          your renewed consent to store and use your child's personal
          information for educational and platform-related purposes.
        </p>
        <div className='consent-checkbox-container'>
          <label className='consent-checkbox-label'>
            <input
              type='checkbox'
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
            />
            <span>
              I am the parent or legal guardian and consent to the collection,
              storage, and use of my child's personal information as outlined in
              the Privacy Policy.
            </span>
          </label>
        </div>
        <div className='consent-links'>
          <a
            href='/privacy-policy-en'
            target='_blank'
            rel='noopener noreferrer'
            className='privacy-policy-link'
          >
            View Privacy Policy
          </a>
        </div>
        <div className='consent-modal-actions'>
          <button onClick={onClose} className='consent-cancel-button'>
            Cancel
          </button>
          <button
            onClick={handleConsentSubmit}
            className='consent-confirm-button'
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConsentModal
