import './SupportChatBubble.css'
import { maskCurseWords } from '@/utils/textModeration'
import ReactMarkdown from 'react-markdown'
import Avatar from '@/components/common/avatar/Avatar'
import { useMemo } from 'react'
import PersonalProtectionPlan from '../my-protection-plan/ProtectionPlanTemplate'

const SupportChatBubble = ({
  message,
  image,
  images = [],
  isUser,
  userName,
  evidenceImages = []
}) => {
  const moderatedMessage = maskCurseWords(message)

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

  // Parse metadata if present
  const parsedReport = useMemo(() => {
    try {
      if (typeof message === 'string' && message.includes('"metadata":')) {
        const parsedData = JSON.parse(message)
        return parsedData
      }
      return null
    } catch (error) {
      console.error('Error parsing metadata:', error)
      return null
    }
  }, [message])

  // Use useMemo to prevent unnecessary recalculations
  const { isImageUrl, validImages } = useMemo(() => {
    // Handle single image
    const isImageUrl =
      image && (image.startsWith('http://') || image.startsWith('https://'))

    // Handle multiple images
    let validImages = []
    if (Array.isArray(images)) {
      validImages = images.filter(
        (url) =>
          typeof url === 'string' &&
          (url.startsWith('http://') || url.startsWith('https://'))
      )
    }

    return { isImageUrl, validImages }
  }, [image, images])

  // Only show multiple images if we have valid ones
  const hasMultipleImages = validImages.length > 0

  // If we have metadata and it's a protection plan, render the template
  if (parsedReport?.metadata?.title === 'Personal Protection Plan') {
    return (
      <div
        className={`support-chat__bubble-container ${
          isUser ? 'support-chat__bubble-container-user' : ''
        }`}
      >
        {isUser ? (
          <Avatar name={userName} size={42} />
        ) : !isImageUrl ? (
          <img
            src={image}
            alt={moderatedMessage}
            className='support-chat__avatar'
          />
        ) : null}
        <div className='support-chat__bubble-content-protection-plan'>
          <PersonalProtectionPlan
            studentName={parsedReport.metadata.for}
            platform={parsedReport.metadata.platform}
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
            evidenceImages={evidenceImages || []}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`support-chat__bubble-container ${
        isUser ? 'support-chat__bubble-container-user' : ''
      }`}
    >
      {isUser ? (
        <Avatar name={userName} size={42} />
      ) : !isImageUrl ? (
        <img
          src={image}
          alt={moderatedMessage}
          className='support-chat__avatar'
        />
      ) : null}
      <div className='support-chat__bubble-content'>
        <div className='support-chat__markdown-content'>
          {/* Display text message if present */}
          {moderatedMessage && (
            <ReactMarkdown>{moderatedMessage}</ReactMarkdown>
          )}

          {/* Display single image (backward compatibility) */}
          {isImageUrl && !hasMultipleImages && (
            <a
              href={image}
              target='_blank'
              rel='noopener noreferrer'
              className='support-chat__uploaded-image-link'
              title='Click to view full image'
            >
              <img
                src={image}
                alt='Uploaded evidence'
                className='support-chat__uploaded-image'
              />
            </a>
          )}

          {/* Display multiple images */}
          {hasMultipleImages && (
            <div className='support-chat__multiple-images'>
              {validImages.map((imageUrl, index) => (
                <a
                  key={`${imageUrl}-${index}`}
                  href={imageUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='support-chat__uploaded-image-link'
                  title='Click to view full image'
                >
                  <img
                    src={imageUrl}
                    alt={`Uploaded image ${index + 1}`}
                    className='support-chat__uploaded-image'
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportChatBubble
