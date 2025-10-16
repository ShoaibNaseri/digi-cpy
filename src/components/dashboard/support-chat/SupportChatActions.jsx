import { useEffect, useRef, useState } from 'react'
import SpeechRecognition, {
  useSpeechRecognition
} from 'react-speech-recognition'
import './SupportChatActions.css'
import { icons, images } from '@/config/images'
import { GrSend } from 'react-icons/gr'
import { FaMicrophone } from 'react-icons/fa'
import { MdAttachFile } from 'react-icons/md'
import { useSupportChat } from '@/context/SupportChatContext'
import { useAuth } from '@/context/AuthContext'
import {
  generatePersonalProtectionPlan,
  sendMessageToOpenAI,
  generatePersonalProtectionPlanLawEnforcement
} from '@/services/openAiService'
import FollowUpNotification from './FollowUpNotification'
import { getTrustedAdults } from '@/services/userService'
import { useProfile } from '@/context/ProfileContext'
import { extractFirstJsonObject } from '@/utils/extractJson'
import { uploadFile } from '@/services/uploadFileService'

const requiredFields = [
  'location',
  'platform',
  'perpetrator',
  'perpetratorDetails',
  'incidentType',
  'ongoing',
  'sourceOfIntel',
  'timeframeSpecific',
  'timelineStart',
  'offlineToo',
  'emotionalImpact',
  'physicalSafety',
  'screenshotsRequested'
]

// Function to check if dataObj has enough evidence
const checkHasEnoughEvidence = (dataObj) => {
  if (!dataObj || !dataObj.dataObj) return false

  const data = dataObj.dataObj

  // Check if all required fields have non-null values and log missing ones
  const missingFields = []
  for (const field of requiredFields) {
    const value = data[field]
    if (value === null || value === 'null' || value === undefined) {
      missingFields.push(field)
    }
  }
  if (missingFields.length > 0) {
    return false
  }

  return true
}

const checkMissingFields = (dataObj) => {
  if (!dataObj || !dataObj.dataObj) return false

  const data = dataObj.dataObj

  // Check if all required fields have non-null values and log missing ones
  const missingFields = []
  for (const field of requiredFields) {
    const value = data[field]
    if (value === null || value === 'null' || value === undefined) {
      missingFields.push(field)
    }
  }
  return missingFields
}

const SupportChatActions = () => {
  const buttonRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const [message, setMessage] = useState('')
  const [stagedImages, setStagedImages] = useState([])
  const [dataObj, setDataObj] = useState(null)
  const {
    addMessage,
    isOpenAIConnected,
    conversationState,
    messages,
    isLoading,
    setIsLoading,
    setIsGeneratingProtectionPlan,
    setIsThreatDetected,
    currentConversationId,
    setHasProtectionPlan,
    hasProtectionPlan
  } = useSupportChat()
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false)
  const [trustedAdults, setTrustedAdults] = useState([])
  const { profileData, fetchUserProfile } = useProfile()
  const { currentUser } = useAuth()

  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition()

  const fetchTrustedAdults = async () => {
    const adults = await getTrustedAdults(currentUser.uid)
    setTrustedAdults(adults)
  }

  useEffect(() => {
    if (currentUser) {
      fetchTrustedAdults()
      fetchUserProfile(currentUser.uid)
    }
  }, [currentUser])

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  const handleImageSelection = async (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    const validImages = files.filter((file) => file.type.startsWith('image/'))

    if (validImages.length !== files.length) {
      alert(
        'Some files were not images and have been filtered out. Please only select image files.'
      )
    }

    if (validImages.length === 0) {
      alert('Please upload at least one image file')
      return
    }

    const newStagedImages = validImages.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }))

    setStagedImages((prev) => [...prev, ...newStagedImages])

    event.target.value = ''
  }

  const removeStagedImage = (imageId) => {
    setStagedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter((img) => img.id !== imageId)
    })
  }

  const uploadStagedImages = async () => {
    const uploadedImages = []

    for (const stagedImage of stagedImages) {
      try {
        let path = ''
        if (isUploadingEvidence) {
          path = `incident-evidence/${currentUser.uid}/${Date.now()}-${
            stagedImage.file.name
          }`
        } else {
          path = `message-images/${currentUser.uid}/${Date.now()}-${
            stagedImage.file.name
          }`
        }
        const fileUrl = await uploadFile(stagedImage.file, path)
        uploadedImages.push(fileUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
        throw error
      }
    }

    return uploadedImages
  }

  const handleSendMessage = async () => {
    if (message.trim() || stagedImages.length > 0) {
      const userMessage = message.trim()
      const hasImages = stagedImages.length > 0

      setIsLoading(true)
      SpeechRecognition.stopListening()

      try {
        let uploadedImageUrls = []

        // Check if AI is connected
        if (!isOpenAIConnected) {
          addMessage({
            id: Date.now() + 1,
            message: {
              aiResponse:
                "I'm sorry, I'm currently offline and unable to process your request. Please check your internet connection or try again later."
            },
            image: images.supportMrAzabukiImage,
            sender: 'AI',
            userId: currentUser.uid
          })
          setIsLoading(false)
          return
        }

        const userData = {
          age: profileData?.dateOfBirth || null,
          trustedAdults: trustedAdults?.adults || [],
          name:
            profileData?.firstName && profileData?.lastName
              ? `${profileData.firstName} ${profileData.lastName}`
              : null,
          region: profileData?.region || null,
          country: profileData?.country || null,
          userId: currentUser.uid,
          schoolId: profileData?.schoolId || null,
          classId: profileData?.classId || null
        }

        // Upload images first (using current evidence state)
        if (hasImages) {
          uploadedImageUrls = await uploadStagedImages()

          stagedImages.forEach((img) => URL.revokeObjectURL(img.preview))
          setStagedImages([])
        }

        // Add user message immediately so it appears first
        if (userMessage || uploadedImageUrls.length > 0) {
          addMessage({
            id: Date.now(),
            message: userMessage,
            images: uploadedImageUrls,
            image: images.studentImage,
            sender: 'User',
            userId: currentUser.uid
          })
        }

        setMessage('')
        // Get AI response (with text and images if any)
        let updatedDataObj = dataObj // Start with existing state
        if (userMessage || uploadedImageUrls.length > 0) {
          try {
            const missingFields = checkMissingFields() || []
            const aiResponse = await sendMessageToOpenAI(
              userData,
              userMessage,
              uploadedImageUrls,
              messages,
              updatedDataObj,
              missingFields
            )

            // Extract the dataObj from AI response
            const currentDataObj = extractFirstJsonObject(aiResponse)

            if (currentDataObj) {
              // Merge currentDataObj into existing dataObj state
              setDataObj((prevDataObj) => {
                if (!prevDataObj) {
                  updatedDataObj = currentDataObj
                  return currentDataObj
                }

                // Create a deep copy of the previous dataObj
                const newDataObj = {
                  threatDetected: currentDataObj.threatDetected,
                  hasEnoughEvidence: undefined,
                  response: currentDataObj.response || prevDataObj.response, // Always update response
                  dataObj: { ...prevDataObj.dataObj }
                }
                newDataObj.hasEnoughEvidence =
                  checkHasEnoughEvidence(newDataObj)

                // Merge the dataObj field, only updating non-null values
                if (currentDataObj.dataObj) {
                  Object.keys(currentDataObj.dataObj).forEach((key) => {
                    const newValue = currentDataObj.dataObj[key]
                    // Only update if the new value is not null and not the string 'null'
                    if (
                      newValue !== null &&
                      newValue !== 'null' &&
                      newValue !== undefined
                    ) {
                      newDataObj.dataObj[key] = newValue
                    }
                  })
                }

                // Use our custom function to check if we have enough evidence

                updatedDataObj = newDataObj
                return newDataObj
              })

              // Check if threat detected to enable evidence uploading
              if (updatedDataObj.threatDetected) {
                setIsUploadingEvidence(true)
              }
            }
          } catch (error) {
            console.error('Error getting AI response:', error)
          }
        }

        // Process AI response using the updatedDataObj (accumulated state)
        if (updatedDataObj) {
          setIsThreatDetected(updatedDataObj.threatDetected || false)

          if (
            updatedDataObj.threatDetected &&
            updatedDataObj.hasEnoughEvidence &&
            !hasProtectionPlan
          ) {
            setIsGeneratingProtectionPlan(true)
            const personalProtectionPlan = await generatePersonalProtectionPlan(
              userData,
              messages,
              currentConversationId
            )

            await generatePersonalProtectionPlanLawEnforcement(
              userData,
              messages,
              currentConversationId
            )

            addMessage({
              id: Date.now() + 1,
              message: {
                aiResponse: personalProtectionPlan,
                threatDetected: true,
                hasEnoughEvidence: true,
                dataObj: {
                  hasProtectionPlan: true
                }
              },
              image: images.supportMrAzabukiImage,
              sender: 'AI',
              userId: currentUser.uid
            })

            setHasProtectionPlan(true)
            setIsUploadingEvidence(false)
            setIsGeneratingProtectionPlan(false)
            return
          }

          addMessage({
            id: Date.now() + 1,
            message: {
              response: updatedDataObj.response,
              threatDetected: updatedDataObj.threatDetected,
              hasEnoughEvidence: updatedDataObj.hasEnoughEvidence,
              updatedDataObj: updatedDataObj.dataObj,
              userData
            },
            image: images.supportMrAzabukiImage,
            sender: 'AI',
            userId: currentUser.uid
          })
        } else {
          addMessage({
            id: Date.now() + 1,
            message: {
              response:
                "I'm sorry, I'm having trouble processing your request right now. Please try again later."
            },
            image: images.supportMrAzabukiImage,
            sender: 'AI',
            userId: currentUser.uid
          })
        }
      } catch (error) {
        console.error('Error in handleSendMessage:', error)
        addMessage({
          id: Date.now() + 1,
          message: {
            aiResponse:
              "I'm sorry, I'm having trouble processing your request right now. Please try again later."
          },
          image: images.supportMrAzabukiImage,
          sender: 'AI',
          userId: currentUser.uid
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage()
      if (listening) {
        buttonRef.current.click()
      }
    }
  }

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      SpeechRecognition.startListening({ continuous: true })
    }
  }

  useEffect(() => {
    if (transcript) {
      setMessage(transcript)
    }
  }, [transcript])

  useEffect(() => {
    return () => {
      stagedImages.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [])

  if (!browserSupportsSpeechRecognition) {
    return null
  }

  return (
    <div className='support-chat__container-input'>
      <FollowUpNotification />

      {conversationState.collectingIncidentDetails &&
        conversationState.currentQuestionIndex === 4 && (
          <div className='support-chat__image-hint'>
            Click the attachment icon to upload images as evidence
          </div>
        )}

      {stagedImages.length > 0 && (
        <div className='support-chat__staged-images'>
          <div className='staged-images-header'>
            <span>Images to send ({stagedImages.length})</span>
          </div>
          <div className='staged-images-container'>
            {stagedImages.map((stagedImage) => (
              <div key={stagedImage.id} className='staged-image'>
                <img src={stagedImage.preview} alt='Staged image' />
                <button
                  type='button'
                  className='remove-image-btn'
                  onClick={() => removeStagedImage(stagedImage.id)}
                  title='Remove image'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='support-chat__input-controls'>
        <div className='support-chat__action-buttons'>
          <button
            onClick={() => fileInputRef.current.click()}
            className={
              conversationState.collectingIncidentDetails &&
              conversationState.currentQuestionIndex === 4
                ? 'highlight-button'
                : ''
            }
          >
            <MdAttachFile color='#374151' size={20} />
          </button>
          <input
            type='file'
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept='image/*'
            multiple
            onChange={handleImageSelection}
          />
          <button
            ref={buttonRef}
            onClick={toggleListening}
            className={listening ? 'listening' : ''}
          >
            <FaMicrophone color='#374151' size={20} />
          </button>
        </div>
        <input
          ref={inputRef}
          type='text'
          placeholder='Type your message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
          <GrSend size={20} />
        </button>
      </div>
    </div>
  )
}

export default SupportChatActions
