import { useState } from 'react'
import { useSupportChat } from '../../../context/SupportChatContext'
import './ConversationSidebar.css'
import { formatDistanceToNow } from 'date-fns'
import { LuMessageSquarePlus, LuX } from 'react-icons/lu'

const ConversationSidebar = ({ isOpen, onClose }) => {
  const {
    conversations,
    currentConversationId,
    createNewConversation,
    switchConversation,
    setHasProtectionPlan
  } = useSupportChat()
  const [isCreating, setIsCreating] = useState(false)

  const handleNewConversation = async () => {
    setIsCreating(true)
    try {
      await createNewConversation()
      setHasProtectionPlan(false)
      onClose()
    } catch (error) {
      console.error('Error creating new conversation:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSwitchConversation = async (conversationId) => {
    await switchConversation(conversationId)
    setHasProtectionPlan(false)
    onClose()
  }

  const formatDate = (date) => {
    if (!date) return ''
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return formatDistanceToNow(dateObj, { addSuffix: true })
  }

  return (
    <>
      <div
        className={`conversation-sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div className={`conversation-sidebar ${isOpen ? 'open' : ''}`}>
        <div className='conversation-sidebar__header'>
          <h3>Conversations</h3>
          <button
            className='conversation-sidebar__close-btn'
            onClick={onClose}
            aria-label='Close sidebar'
          >
            <LuX size={20} />
          </button>
        </div>

        <div className='conversation-sidebar__content'>
          <button
            className='conversation-sidebar__new-btn'
            onClick={handleNewConversation}
            disabled={isCreating}
          >
            <LuMessageSquarePlus size={16} />
            {isCreating ? 'Creating...' : 'New Conversation'}
          </button>

          <div className='conversation-sidebar__list'>
            {conversations.length === 0 ? (
              <div className='conversation-sidebar__empty'>
                <p>No conversations yet</p>
                <small>Start a new conversation to begin chatting</small>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-sidebar__item ${
                    conversation.id === currentConversationId ? 'active' : ''
                  }`}
                  onClick={() => handleSwitchConversation(conversation.id)}
                >
                  <div className='conversation-sidebar__item-content'>
                    <h4 className='conversation-sidebar__item-title'>
                      {conversation.title || 'New Conversation'}
                    </h4>
                    <div className='conversation-sidebar__item-meta'>
                      <span className='conversation-sidebar__item-date'>
                        {formatDate(conversation.updatedAt)}
                      </span>
                      {conversation.messageCount > 0 && (
                        <span className='conversation-sidebar__item-count'>
                          {conversation.messageCount} messages
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ConversationSidebar
