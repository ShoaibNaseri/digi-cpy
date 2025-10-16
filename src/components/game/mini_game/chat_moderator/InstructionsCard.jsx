import React, { useEffect, useState } from 'react'

const InstructionsCard = ({ dialogBoxImg, onStart, voice }) => {
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Create audio element inside useEffect to prevent recreation on re-renders
    const audio = new Audio(`/assets/${voice}`)

    // Play audio once
    audio.play()

    // Add event listener for when audio ends
    audio.addEventListener('ended', () => {
      setShowInstructions(true)
    })

    // Cleanup function to remove event listener
    return () => {
      audio.removeEventListener('ended', () => {
        setShowInstructions(true)
      })
      audio.pause()
      audio.currentTime = 0
    }
  }, [voice]) // Only depend on voice, not audio
  return (
    <div className='title-card-container'>
      <div
        className='title-card instructions-card'
        style={{ backgroundImage: `url(${dialogBoxImg})` }}
      >
        <div className='instructions-content'>
          <h1>Game Instructions</h1>
          <div className='instructions-scroll-area'>
            <div className='instructions-text'>
              <div className='instruction-step'>
                <span style={{ fontWeight: 'bold' }}>
                  1 - Read all the chat messages and find the one that breaks
                  the rules.
                </span>
              </div>

              <div className='instruction-step'>
                <span style={{ fontWeight: 'bold' }}>
                  2 - Click on the message and choose the reason why it's
                  wrong."
                </span>
              </div>
              <div className='instruction-step'>
                <ul className='rules-list'>
                  <li>
                    <strong>Intimidation</strong> (this is threatening or
                    scaring someone)
                  </li>
                  <li>
                    <strong>Hate speech</strong> (when someone says hurtful
                    things about someone because of their race, religion,
                    gender, or identity)
                  </li>
                  <li>
                    <strong>Harassment</strong> (repeatedly bothering or
                    bullying someone)
                  </li>
                  <li>
                    <strong>Sharing photos without permission</strong>
                  </li>
                </ul>
              </div>

              <div className=''>
                <p>Do your very best to keep the chat safe and respectful!</p>
              </div>
            </div>
          </div>

          {showInstructions && (
            <button className='title-card-button' onClick={onStart}>
              START
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstructionsCard
