import React, { useState, useEffect } from 'react'
import './PDFModal.css'
import {
  FaDownload,
  FaTimes,
  FaSearchPlus,
  FaSearchMinus,
  FaPrint
} from 'react-icons/fa'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

const PDFModal = ({
  isOpen,
  onClose,
  pdfUrl,
  title = 'PDF Document',
  downloadFileName = 'document.pdf'
}) => {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('pdf-modal-backdrop')) {
      onClose()
    }
  }

  // Close modal with Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setZoomLevel(100)
      setCurrentPage(1)
    }
  }, [isOpen])

  // Handle download
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = downloadFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Handle print
  const handlePrint = () => {
    const iframe = document.querySelector('.pdf-viewer-iframe')
    if (iframe) {
      try {
        iframe.contentWindow.print()
      } catch (error) {
        // Fallback: open PDF in new window for printing
        window.open(pdfUrl, '_blank')
      }
    }
  }

  // Zoom controls
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 20, 300))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 20, 30))
  }

  // Page navigation (placeholder for future implementation)
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  if (!isOpen) return null

  return (
    <div className='pdf-modal-backdrop' onClick={handleBackdropClick}>
      <div className='pdf-modal-container'>
        {/* Modal Header */}
        <div className='pdf-modal-header'>
          <div className='pdf-modal-title-section'>
            <h2 className='pdf-modal-title'>{title}</h2>
          </div>

          {/* Controls */}
          <div className='pdf-modal-controls'>
            {/* Page Navigation */}
            <div className='pdf-control-group'>
              <button
                className='pdf-control-btn'
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                title='Previous Page'
              >
                <IoChevronBack />
              </button>
              <button
                className='pdf-control-btn'
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                title='Next Page'
              >
                <IoChevronForward />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className='pdf-control-group'>
              <button
                className='pdf-control-btn'
                onClick={zoomOut}
                disabled={zoomLevel <= 30}
                title='Zoom Out'
              >
                <FaSearchMinus />
              </button>
              <span className='pdf-zoom-display'>{zoomLevel}%</span>
              <button
                className='pdf-control-btn'
                onClick={zoomIn}
                disabled={zoomLevel >= 300}
                title='Zoom In'
              >
                <FaSearchPlus />
              </button>
            </div>

            {/* Action Controls */}
            <div className='pdf-control-group'>
              <button
                className='pdf-control-btn'
                onClick={handlePrint}
                title='Print'
              >
                <FaPrint />
              </button>
              <button
                className='pdf-control-btn pdf-download-btn'
                onClick={handleDownload}
                title='Download'
              >
                <FaDownload />
              </button>
            </div>

            {/* Close Button */}
            <button
              className='pdf-modal-close-btn'
              onClick={onClose}
              title='Close'
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className='pdf-modal-content'>
          <div className='pdf-viewer-wrapper'>
            {pdfUrl ? (
              <div
                className='pdf-container'
                style={{
                  transform: `scale(${zoomLevel / 100}) translate3d(0, 0, 0)`,
                  transformOrigin: 'top center'
                }}
              >
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&page=${currentPage}&view=FitH`}
                  className='pdf-viewer-iframe'
                  title={title}
                  allow='fullscreen'
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                />
              </div>
            ) : (
              <div className='pdf-error-message'>
                <p>PDF could not be loaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Loading overlay */}
        <div className='pdf-loading-overlay'>
          <div className='pdf-spinner'></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    </div>
  )
}

export default PDFModal
