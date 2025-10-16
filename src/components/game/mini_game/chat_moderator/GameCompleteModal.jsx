import React from 'react'

const GameCompleteModal = ({ onReplay, onContinue }) => {
  return (
    <div className='modal-overlay'>
      <div className='chat-modal-content'>
        <h2>Game Completed!</h2>
        <p>Well Done!</p>
        <div className='chat-modal-buttons'>
          <button className='secondary' onClick={onReplay}>
            Play Again
          </button>
          <button onClick={onContinue}>Continue</button>
        </div>
      </div>
    </div>
  )
}

export default GameCompleteModal
