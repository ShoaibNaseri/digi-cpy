import './SupportChat.css'
import { images } from '../../../config/images'
import SupportChatBubble from './SupportChatBubble'
import SupportChatActions from './SupportChatActions'
import ConversationSidebar from './ConversationSidebar'
import { useSupportChat } from '../../../context/SupportChatContext'
import { useEffect, useRef, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { FaHistory } from 'react-icons/fa'
import { LuMessageSquareMore } from 'react-icons/lu'

const SupportChat = () => {
  const { currentUser } = useAuth()
  const {
    messages,
    isOpenAIConnected,
    isLoading,
    isGeneratingProtectionPlan,
    createNewConversation
  } = useSupportChat()
  const messagesEndRef = useRef(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleNewConversation = async () => {
    await createNewConversation()
  }

  const handleHistoryClick = () => {
    setIsSidebarOpen(true)
  }

  const extractMessageText = (msgObj) => {
    if (!msgObj) return ''
    if (typeof msgObj === 'string') return msgObj
    if (typeof msgObj !== 'object') return ''

    // Handle nested message structure with aiResponse object
    if (msgObj.message?.aiResponse?.aiResponse) {
      return msgObj.message.aiResponse.aiResponse
    }

    // Handle message with direct aiResponse property
    if (msgObj.aiResponse?.aiResponse) {
      return msgObj.aiResponse.aiResponse
    }

    // Handle nested message structure
    if (msgObj.message && typeof msgObj.message === 'object') {
      // If it's a protection plan
      if (msgObj.message.incidentReport) {
        return JSON.stringify(msgObj.message.incidentReport)
      }
      // If it's an AI response with dataObj
      if (msgObj.message.dataObj) {
        return msgObj.message.response || msgObj.message.aiResponse || ''
      }
      // If it's a direct AI response
      return msgObj.message.aiResponse || msgObj.message.response || ''
    }

    // Handle protection plan directly
    if (msgObj.incidentReport) {
      return JSON.stringify(msgObj.incidentReport)
    }

    // Handle direct message object
    if (msgObj.dataObj) {
      return msgObj.response || msgObj.aiResponse || ''
    }

    // Handle direct aiResponse or response
    return msgObj.aiResponse || msgObj.response || msgObj.content || ''
  }

  const { protectionPlanMessageIndex, evidenceImages } = useMemo(() => {
    const lastProtectionPlanIndex = messages.findIndex((msg, index) => {
      const messageText = extractMessageText(msg.message)

      const isProtectionPlan =
        msg.sender !== 'User' &&
        messageText.includes('Personal Protection Plan')

      const laterPlanExists = messages.slice(index + 1).some((laterMsg) => {
        const laterText = extractMessageText(laterMsg.message)
        return (
          laterMsg.sender !== 'User' &&
          laterText.includes('Personal Protection Plan')
        )
      })

      return isProtectionPlan && !laterPlanExists
    })

    if (lastProtectionPlanIndex === -1) {
      return { protectionPlanMessageIndex: -1, evidenceImages: [] }
    }

    const relevantMessages = messages.slice(0, lastProtectionPlanIndex)

    const collectedImages = relevantMessages
      .filter((msg) => msg.sender === 'User')
      .reduce((acc, msg) => {
        const msgImages = Array.isArray(msg.images) ? msg.images : []
        return [...acc, ...msgImages]
      }, [])
      .filter((imageUrl) => {
        const isValid =
          typeof imageUrl === 'string' &&
          Boolean(imageUrl) &&
          (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))

        return isValid
      })

    return {
      protectionPlanMessageIndex: lastProtectionPlanIndex,
      evidenceImages: collectedImages
    }
  }, [messages])

  return (
    <div className='support-chat__container'>
      <div className='support-chat__container-header'>
        <div className='support-chat__header-left'>
          <img
            src={images.supportMrAzabukiImage}
            alt='Mr. Azabuki Support Assistant'
          />
          <div className='support-chat__container-text'>
            <h4>Mr. Azabuki</h4>
            <small>AI Support Assistant</small>
            <p>
              <span
                className={`online-indicator ${
                  isOpenAIConnected ? '' : 'offline'
                }`}
              ></span>
              {isOpenAIConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className='support-chat__header-spacer' />
        <div className='support-chat__header-icons'>
          <button
            className='support-chat__icon-btn'
            title='New Conversation'
            onClick={handleNewConversation}
            type='button'
          >
            <LuMessageSquareMore size={22} />
          </button>
          <button
            className='support-chat__icon-btn'
            title='Conversation History'
            onClick={handleHistoryClick}
            type='button'
          >
            <FaHistory size={22} />
          </button>
        </div>
      </div>

      <div className='support-chat__container-messages'>
        {messages.map((message, idx) => {
          const isProtectionPlan = idx === protectionPlanMessageIndex - 1
          const messageContent = extractMessageText(message.message)

          return (
            <SupportChatBubble
              key={message.id}
              message={messageContent}
              image={message.image}
              images={message.images}
              isUser={message.sender === 'User'}
              userName={currentUser.firstName}
              evidenceImages={evidenceImages}
            />
          )
        })}

        {isGeneratingProtectionPlan && isLoading && (
          <div className='support-chat__bubble-container'>
            <img
              src={images.supportMrAzabukiImage}
              alt='AI Assistant'
              className='support-chat__avatar'
            />
            <div className='support-chat__bubble-content'>
              <div className='support-chat__protection-plan-loading'>
                <div className='support-chat__protection-plan-header'>
                  <span className='support-chat__protection-plan-icon'>🛡️</span>
                  <span className='support-chat__protection-plan-title'>
                    Generating Protection Plan
                  </span>
                </div>
                <p className='support-chat__protection-plan-message'>
                  I am currently generating a personal protection plan for you.
                  This may take a few minutes.
                </p>
                <div className='support-chat__protection-plan-progress'>
                  <div className='support-chat__progress-bar'>
                    <div className='support-chat__progress-fill'></div>
                  </div>
                  <span className='support-chat__progress-text'>
                    Analyzing your information...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && !isGeneratingProtectionPlan && (
          <div className='support-chat__bubble-container'>
            <img
              src={images.supportMrAzabukiImage}
              alt='AI Assistant'
              className='support-chat__avatar'
            />
            <div className='support-chat__bubble-content'>
              <div className='support-chat__typing-animation'>
                <div className='support-chat__typing-dot'></div>
                <div className='support-chat__typing-dot'></div>
                <div className='support-chat__typing-dot'></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      <SupportChatActions />

      <ConversationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  )
}

export default SupportChat
