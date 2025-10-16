import React, { useState } from 'react'
import './DeleteAccount.css'
import { deleteUserAccount } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { HiTrash } from 'react-icons/hi'

const DeleteAccount = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenModal = () => {
    if (!currentUser) {
      setError('Error: User not logged in')
      return
    }
    
    setShowModal(true)
    setError('')
    setPassword('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setPassword('')
    setError('')
  }

  const handleConfirmDelete = async () => {
    if (!password) {
      setError('Please enter your password to confirm account deletion')
      return
    }

    try {
      setIsDeleting(true)
      
      // Try both possible ID properties based on current user structure
      const userId = currentUser.uid || currentUser.id
      
      if (!userId) {
        throw new Error('User ID not found')
      }
      
      await deleteUserAccount(userId, password)
      
      // Log the user out after successful deletion
      await logout()
      
      // Redirect to home page or confirmation page
      navigate('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      
      // Add specific handling for incorrect password errors
      if (error.code === 'auth/wrong-password' || 
          error.message?.includes('password') || 
          error.message?.includes('authentication failed')) {
        setError('Incorrect password. Please try again.')
      } else {
        setError(error.message || 'Failed to delete account. Please try again.')
      }
      
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button 
        className="delete-account-button profile-button danger"
        onClick={handleOpenModal}
      >
        <HiTrash className="button-icon" />
        Delete My Account
      </button>

      {showModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Account Deletion</h3>
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
            
            <div className="delete-modal-content">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to confirm"
                className="delete-account-password"
              />
              
              {error && <p className="delete-account-error">{error}</p>}
            </div>
            
            <div className="delete-modal-actions">
              <button 
                className="delete-modal-cancel" 
                onClick={handleCloseModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="delete-modal-confirm" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DeleteAccount