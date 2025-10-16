import { useState, useRef, useEffect } from 'react'
import './ContactSupport.css'
import { sendEmail } from '@/services/emailService'
import { useAuth } from '@/context/AuthContext'
import email from '@/config/email'
import attachIcon from '@/assets/icons/attach.png'
import {
  FaQuestionCircle,
  FaFileAlt,
  FaComment,
  FaChevronDown
} from 'react-icons/fa'

// Custom form components with built-in icon support
const IconInput = ({
  icon,
  placeholder,
  value,
  onChange,
  required,
  id,
  type = 'text'
}) => (
  <div className='icon-input-wrapper'>
    <div className='icon-input-icon'>{icon}</div>
    <input
      type={type}
      id={id}
      className='icon-input-field'
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
)

const IconTextarea = ({ icon, placeholder, value, onChange, required, id }) => (
  <div className='icon-input-wrapper'>
    <div className='icon-input-icon icon-input-msg'>{icon}</div>
    <textarea
      id={id}
      className='icon-input-field'
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
)

const IconSelect = ({ icon, value, onChange, options, id }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectClick = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (optionValue) => {
    onChange({ target: { id, value: optionValue } })
    setIsOpen(false)
  }

  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className='icon-select-wrapper' ref={selectRef}>
      <div
        className='icon-input-wrapper icon-select-input'
        onClick={handleSelectClick}
      >
        <div className='icon-input-icon'>{icon}</div>
        <div className='icon-select-display'>
          {selectedOption ? selectedOption.label : 'Select an option'}
        </div>
        <div className='icon-select-arrow'>
          <FaChevronDown />
        </div>
      </div>

      {isOpen && (
        <div className='icon-select-dropdown'>
          {options.map((option) => (
            <div
              key={option.value}
              className={`icon-select-option ${
                option.value === value ? 'selected' : ''
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ContactSupport = () => {
  const { currentUser } = useAuth()

  // Form data state
  const [formData, setFormData] = useState({
    supportType: 'technical support',
    subject: '',
    message: ''
  })

  // File upload state
  const [files, setFiles] = useState([])

  // Submission status
  const [submitStatus, setSubmitStatus] = useState({
    submitting: false,
    success: false,
    error: null
  })

  const fileInputRef = useRef(null)

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      setFiles(fileArray)
    }
  }

  // Click on file upload area
  const handleDropzoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle drag and drop functionality
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      setFiles(fileArray)
    }
  }

  // Helper function: Convert files to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result.split(',')[1]) // Remove data:image/jpeg;base64, prefix
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.subject || !formData.message) {
      setSubmitStatus({
        submitting: false,
        success: false,
        error: 'Please fill in all required fields.'
      })
      return
    }

    setSubmitStatus({
      submitting: true,
      success: false,
      error: null
    })

    try {
      // Prepare file attachments
      const attachments = []

      if (files.length > 0) {
        // Check file count limit
        if (files.length > 5) {
          setSubmitStatus({
            submitting: false,
            success: false,
            error:
              'Maximum 5 files allowed. Please reduce the number of attachments.'
          })
          return
        }

        // Check file size (limit to 5MB per file)
        const maxSize = email.maxFileSize
        for (const file of files) {
          if (file.size > maxSize) {
            setSubmitStatus({
              submitting: false,
              success: false,
              error: `File ${file.name} exceeds the 5MB size limit. Please reduce file size.`
            })
            return
          }
        }

        // Process file attachments
        for (const file of files) {
          try {
            // Convert file to Base64
            const base64File = await convertToBase64(file)

            attachments.push({
              name: file.name,
              data: base64File,
              type: file.type
            })
          } catch (error) {
            console.error('Error converting file to base64:', error)
            setSubmitStatus({
              submitting: false,
              success: false,
              error: `Failed to process file ${file.name}. Please try again.`
            })
            return
          }
        }
      }

      // Use the updated sendEmail service with proper support type routing
      const response = await sendEmail({
        to_email: currentUser.email,
        subject: `[${formData.supportType}] ${formData.subject}`,
        message: `Support Type: ${formData.supportType}\n\n${formData.message}`,
        attachments: attachments
      })

      console.log('Email sent successfully:', response)

      // Reset form
      setFormData({
        supportType: 'technical support',
        subject: '',
        message: ''
      })
      setFiles([])

      // Update success status
      setSubmitStatus({
        submitting: false,
        success: true,
        error: null
      })

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus((prev) => ({
          ...prev,
          success: false
        }))
      }, 5000)
    } catch (error) {
      console.error('Failed to send email:', error)

      // Update error status
      setSubmitStatus({
        submitting: false,
        success: false,
        error: error.message || 'Failed to send email. Please try again later.'
      })
    }
  }

  const supportTypeOptions = [
    { value: 'technical support', label: 'Technical Support' },
    { value: 'customer support', label: 'Customer Support' },
    { value: 'feedback', label: 'Feedback' }
  ]

  return (
    <div className='contact-support'>
      <h3 className='contact-support-title'>Contact Support Form </h3>
      <form className='contact-support-form' onSubmit={handleSubmit}>
        <div className='contact-support-form-row'>
          <div className='contact-support-form-group'>
            <label htmlFor='supportType' className='contact-support-form-label'>
              Support Type
            </label>
            <IconSelect
              icon={<FaQuestionCircle size={24} color='#4B5563' />}
              value={formData.supportType}
              onChange={handleInputChange}
              options={supportTypeOptions}
              id='supportType'
            />
          </div>

          <div className='contact-support-form-group'>
            <label htmlFor='subject' className='contact-support-form-label'>
              Subject
            </label>
            <IconInput
              icon={<FaFileAlt size={24} color='#4B5563' />}
              placeholder='What can we help you with?'
              value={formData.subject}
              onChange={handleInputChange}
              required
              id='subject'
            />
          </div>
        </div>

        <div className='contact-support-form-group'>
          <label htmlFor='message' className='contact-support-form-label'>
            Message
          </label>
          <IconTextarea
            icon={<FaComment size={24} color='#4B5563' />}
            placeholder='Enter Message...'
            value={formData.message}
            onChange={handleInputChange}
            required
            id='message'
          />
        </div>

        <div className='contact-support-form-group'>
          <label className='contact-support-form-label'>
            Attachment (Max 5 files, 5MB each)
          </label>
          <div
            className='contact-support-form-attachments-dropzone'
            onClick={handleDropzoneClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            role='button'
            tabIndex='0'
            aria-label='Upload files'
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleDropzoneClick()
              }
            }}
          >
            <input
              ref={fileInputRef}
              type='file'
              id='file-upload'
              style={{ display: 'none' }}
              multiple
              onChange={handleFileChange}
            />
            <img
              src={attachIcon}
              alt='Upload files'
              className='contact-support-upload-icon'
            />
            <p className='contact-support-upload-text'>
              Drop files here or click to upload
            </p>
            <p className='contact-support-upload-formats'>
              JPEG, PNG, PDF and MP4 formats up to 50MB.
            </p>

            {/* Display uploaded files */}
            {files.length > 0 && (
              <div className='contact-support-uploaded-files'>
                <p className='contact-support-uploaded-files-title'>
                  Selected files:
                </p>
                <ul className='contact-support-uploaded-files-list'>
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className='contact-support-uploaded-file-item'
                    >
                      {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className='contact-support-form-actions'>
          <button
            type='button'
            className='contact-support-form-cancel'
            onClick={() => {
              setFormData({
                supportType: 'technical support',
                subject: '',
                message: ''
              })
              setFiles([])
            }}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='contact-support-form-submit'
            disabled={submitStatus.submitting}
          >
            {submitStatus.submitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {/* Show success/error messages */}
        {submitStatus.success && (
          <div className='contact-support-success-message'>
            Your message has been sent successfully! We'll get back to you soon.
          </div>
        )}

        {submitStatus.error && (
          <div className='contact-support-error-message'>
            {submitStatus.error}
          </div>
        )}
      </form>
    </div>
  )
}

export default ContactSupport
