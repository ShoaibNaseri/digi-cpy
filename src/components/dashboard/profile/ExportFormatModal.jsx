import React from 'react'
import './ExportFormatModal.css'

const ExportFormatModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedFormat,
  setSelectedFormat,
  isLoading
}) => {
  if (!isOpen) return null

  return (
    <div className='export-modal-overlay'>
      <div className='export-modal'>
        <div className='export-modal-header'>
          <h2>Export Data</h2>
        </div>

        <div className='export-modal-content'>
          <p>Choose your preferred format to download your data:</p>

          <div className='select-container'>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className='format-select'
            >
              <option value='csv'>CSV (Comma Separated Values)</option>
              <option value='json'>JSON (JavaScript Object Notation)</option>
            </select>
          </div>
        </div>

        <div className='export-modal-footer'>
          <button
            className='export-secondary-button'
            disabled={isLoading}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className='export-primary-button'
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Export Data'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportFormatModal
