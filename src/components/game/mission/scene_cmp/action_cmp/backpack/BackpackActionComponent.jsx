import { useState, useEffect } from 'react'
import chatImg from '@/assets/game/missions/mission_one/action_imgs/backpack/chat.png'
import foodImg from '@/assets/game/missions/mission_one/action_imgs/backpack/food.png'
import paperImg from '@/assets/game/missions/mission_one/action_imgs/backpack/paper.png'
import backpackImg from '@/assets/game/missions/mission_one/action_imgs/backpack/backpack.png'

import notSure from '@/assets/game/game_sounds/not_sure.mp3'
import backpackOpen from '@/assets/game/game_sounds/backpack_open.mp3'

import './backpackaction.css'

const BackpackActionComponent = ({ onComplete }) => {
  const [backpackClicked, setBackpackClicked] = useState(false)
  const [backpackFading, setBackpackFading] = useState(false)
  const [notSureSound] = useState(new Audio(notSure))
  const [backpackOpenSound] = useState(new Audio(backpackOpen))

  // Ensure sound is loaded
  useEffect(() => {
    // Preload the sound
    notSureSound.load()
    backpackOpenSound.load()
  }, [notSureSound, backpackOpenSound])

  const handleBackpackClick = () => {
    //adjust sound to 0.6
    backpackOpenSound.volume = 0.3
    backpackOpenSound
      .play()
      .catch((err) => console.error('Sound play error:', err))
    setBackpackFading(true)
    // Give time for the backpack to fade out, then show items
    setTimeout(() => {
      setBackpackClicked(true)
    }, 500) // 500ms matches the fade-out duration
  }

  const handleItemClick = (item) => {
    if (item === 'food' || item === 'paper') {
      // Create a new instance each time to ensure it plays

      notSureSound
        .play()
        .catch((err) => console.error('Sound play error:', err))
    } else {
      onComplete()
    }
  }

  return (
    <div className='backpack-action-container'>
      <div className='backpack-action-content'>
        {!backpackClicked ? (
          <img
            src={backpackImg}
            alt='backpack'
            className={`backpack-image animate-bounce ${
              backpackFading ? 'fade-out' : ''
            }`}
            onClick={handleBackpackClick}
          />
        ) : (
          <div className='items-container'>
            <img
              src={paperImg}
              alt='paper'
              className='item-image from-backpack paper-pos'
              onClick={() => handleItemClick('paper')}
            />
            <img
              src={chatImg}
              alt='chat'
              className='item-image from-backpack chat-pos'
              onClick={() => handleItemClick('chat')}
            />
            <img
              src={foodImg}
              alt='food'
              className='item-image from-backpack food-pos'
              onClick={() => handleItemClick('food')}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default BackpackActionComponent
