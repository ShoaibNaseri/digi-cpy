import { useState } from 'react'
import './howyoureact.css'

const GameInstructions = ({ onStart }) => {
  return (
    <div className=''>
      <div className='instructions-square'>
        <div className='instructions-title'>How To Play</div>

        <div className='instructions-red-square'>
          <div className='instructions-white-square'>
            <div className='hyr-instructions-content'>
              <div className='hyr-instructions-text'>
                Read the cyberbullying example, and think about how you should
                react. Then, drag and drop the buttons so they are in the
                correct order.
              </div>
              <div className='instructions-hint'>
                <span className='instructions-hint-title'>Hint: </span>
                Screenshot, stop, block, report.
              </div>
              <div className='instructions-button'>
                <button className='start-button' onClick={onStart}>
                  START!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameInstructions
