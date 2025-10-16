import React, { useEffect, useState } from 'react'
import sendIcon from '@/assets/game/mini_game/img/chat_moderator/send.png'
import emojiIcon from '@/assets/game/mini_game/img/chat_moderator/Emoji.png'
import { FaHandPointer } from 'react-icons/fa'

const ChatMessages = ({
  messages,
  getAvatar,
  selectedQuestion,
  randomizedOptions,
  selectedAnswer,
  showCorrectFeedback,
  showIncorrectFeedback,
  handleQuestionClick,
  handleAnswerClick,
  playMessageSound
}) => {
  const [visibleMessageIndices, setVisibleMessageIndices] = useState([])
  const [showArrowIndicator, setShowArrowIndicator] = useState(false)
  const [arrowTargetIndex, setArrowTargetIndex] = useState(null)
  const [
    hasShownIndicatorForFirstQuestion,
    setHasShownIndicatorForFirstQuestion
  ] = useState(false)

  // Effect to show messages with animation and sound
  useEffect(() => {
    if (messages.length === 0) return

    // Reset visible messages when messages change
    setVisibleMessageIndices([])
    setShowArrowIndicator(false)
    setArrowTargetIndex(null)
    // Don't reset hasShownIndicatorForFirstQuestion - keep it for the entire game

    // Find the first message with answers (isQuestion: true)
    const firstQuestionIndex = messages.findIndex((msg) => msg.isQuestion)

    // Show messages one by one with delay
    messages.forEach((_, index) => {
      setTimeout(() => {
        playMessageSound()
        setVisibleMessageIndices((prev) => [...prev, index])

        // Show arrow indicator after the first question message appears (only for the very first question of the game)
        if (
          index === firstQuestionIndex &&
          !hasShownIndicatorForFirstQuestion
        ) {
          setTimeout(() => {
            setShowArrowIndicator(true)
            setArrowTargetIndex(index)
            setHasShownIndicatorForFirstQuestion(true) // Mark that we've shown the indicator for the first question
          }, 1000) // Show arrow 1 second after the question message appears
        }
      }, index * 800 + 200) // 200ms initial delay + 800ms between each message
    })
  }, [messages]) // Removed playMessageSound from dependencies
  return (
    <main className='chat-area'>
      <div className='chat-area-title'>#Homeroom</div>
      <div className='chat-moderator-messages'>
        {messages.map((message, index) => {
          // Only render if this message index is visible
          if (!visibleMessageIndices.includes(index)) return null

          return (
            <div
              key={index}
              className={`chat-moderator-message message-slide-in ${
                message.isQuestion ? 'question-message' : ''
              }`}
            >
              <div className='chat-moderator-message-img'>
                <img
                  src={getAvatar(index)}
                  alt={`Avatar of ${message.sender}`}
                />
              </div>
              <div
                className='chat-moderator-message-text'
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuestionClick(message)
                  // Hide arrow indicator when user clicks on a message
                  setShowArrowIndicator(false)
                }}
              >
                <div className='chat-moderator-message-title-data'>
                  <div className='chat-moderator-message-title'>
                    <span className='text-green'>{message.sender}</span>
                  </div>
                  <div className='chat-moderator-message-date'>
                    <span className='text-gray'>{message.time}</span>
                  </div>
                </div>
                <div className='chat-moderator-message-content'>
                  {message.message}
                </div>

                {message.isQuestion && selectedQuestion === message && (
                  <div
                    className='chat-moderator-message-answer'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {randomizedOptions.map((option, idx) => (
                      <button
                        key={idx}
                        className={`answer-btn ${
                          selectedAnswer === option && showIncorrectFeedback
                            ? 'shake'
                            : ''
                        } ${
                          selectedAnswer === option && showCorrectFeedback
                            ? 'correct'
                            : ''
                        }`}
                        onClick={() => handleAnswerClick(option)}
                        disabled={showCorrectFeedback}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Arrow indicator pointing to clickable message */}
        {showArrowIndicator && arrowTargetIndex !== null && (
          <div
            className='arrow-indicator'
            style={{
              position: 'absolute',
              left: '50%',
              top: `${arrowTargetIndex * 150 + 100}px`, // Position over the question message
              zIndex: 10
            }}
          >
            <div className='arrow-text'>Click this message!</div>
            <div className='arrow-icon'>
              <FaHandPointer />
            </div>
          </div>
        )}
      </div>
      <div className='chat-moderator-message-input'>
        <div className='input-wrapper'>
          <button className='plus-btn text-gray'>+</button>
          <input type='text' placeholder='Message #homeroom' />
          <div className='sticker-btn'>
            <img src={emojiIcon} alt='emoji icon' />
          </div>
          <div className='send-btn'>
            <img src={sendIcon} alt='send icon' />
          </div>
        </div>
      </div>
    </main>
  )
}

export default ChatMessages
