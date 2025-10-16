import './Introductionstep.css'
import { useState } from 'react'
import ghost from '@/assets/game/mini_game/img/pacman/ghost.png'
import pacman from '@/assets/game/mini_game/img/pacman/katie.png'
import keyboard from '@/assets/game/mini_game/img/pacman/keyboard.png'
import { FaArrowRight, FaCheck, FaThumbsDown } from 'react-icons/fa'

const IntroductionStep = ({ setIsStepsCompleted }) => {
  const [step, setStep] = useState(0)

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className='pacman-introduction-step'>
            <div className='pacman-introdcution-content'>
              <div className='pacman-introdcution-title-content'>
                {' '}
                Block the Bully
              </div>
              <div className='pacman-introdcution-title-border'></div>
              <div className='pacman-introdcution-title-how'> How to play</div>
              <div className='pacman-introduction-conten-img'>
                <img src={keyboard} alt='keyboard' />
              </div>
              <div className='pacman-introdcution-footer'>
                Use the ARROW KEYS on your keyboard to <br /> move your
                character around the maze
              </div>
              <div className='pacman-introdcution-footer-button'>
                <button onClick={() => setStep(step + 1)}>
                  <FaArrowRight size={30} />
                </button>
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className='pacman-introduction-step'>
            <div className='pacman-introduction-title-content'>
              <div className='pacman-dots-image'>
                <div className='pacman-introduction-dots'>
                  <div className='dots' />
                  <div className='dots ' />
                  <div className='dots' />
                </div>
                <div className='pacman-introduction-ghost-image'>
                  <img src={ghost} alt='ghost' />
                </div>
              </div>

              <div className='pacman-introdcution-footer2'>
                Move UP, DOWN, LEFT, and RIGHT to collect dots and avoid the
                bully
              </div>
              <div className='pacman-introdcution-footer-button1'>
                <button onClick={() => setStep(step + 1)}>
                  <FaArrowRight size={30} />
                </button>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className='pacman-introduction-step'>
            <div className='pacman-introduction-title-content'>
              <div className='pacman-introduction-block-button'>
                <button>Block</button>
              </div>
              <div className='pacman-introdcution-footer2'>
                Hit the BLOCK button for immunity!
              </div>
              <div className='pacman-introdcution-footer-button1'>
                <button onClick={() => setStep(step + 1)}>
                  <FaArrowRight size={30} />
                </button>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className='pacman-introduction-step'>
            <div className='pacman-introduction-title-content'>
              <div className='phone-pacman-overlay visible'>
                <div className='phone pacman-phone'>
                  <div className='countdown-bar'>
                    <div className='pacman-introduction-block-button-phone-content'>
                      <button className='phone-block-button pacman-introduction-block-button-phone'>
                        Block
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='pacman-introdcution-footer2'>
                You have 3 seconds to hit <br /> BLOCK on your phone. Ready?
              </div>
              <div className='pacman-introdcution-footer-button1'>
                <div
                  onClick={() => setIsStepsCompleted(true)}
                  class='start-button-pacman'
                >
                  <div class='start-button-yellow-border'>
                    <div>START</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Step 0</div>
    }
  }

  return <div className='pacman-game'>{renderStep()}</div>
}

export default IntroductionStep
