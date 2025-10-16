import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLawIncident } from '@/context/LawIncidentContext'
import ReactMarkdown from 'react-markdown'
import { FaDownload } from 'react-icons/fa'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas/dist/html2canvas.min'
import './LawIncidentModal.css'

const LawIncidentModal = () => {
  const { isModalOpen, closeModal, selectedDate, selectedReport } =
    useLawIncident()
  const contentRef = useRef(null)

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      // Restore scrolling when modal is closed
      document.body.style.overflow = 'auto'
    }
  }, [isModalOpen, closeModal])

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('law-incident-modal-overlay')) {
      closeModal()
    }
  }

  const handleDownload = async () => {
    if (contentRef.current) {
      try {
        // Create a clone of the content to avoid modifying the actual DOM
        const contentClone = contentRef.current.cloneNode(true)

        // Apply print styles to the clone
        contentClone.style.backgroundColor = 'white'
        contentClone.style.padding = '20px'
        contentClone.style.width = '800px' // Fixed width for better PDF quality

        // Convert the content to canvas
        const canvas = await html2canvas(contentClone, {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        })

        // Calculate dimensions
        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4')

        // Add title
        pdf.setFontSize(16)
        pdf.text('Law Incident Report', 105, 15, { align: 'center' })
        pdf.setFontSize(12)
        pdf.text(selectedDate, 105, 25, { align: 'center' })

        // Add the content image
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          35, // Start after the title
          imgWidth,
          imgHeight
        )

        // Save the PDF
        pdf.save(`Law_Incident_Report_${selectedDate}.pdf`)
      } catch (error) {
        console.error('PDF generation failed:', error)
      }
    }
  }

  if (!isModalOpen) return null

  const modalContent = (
    <div className='law-incident-modal-overlay' onClick={handleBackdropClick}>
      <div className='law-incident-modal-container'>
        <div className='law-incident-modal-header'>
          <h2 className='law-incident-modal-title'>{selectedDate}</h2>
          <div className='law-incident-modal-actions'>
            <button
              className='law-incident-modal-download'
              onClick={handleDownload}
              aria-label='Download report'
            >
              <FaDownload />
            </button>
            <button
              className='law-incident-modal-close'
              onClick={closeModal}
              aria-label='Close modal'
            >
              ×
            </button>
          </div>
        </div>
        <div className='law-incident-modal-content' ref={contentRef}>
          {selectedReport?.incidentReport ? (
            <ReactMarkdown>{selectedReport.incidentReport}</ReactMarkdown>
          ) : (
            <p className='law-incident-modal-empty'>
              No report content available.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default LawIncidentModal
