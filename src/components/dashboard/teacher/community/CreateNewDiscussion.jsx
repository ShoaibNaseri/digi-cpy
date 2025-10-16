// CreateNewDiscussion.js
import React, { useState } from 'react'
import './CreateNewDiscussion.css'
import { createDiscussion } from '@/services/teacher/discussionService'
import { useAuth } from '@/context/AuthContext'

const CreateNewDiscussion = ({ onCancel, onSubmit }) => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    tags: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id.replace('discussion-', '')]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.title.trim()) {
      setError('Please enter a title')
      return
    }

    if (!formData.category) {
      setError('Please select a category')
      return
    }

    if (!formData.content.trim()) {
      setError('Please enter content')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the discussion in Firebase
      const discussionId = await createDiscussion(formData, currentUser.uid)

      // Call the onSubmit callback
      onSubmit({
        ...formData,
        id: discussionId
      })
    } catch (error) {
      console.error('Error creating discussion:', error)
      setError('Failed to create discussion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='cnd-container'>
      <div className='cnd-header'>
        <button className='cnd-back-button' onClick={onCancel}>
          <span className='cnd-back-icon'>←</span>
        </button>
        <h1 className='cnd-title'>Create New Discussion</h1>
      </div>

      {error && <div className='cnd-error-message'>{error}</div>}

      <form className='cnd-form' onSubmit={handleSubmit}>
        <div className='cnd-form-group'>
          <label htmlFor='discussion-title' className='cnd-label'>
            Title
          </label>
          <input
            type='text'
            id='discussion-title'
            className='cnd-input'
            placeholder='Enter discussion title'
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className='cnd-form-group'>
          <label htmlFor='discussion-category' className='cnd-label'>
            Category
          </label>
          <select
            id='discussion-category'
            className='cnd-select'
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value='' disabled>
              Select a category
            </option>
            <option value='Teaching Tips'>Teaching Tips</option>
            <option value='Resources'>Resources</option>
            <option value='EdTech'>EdTech</option>
            <option value='Remote Learning'>Remote Learning</option>
          </select>
        </div>

        <div className='cnd-form-group'>
          <label htmlFor='discussion-content' className='cnd-label'>
            Content
          </label>
          <div className='cnd-editor-toolbar'>
            <button type='button' className='cnd-toolbar-btn cnd-bold-btn'>
              B
            </button>
            <button type='button' className='cnd-toolbar-btn cnd-italic-btn'>
              I
            </button>
            <button type='button' className='cnd-toolbar-btn cnd-list-btn'>
              •
            </button>
            <button type='button' className='cnd-toolbar-btn cnd-link-btn'>
              🔗
            </button>
            <button type='button' className='cnd-toolbar-btn cnd-image-btn'>
              🖼️
            </button>
          </div>
          <textarea
            id='discussion-content'
            className='cnd-textarea'
            placeholder='Write your discussion content here...'
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>

        <div className='cnd-form-group'>
          <label htmlFor='discussion-tags' className='cnd-label'>
            Tags
          </label>
          <input
            type='text'
            id='discussion-tags'
            className='cnd-input'
            placeholder='Add tags separated by commas'
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        <div className='cnd-actions'>
          <button
            type='submit'
            className='cnd-submit-btn'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateNewDiscussion
