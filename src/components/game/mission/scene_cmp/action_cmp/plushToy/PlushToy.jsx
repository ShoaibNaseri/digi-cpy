import { useState, useEffect, useRef } from 'react'
import './PlushToy.css'

// Plush toy images
import cow from '@/assets/game/missions/mission_2/action_imgs/plush_toys/cow.png'
import bunny from '@/assets/game/missions/mission_2/action_imgs/plush_toys/bunny.png'
import dog from '@/assets/game/missions/mission_2/action_imgs/plush_toys/dog.png'
import pig from '@/assets/game/missions/mission_2/action_imgs/plush_toys/pig.png'
import cat from '@/assets/game/missions/mission_2/action_imgs/plush_toys/cat.png'
import price1 from '@/assets/game/missions/mission_2/action_imgs/plush_toys/price-1.png'
import price2 from '@/assets/game/missions/mission_2/action_imgs/plush_toys/price-2.png'
import price3 from '@/assets/game/missions/mission_2/action_imgs/plush_toys/price-3.png'
import price4 from '@/assets/game/missions/mission_2/action_imgs/plush_toys/price-4.png'
import price5 from '@/assets/game/missions/mission_2/action_imgs/plush_toys/price-5.png'
import price6 from '@/assets/game/missions/mission_2/action_imgs/plush_toys/price-6.png'

// Sound effects
import meow from '@/assets/game/game_sounds/meow.wav'
import bark from '@/assets/game/game_sounds/bark.wav'
import moo from '@/assets/game/game_sounds/moo.wav'
import pig_sound from '@/assets/game/game_sounds/pig_sound.wav'
import rabbit_sound from '@/assets/game/game_sounds/rabbit_sound.wav'

const PlushToy = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState('intro') // intro, toys-entering, interactive
  const [visibleToys, setVisibleToys] = useState([])
  const [removedToys, setRemovedToys] = useState([])
  const [showCursor, setShowCursor] = useState(false)
  const [currentToyIndex, setCurrentToyIndex] = useState(-1) // Track which toy is currently appearing
  const [animationComplete, setAnimationComplete] = useState(false)
  const [soundComplete, setSoundComplete] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)

  const timeoutRefs = useRef([]) // Store timeout IDs for cleanup
  const completionCalledRef = useRef(false) // Flag to prevent multiple onComplete calls

  const audioRefs = {
    meow: useRef(new Audio(meow)),
    bark: useRef(new Audio(bark)),
    moo: useRef(new Audio(moo)),
    pig: useRef(new Audio(pig_sound)),
    rabbit: useRef(new Audio(rabbit_sound))
  }

  const toys = [
    {
      id: 'cat',
      image: cat, // Using cow as cat placeholder since cat image wasn't found
      position: 'center',
      sound: 'meow',
      price: price1
    },
    {
      id: 'bunny',
      image: bunny,
      position: 'upper-left',
      sound: 'rabbit',
      price: price2
    },
    {
      id: 'pig',
      image: pig,
      position: 'upper-right',
      sound: 'pig',
      price: price3
    },
    {
      id: 'dog',
      image: dog,
      position: 'lower-left',
      sound: 'bark',
      price: price4
    },
    {
      id: 'cow',
      image: cow,
      position: 'lower-right',
      sound: 'moo',
      price: price5
    }
  ]

  // Preload assets - same approach as PostBook
  useEffect(() => {
    const preloadAssets = async () => {
      const imagePromises = toys.map((toy) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = toy.image
        })
      })

      // Add price image preloading
      const pricePromises = toys.map((toy) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = toy.price
        })
      })

      const audioPromises = Object.values(audioRefs).map((audioRef) => {
        return new Promise((resolve, reject) => {
          const audio = audioRef.current
          audio.addEventListener('canplaythrough', resolve)
          audio.addEventListener('error', reject)
          audio.load()
        })
      })

      try {
        await Promise.all([
          ...imagePromises,
          ...pricePromises,
          ...audioPromises
        ])
        setAssetsLoaded(true)
      } catch (error) {
        console.error('Error loading assets:', error)
        setAssetsLoaded(true) // Continue anyway
      }
    }

    preloadAssets()
  }, [])

  // Show toys one by one with sound effects - same approach as PostBook
  useEffect(() => {
    if (!assetsLoaded) return

    toys.forEach((toy, index) => {
      setTimeout(() => {
        // Start the toy animation
        setVisibleToys((prev) => [...prev, toy.id])

        // Play sound effect synchronized with animation
        setTimeout(() => {
          const audio = audioRefs[toy.sound].current
          if (audio) {
            audio.currentTime = 0
            audio.volume = 0.7
            audio.play().catch((e) => console.log('Audio play failed:', e))

            // Stop after 1.5 seconds
            setTimeout(() => {
              audio.pause()
              audio.currentTime = 0
            }, 1500)
          }
        }, 100) // Small delay to ensure the animation has started

        // Show cursor after last toy
        if (index === toys.length - 1) {
          setTimeout(() => {
            setCurrentPhase('interactive')
            setShowCursor(true)
          }, 2000)
        }
      }, index * 1500) // Same timing as PostBook
    })
  }, [assetsLoaded])

  const handleToyClick = (toyId, soundType) => {
    if (
      currentPhase !== 'interactive' ||
      removedToys.includes(toyId) ||
      completionCalledRef.current
    ) {
      return
    }

    // Play sound effect
    const audio = audioRefs[soundType].current
    if (audio) {
      audio.currentTime = 0
      audio.play()
      setTimeout(() => {
        audio.pause()
        audio.currentTime = 0
      }, 1500)

      // Add removal animation class to wrapper so both toy and price tag animate
      const wrapperElement = document.getElementById(`wrapper-${toyId}`)
      if (wrapperElement) {
        wrapperElement.classList.add('clicked')

        // Remove toy after animation
        setTimeout(() => {
          setRemovedToys((prev) => {
            const newRemovedToys = [...prev, toyId]
            // Check if all toys are removed and onComplete hasn't been called yet
            if (
              newRemovedToys.length === toys.length &&
              !completionCalledRef.current
            ) {
              completionCalledRef.current = true // Set flag immediately to prevent multiple calls
              onComplete()
            }
            return newRemovedToys
          })
        }, 800)
      }
    } else {
    }
  }

  const getLeftmostToy = () => {
    const visibleToyList = toys.filter(
      (toy) => visibleToys.includes(toy.id) && !removedToys.includes(toy.id)
    )

    // Define order from left to right
    const leftToRightOrder = [
      'upper-left',
      'lower-left',
      'center',
      'upper-right',
      'lower-right'
    ]

    for (const position of leftToRightOrder) {
      const toy = visibleToyList.find((t) => t.position === position)
      if (toy) return toy.id
    }
    return null
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs).forEach((audioRef) => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      })
    }
  }, [])

  if (!assetsLoaded) {
    return (
      <div className='plush-toy-loading'>
        <div className='loading-spinner'></div>
        <p>Loading magical plush toys...</p>
      </div>
    )
  }

  return (
    <div className='plush-toy-container'>
      <div className='plush-toy-title'>
        <h1>Click on the toys</h1>
      </div>
      {/* Toys with price tags */}
      {toys.map((toy) => (
        <div
          key={toy.id}
          id={`wrapper-${toy.id}`}
          className={`toy-wrapper ${toy.position}`}
        >
          {/* Toy */}
          <div
            id={`toy-${toy.id}`}
            className={`plush-toy ${
              visibleToys.includes(toy.id) ? 'visible' : ''
            } ${removedToys.includes(toy.id) ? 'removed' : ''}`}
            onClick={() => handleToyClick(toy.id, toy.sound)}
          >
            <img src={toy.image} alt={`${toy.id} plush toy`} />
          </div>

          {/* Price tag */}
          <div
            className={`price-tag ${
              visibleToys.includes(toy.id) ? 'visible' : ''
            } ${removedToys.includes(toy.id) ? 'removed' : ''}`}
          >
            <img src={toy.price} alt={`${toy.id} price`} />
          </div>
        </div>
      ))}

      {/* Interactive cursor */}
      {showCursor && getLeftmostToy() && (
        <div
          className={`cursor-pointer ${
            toys.find((t) => t.id === getLeftmostToy())?.position
          }`}
          id={`cursor-${getLeftmostToy()}`}
        >
          <div className='cursor-gif'>👆</div>
        </div>
      )}
    </div>
  )
}

export default PlushToy
