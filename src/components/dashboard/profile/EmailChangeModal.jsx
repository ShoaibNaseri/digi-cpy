import { useState } from 'react'
import './EmailChangeModal.css'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'

const EmailChangeModal = ({
  isOpen,
  onClose,
  onConfirm,
  newEmail,
  isProcessing
}) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  return (
    <div className='email-modal__overlay'>
      <div className='email-modal'>
        <h2>Confirm Email Change</h2>
        <p>
          You are about to change your email to: <strong>{newEmail}</strong>
        </p>
        <p>Please enter your password to confirm this change:</p>
        <div className='email-modal__password-field'>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter your password'
            className='email-modal__input'
          />
          <button
            type='button'
            className='email-modal__toggle-password'
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
          </button>
        </div>
        <div className='email-modal__actions'>
          <button
            className='email-modal__button email-modal__button--cancel'
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className='email-modal__button email-modal__button--confirm'
            onClick={() => onConfirm(password)}
            disabled={!password || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailChangeModal
