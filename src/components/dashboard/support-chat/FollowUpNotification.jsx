import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  getPendingFollowUps,
  updateFollowUpResponse
} from '@/services/followUpService'
import { useSupportChat } from '@/context/SupportChatContext'
import './FollowUpNotification.css'
import { images } from '@/config/images'
import { IoClose } from 'react-icons/io5'
import { FaUserFriends } from 'react-icons/fa'

const FollowUpNotification = () => {
  const [pendingFollowUps, setPendingFollowUps] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  const [currentFollowUp, setCurrentFollowUp] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const { currentUser } = useAuth()
  const { addMessage, setConversationState } = useSupportChat()

  useEffect(() => {
    const checkPendingFollowUps = async () => {
      try {
        const followUps = await getPendingFollowUps(currentUser.uid)
        setPendingFollowUps(followUps)
        if (followUps.length > 0) {
          setShowNotification(true)
          setCurrentFollowUp(followUps[0])
        }
      } catch (error) {
        console.error('Error checking pending follow-ups:', error)
      }
    }

    if (currentUser?.uid) {
      checkPendingFollowUps()
    }
  }, [currentUser?.uid])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowNotification(false)
      setIsClosing(false)
    }, 300)
  }

  const handleFollowUpResponse = async (spokeToAdult) => {
    if (!currentFollowUp) {
      console.error('No current follow-up to respond to')
      return
    }

    try {
      const followUpMessage = spokeToAdult
        ? 'I spoke with a trusted adult about the situation.'
        : "I haven't spoken with a trusted adult yet."

      await updateFollowUpResponse(
        currentFollowUp.id,
        spokeToAdult,
        followUpMessage
      )

      setConversationState((prevState) => {
        return {
          ...prevState,
          awaitingFollowUpResponse: true,
          followUpData: {
            reportId: currentFollowUp.id,
            spokeToAdult
          }
        }
      })

      if (spokeToAdult) {
        addMessage({
          id: Date.now(),
          image: images.supportMrAzabukiImage,
          message: {
            aiResponse:
              "I'm glad you spoke with a trusted adult. Could you tell me more about who you spoke with and how the conversation went?"
          },
          sender: 'AI',
          userId: currentUser.uid
        })
      } else {
        addMessage({
          id: Date.now(),
          message: {
            aiResponse:
              "I understand. Could you share why you haven't been able to speak with someone yet? Remember, speaking with a trusted adult is important for your safety and well-being."
          },
          sender: 'AI',
          userId: currentUser.uid,
          image: images.supportMrAzabukiImage
        })
      }

      handleClose()
      setPendingFollowUps((prev) => prev.slice(1))
      setCurrentFollowUp(pendingFollowUps[1] || null)
      if (pendingFollowUps[1]) {
        setTimeout(() => setShowNotification(true), 400)
      }
    } catch (error) {
      console.error('Error handling follow-up response:', error)
    }
  }

  if (!showNotification || !currentFollowUp) return null

  return (
    <div className={`follow-up-notification ${isClosing ? 'closing' : ''}`}>
      <button className='close-button' onClick={handleClose}>
        <IoClose size={20} />
      </button>
      <div className='follow-up-content'>
        <div className='notification-header'>
          <FaUserFriends className='notification-icon' />
          <h3>Follow-up Check-in</h3>
        </div>
        <p>
          Have you had a chance to speak with a trusted adult about the
          situation you reported?
        </p>
        <div className='follow-up-buttons'>
          <button
            className='primary-button'
            onClick={() => handleFollowUpResponse(true)}
          >
            Yes, I spoke with someone
          </button>
          <button
            className='secondary-button'
            onClick={() => handleFollowUpResponse(false)}
          >
            Not yet
          </button>
        </div>
      </div>
    </div>
  )
}

export default FollowUpNotification
