import React from 'react'
import './gamecompletemodal.css'

const GameCompleteModal = ({ score, isSuccess, onReplay, onContinue }) => {
  return (
    <div className='game-end-modal-overlay'>
      <div className='game-end-modal'>
        <h2 className='game-end-modal-title'>
          {isSuccess ? 'Great Job!' : "Time's Up!"}
        </h2>
        <div className='game-end-modal-score'>
          Your Score: <span>{score}</span>
        </div>
        <div className='game-end-modal-buttons'>
          <button className='symtomsorter-header-button' onClick={onReplay}>
            {isSuccess ? 'Play Again' : 'Restart Game'}
          </button>
          <button className='symtomsorter-header-button' onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameCompleteModal
