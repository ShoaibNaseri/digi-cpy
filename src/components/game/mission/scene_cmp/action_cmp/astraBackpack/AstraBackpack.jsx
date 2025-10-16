import './AstraBackpack.css'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ActionLoadingIndicator from '@/components/common/ActionLoadingIndicator'
import chatImg from '@/assets/game/action_imgs/astra-bag-item3.png'
import foodImg from '@/assets/game/action_imgs/astra-bag-item2.png'
import paperImg from '@/assets/game/action_imgs/astra-bag-item1.png'
import backpackImg from '@/assets/game/action_imgs/astra-bag.png'

import notSure from '@/assets/game/action_narrations/Astra_1833.mp3'
import correct from '@/assets/game/action_narrations/Astra_1834.mp3'
import backpackOpen from '@/assets/game/game_sounds/backpack_open.mp3'

const AstraBackpack = ({ onComplete }) => {
  const [backpackClicked, setBackpackClicked] = useState(false)
  const [backpackFading, setBackpackFading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [chatClicked, setChatClicked] = useState(false)
  const [notSureSound] = useState(new Audio(notSure))
  const [correctSound] = useState(new Audio(correct))
  const [backpackOpenSound] = useState(new Audio(backpackOpen))

  // Ensure all sounds and images are loaded
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Preload all sounds
        await Promise.all([
          notSureSound.load(),
          correctSound.load(),
          backpackOpenSound.load()
        ])

        // Preload all images
        const imagePromises = [chatImg, foodImg, paperImg, backpackImg].map(
          (src) => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = resolve
              img.onerror = reject
              img.src = src
            })
          }
        )

        await Promise.all(imagePromises)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading assets:', error)
        setIsLoading(false)
      }
    }

    loadAssets()
  }, [notSureSound, correctSound, backpackOpenSound])

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
    } else if (item === 'chat') {
      // Set chat as clicked to show it bigger and hide others
      setChatClicked(true)

      // Play correct sound and wait for it to finish before calling onComplete
      correctSound.volume = 0.6
      correctSound
        .play()
        .then(() => {
          // Wait for the sound to finish
          correctSound.addEventListener(
            'ended',
            () => {
              onComplete()
            },
            { once: true }
          )
        })
        .catch((err) => {
          // If sound fails, call onComplete immediately
          onComplete()
        })
    }
  }

  if (isLoading) {
    return (
      <div className='astra-backpack-action-container'>
        <ActionLoadingIndicator message='Loading game assets...' />
      </div>
    )
  }

  return (
    <div className='astra-backpack-action-container'>
      <div className='astra-backpack-action-content'>
        {!backpackClicked ? (
          <motion.img
            src={backpackImg}
            alt='backpack'
            className={`astra-backpack-image ${
              backpackFading ? 'astra-backpack-fade-out' : ''
            }`}
            onClick={handleBackpackClick}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: backpackFading ? 0.5 : 1,
              opacity: backpackFading ? 0 : 1,
              y: backpackFading ? 0 : [-15, 0, -15]
            }}
            transition={{
              duration: 0.5,
              y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
        ) : (
          <div className='astra-backpack-item-container'>
            {!chatClicked ? (
              <>
                <AnimatePresence>
                  <motion.img
                    key='paper'
                    src={paperImg}
                    alt='paper'
                    className='astra-backpack-item-image astra-backpack-from-backpack astra-backpack-paper-pos'
                    onClick={() => handleItemClick('paper')}
                    initial={{ opacity: 0, scale: 0.3, y: 80, rotate: -10 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotate: 0
                    }}
                    transition={{ duration: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />

                  <motion.img
                    key='chat'
                    src={chatImg}
                    alt='chat'
                    className='astra-backpack-item-image astra-backpack-from-backpack astra-backpack-chat-pos'
                    onClick={() => handleItemClick('chat')}
                    initial={{ opacity: 0, scale: 0.3, y: 80, rotate: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />

                  <motion.img
                    key='food'
                    src={foodImg}
                    alt='food'
                    className='astra-backpack-item-image astra-backpack-from-backpack astra-backpack-food-pos'
                    onClick={() => handleItemClick('food')}
                    initial={{ opacity: 0, scale: 0.3, y: 80, rotate: -5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotate: 0
                    }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                </AnimatePresence>
              </>
            ) : (
              <motion.img
                src={chatImg}
                alt='chat'
                className='astra-backpack-item-image astra-backpack-from-backpack astra-backpack-chat-pos astra-backpack-chat-selected'
                onClick={() => handleItemClick('chat')}
                initial={{ scale: 1 }}
                animate={{
                  scale: 1.2,
                  y: [-5, 5, -5],
                  rotate: [-2, 2, -2]
                }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AstraBackpack
