import './ReportModal.css'
import { FaTimes, FaDownload } from 'react-icons/fa'
import { useProtection } from '@/context/ProtectionContext'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas/dist/html2canvas.min'
import { useState, useEffect, useRef } from 'react'
import ProtectionPlanTemplate from '../../my-protection-plan/ProtectionPlanTemplate'

const ReportModal = ({ isOpen, onClose, title = 'Protection Plan' }) => {
  const { selectedReport } = useProtection()
  const [parsedReport, setParsedReport] = useState(null)
  const protectionPlanRef = useRef(null)

  useEffect(() => {
    if (selectedReport) {
      try {
        if (typeof selectedReport.incidentReport === 'string') {
          setParsedReport(JSON.parse(selectedReport.incidentReport))
        } else {
          setParsedReport(selectedReport.incidentReport)
        }
      } catch (error) {
        console.error('Error parsing report:', error)
      }
    }
  }, [selectedReport])

  const handleDownload = async () => {
    if (protectionPlanRef.current) {
      try {
        // Add CSS for page breaks
        const style = document.createElement('style')
        style.textContent = `
          .pdf-friendly {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .pdf-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 20px !important;
          }
          .pdf-step {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 15px !important;
          }
        `
        document.head.appendChild(style)

        // Create a clone of the content to avoid modifying the actual DOM
        const contentClone = protectionPlanRef.current.cloneNode(true)
        contentClone.style.backgroundColor = '#8B5CF6'
        contentClone.style.padding = '20px'
        contentClone.style.width = '800px' // Fixed width for better PDF quality

        // Convert the content to canvas
        const canvas = await html2canvas(contentClone, {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#8B5CF6'
        })

        // Calculate dimensions
        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4')

        // Add the content image
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          0,
          imgWidth,
          imgHeight
        )

        // Save the PDF
        pdf.save(`${parsedReport.metadata.for}_Protection_Plan.pdf`)

        // Clean up the added style
        document.head.removeChild(style)
      } catch (error) {
        console.error('PDF generation failed:', error)
      }
    }
  }

  if (!parsedReport) return null
  if (!isOpen) return null

  // Helper functions to format data for the ProtectionPlanTemplate component
  const formatBlockingInstructions = (instructions) => {
    return instructions || []
  }

  const formatTrustedAdultsList = (steps) => {
    return (
      steps || [
        'A parent, teacher, or guidance counselor',
        'School counselor',
        'Trusted family member'
      ]
    )
  }

  const formatConversationStarters = (content) => {
    return content || []
  }

  const formatSafetyReminders = (content) => {
    return content || []
  }

  const formatEmergencyResources = (resources) => {
    return resources || []
  }

  return (
    <div className='report-modal-overlay'>
      <div
        className='report-modal-content'
        style={{ maxWidth: '900px', width: '90vw' }}
      >
        {/* New Header Design */}
        <div
          style={{
            position: 'relative',
            borderRadius: '12px 12px 0 0',
            overflow: 'hidden'
          }}
        >
          {/* Digipalz Header */}
          <div
            style={{
              background: '#a3e635',
              color: '#000',
              padding: '25px 30px',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <h1
              style={{
                fontSize: '2.5em',
                margin: '0',
                fontWeight: '800',
                letterSpacing: '-1px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}
            >
              Digipalz
            </h1>

            {/* Action Buttons - Positioned in top right */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <button
                onClick={handleDownload}
                title='Download PDF'
                style={{
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'opacity 0.2s',
                  minWidth: '40px',
                  height: '40px'
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                <FaDownload />
              </button>
              <button
                onClick={onClose}
                style={{
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'opacity 0.2s',
                  minWidth: '40px',
                  height: '40px'
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        {/* Protection Plan Content */}
        <div ref={protectionPlanRef}>
          <ProtectionPlanTemplate
            studentName={parsedReport.metadata.for || ''}
            platform={parsedReport.metadata.platform || ''}
            incidentStartDate={
              parsedReport.metadata.dateOfIncident.split(' - ')[0] ||
              parsedReport.metadata.dateOfIncident
            }
            incidentEndDate={
              parsedReport.metadata.dateOfIncident.split(' - ')[1] ||
              parsedReport.metadata.dateOfIncident
            }
            dateReported={parsedReport.metadata.dateReported}
            concernSummary={parsedReport.metadata.concern}
            threatDetected={parsedReport.metadata.threatDetected}
            incidentSummaryParagraph={parsedReport.incidentSummary}
            perpetratorName={
              parsedReport.metadata.concern.split(' from ')[1] || 'the person'
            }
            perpetratorPossessive={
              parsedReport.metadata.concern.includes('from') ? 'Their' : 'Their'
            }
            blockingInstructions={formatBlockingInstructions(
              parsedReport.sections.platformInstructions?.instructions || []
            )}
            trustedAdultsList={formatTrustedAdultsList(
              parsedReport.sections.immediateSafetySteps?.steps || []
            )}
            conversationStarters={formatConversationStarters(
              parsedReport.sections.whatToSay?.content || []
            )}
            safetyReminders={formatSafetyReminders(
              parsedReport.sections.safetyReminders?.reminders || []
            )}
            emergencyResources={formatEmergencyResources(
              parsedReport.sections.emergencyResources?.resources || []
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default ReportModal
