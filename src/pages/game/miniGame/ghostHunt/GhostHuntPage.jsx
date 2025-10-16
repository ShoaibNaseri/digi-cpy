import React from 'react'
import GhostHunt from '@/components/game/mini_game/ghost_hunt/GhostHunt'
import gameBg from '@/assets/game/bg_imgs/blue_cabin.webp'

const GhostHuntPage = ({ onComplete }) => {
  const handleGameComplete = (result) => {
    onComplete()

    // Handle game completion logic here
    // For example, navigate back to mission or show results
  }
  return (
    <div className='ghost-hunt-page'>
      <GhostHunt onComplete={handleGameComplete} backgroundImage={gameBg} />
    </div>
  )
}

export default GhostHuntPage
