import './MyProtectionPlanModal.css'
import { FaTimes, FaDownload } from 'react-icons/fa'
import { useMyProtectionPlan } from '@/context/MyProtectionPlanContext'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas/dist/html2canvas.min'
import { useState, useEffect, useRef } from 'react'
import ProtectionPlanTemplate from './ProtectionPlanTemplate'

const MyProtectionPlanModal = ({
  isOpen,
  onClose,
  title = 'My Protection Plan'
}) => {
  const { selectedReport } = useMyProtectionPlan()
  const [parsedReport, setParsedReport] = useState(null)
  const protectionPlanRef = useRef(null)
  const modalContentRef = useRef(null) // Add new ref for entire modal content

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
    if (modalContentRef.current) {
      try {
        // Create a temporary container
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.top = '-9999px'
        document.body.appendChild(tempContainer)

        // Clone the content
        const contentClone = modalContentRef.current.cloneNode(true)

        // Remove the close and download buttons from the clone
        const actionButtons = contentClone.querySelectorAll('button')
        actionButtons.forEach((button) => button.remove())

        // Apply necessary styles to the clone
        contentClone.style.backgroundColor = '#fff'
        contentClone.style.padding = '20px'
        contentClone.style.width = '800px'
        contentClone.style.margin = '0'
        contentClone.style.maxHeight = 'none'
        contentClone.style.height = 'auto'
        contentClone.style.overflow = 'visible'
        contentClone.style.position = 'static'

        // Ensure all child elements are visible
        Array.from(contentClone.getElementsByTagName('*')).forEach(
          (element) => {
            element.style.maxHeight = 'none'
            element.style.overflow = 'visible'
            element.style.height = 'auto'
            element.style.display =
              element.style.display === 'none' ? 'none' : 'block'
          }
        )

        // Add the clone to the temporary container
        tempContainer.appendChild(contentClone)

        // Wait for content to be fully rendered
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get the actual height of the content
        const contentHeight = contentClone.scrollHeight

        // Convert to canvas with improved settings
        const canvas = await html2canvas(contentClone, {
          scale: 2,
          useCORS: true,
          logging: true,
          allowTaint: true,
          backgroundColor: '#fff',
          windowWidth: 800,
          height: contentHeight,
          windowHeight: contentHeight,
          scrollY: -window.scrollY,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.getElementsByTagName('*')
            Array.from(elements).forEach((element) => {
              element.style.pageBreakInside = 'avoid'
              element.style.breakInside = 'avoid'
            })
          }
        })

        // Calculate dimensions for A4 page
        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Create PDF - handle multiple pages if content is too long
        const pdf = new jsPDF('p', 'mm', 'a4')
        let heightLeft = imgHeight
        let position = 0
        let pageNumber = 1

        // Add pages as needed
        while (heightLeft >= 0) {
          if (pageNumber > 1) {
            pdf.addPage()
          }

          pdf.addImage(
            canvas.toDataURL('image/jpeg', 1.0),
            'JPEG',
            0,
            position,
            imgWidth,
            imgHeight
          )

          heightLeft -= pageHeight
          position -= pageHeight
          pageNumber++
        }

        // Save the PDF
        pdf.save(`${parsedReport.metadata.for}_Protection_Plan.pdf`)

        // Clean up
        document.body.removeChild(tempContainer)
      } catch (error) {
        console.error('PDF generation failed:', error)
      }
    }
  }

  if (!isOpen) return null

  if (!parsedReport) return null

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
    <div className='my-protection-plan-modal-overlay'>
      <div
        ref={modalContentRef} // Add ref to the modal content div
        className='my-protection-plan-modal-content'
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

export default MyProtectionPlanModal
