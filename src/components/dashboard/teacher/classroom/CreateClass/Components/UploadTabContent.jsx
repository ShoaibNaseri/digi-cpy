import { FaFileCsv } from 'react-icons/fa'
import { useRef } from 'react'

/**
 * Content for the upload tab
 */
const UploadTabContent = ({ onFileUpload }) => {
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        onFileUpload(file)
      } else {
        alert('Please select a CSV file')
      }
    }
    // Reset the input so the same file can be selected again
    event.target.value = ''
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.currentTarget.classList.add('dragover')
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.currentTarget.classList.remove('dragover')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.currentTarget.classList.remove('dragover')
    
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        onFileUpload(file)
      } else {
        alert('Please select a CSV file')
      }
    }
  }

  return (
    <div className='tcr-csv-upload-area'>
      <div 
        className='tcr-csv-upload-container'
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className='tcr-csv-icon'>
          <FaFileCsv size={48} color='#94A3B8' />
        </div>

        <div className='tcr-csv-instructions'>
          Drag and drop your CSV file here or
        </div>

        <button
          type='button'
          className='tcr-browse-files-button'
          onClick={handleBrowseClick}
        >
          Browse Files
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className='tcr-csv-format-hint'>
          Your CSV should include columns for first name, last name, and student
          ID (optional)
        </div>
      </div>

      <div className='tcr-template-link-container'>
        <span className='tcr-need-template'>Need a template?</span>
        <a href='#' className='tcr-download-link'>
          Download CSV Template
        </a>
      </div>
    </div>
  )
}

export default UploadTabContent
