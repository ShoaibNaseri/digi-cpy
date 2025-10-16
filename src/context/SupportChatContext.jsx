import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react'
import { useAuth } from './AuthContext'
import { checkOpenAIConnection } from '../services/openAiService'
import { images } from '@/config/images'
import { toast } from 'react-toastify'
import { checkAndMigrateMessages } from '../utils/migrateConversations'
import {
  createConversation,
  addMessageToConversation,
  listenForConversations,
  listenForMessages,
  checkForProtectionPlanAfterThreat,
  sendPPPInfoMessage as sendPPPInfoMessageService,
  resetForNewIncident as resetForNewIncidentService,
  sendDisconnectionFollowUp as sendDisconnectionFollowUpService,
  sendInactivityFollowUp as sendInactivityFollowUpService,
  checkAndSendFollowUp as checkAndSendFollowUpService,
  startFollowUpTimer as startFollowUpTimerService,
  updateActivityTimestamp as updateActivityTimestampService,
  resetActivityTimer as resetActivityTimerService,
  updateThreatStatus,
  checkPreviousSessionThreat
} from '../services/supportChatService'
import { decryptFields } from '@/services/encryptionService'

const SupportChatContext = createContext()

export const useSupportChat = () => {
  const context = useContext(SupportChatContext)
  if (!context) {
    throw new Error('useSupportChat must be used within a SupportChatProvider')
  }
  return context
}

export const SupportChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [isOpenAIConnected, setIsOpenAIConnected] = useState(true)
  const [conversationState, setConversationState] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isThreatDetected, setIsThreatDetected] = useState(false)
  const [isGeneratingProtectionPlan, setIsGeneratingProtectionPlan] =
    useState(false)
  const [followUpTimer, setFollowUpTimer] = useState(null)
  const [followUpCountdown, setFollowUpCountdown] = useState(0)
  const [countdownInterval, setCountdownInterval] = useState(null)
  const [hasProtectionPlan, setHasProtectionPlan] = useState(false)
  const lastActivityRef = useRef(Date.now())
  const shouldSendFollowUpRef = useRef(false)
  const lastThreatMessageIndexRef = useRef(-1)
  const lastProcessedPPPRef = useRef(null)
  const timerResetTimeoutRef = useRef(null)
  const isSendingFollowUpRef = useRef(false)
  const { currentUser } = useAuth()
  const [messagesLoaded, setMessagesLoaded] = useState(false)
  const hasSentProactiveFollowUpRef = useRef(false)
  const followUpSentForConversationRef = useRef({})

  const clearFollowUpTimer = useCallback(() => {
    if (followUpTimer) {
      clearTimeout(followUpTimer)
      setFollowUpTimer(null)
    }
    if (countdownInterval) {
      clearInterval(countdownInterval)
      setCountdownInterval(null)
    }
    if (timerResetTimeoutRef.current) {
      clearTimeout(timerResetTimeoutRef.current)
      timerResetTimeoutRef.current = null
    }
    setFollowUpCountdown(0)
    shouldSendFollowUpRef.current = false
    isSendingFollowUpRef.current = false
  }, [followUpTimer, countdownInterval])

  const updateThreatSession = useCallback(
    (hasProtectionPlan = false, followedUp = false) => {
      if (!currentUser) return

      const threatData = {
        timestamp: Date.now(),
        hasProtectionPlan,
        followedUp
      }

      sessionStorage.setItem(
        `lastThreat_${currentUser.uid}`,
        JSON.stringify(threatData)
      )
    },
    [currentUser]
  )

  // Create a new conversation
  const createNewConversation = useCallback(
    async (showWarning = true) => {
      if (!currentUser) return

      // Prevent creating a new conversation if the current one is empty (only when user triggers)
      if (showWarning && messages.length === 0) {
        toast.warn(
          'Please send a message before starting a new conversation.',
          {
            position: 'top-right',
            autoClose: 2500
          }
        )
        return
      }

      try {
        const conversationId = await createConversation(currentUser.uid)
        setCurrentConversationId(conversationId)
        setMessages([])
        setConversationState({})
        clearFollowUpTimer()
        if (showWarning) {
          toast.success('New conversation started!', {
            position: 'top-right',
            autoClose: 2000
          })
        }
        return conversationId
      } catch (error) {
        console.error('Error creating new conversation:', error)
        if (showWarning) {
          toast.error('Failed to create new conversation')
        }
      }
    },
    [currentUser, clearFollowUpTimer, messages.length]
  )

  // Switch to a different conversation
  const switchConversation = useCallback(
    async (conversationId) => {
      if (!currentUser || !conversationId) return

      setCurrentConversationId(conversationId)

      // Clear current messages - they will be loaded by the useEffect
      setMessages([])
      setMessagesLoaded(false)

      // Reset conversation state
      setConversationState({})
      clearFollowUpTimer()
    },
    [currentUser, clearFollowUpTimer]
  )

  // Load conversations for the current user
  useEffect(() => {
    if (!currentUser) return
    let unsubscribe = null
    const loadConversations = async () => {
      await checkAndMigrateMessages(currentUser.uid)
      unsubscribe = listenForConversations(currentUser.uid, (snapshot) => {
        const newConversations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        setConversations(newConversations)
        if (!currentConversationId && newConversations.length > 0) {
          setCurrentConversationId(newConversations[0].id)
        } else if (!currentConversationId && newConversations.length === 0) {
          createNewConversation(false)
        }
      })
    }
    loadConversations()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [currentUser, currentConversationId, createNewConversation])

  // Load messages for the current conversation
  useEffect(() => {
    if (!currentUser || !currentConversationId) return
    let unsubscribe = listenForMessages(
      currentUser.uid,
      currentConversationId,
      (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...decryptFields(doc.data())
        }))
        setMessages(newMessages)
        setMessagesLoaded(true)
      }
    )
    return () => unsubscribe && unsubscribe()
  }, [currentUser, currentConversationId])

  const addMessage = useCallback(
    async (newMessage) => {
      try {
        await addMessageToConversation({
          newMessage,
          conversationId: currentConversationId,
          messagesLength: messages.length
        })
      } catch (error) {
        console.error('Error adding message:', error)
      }
    },
    [currentConversationId, messages.length]
  )

  const sendPPPInfoMessage = useCallback(() => {
    return sendPPPInfoMessageService(addMessage, currentUser, images)
  }, [addMessage, currentUser])

  const resetForNewIncident = useCallback(() => {
    return resetForNewIncidentService(
      clearFollowUpTimer,
      shouldSendFollowUpRef,
      lastActivityRef,
      isSendingFollowUpRef
    )
  }, [clearFollowUpTimer])

  const sendDisconnectionFollowUp = useCallback(() => {
    return sendDisconnectionFollowUpService({
      addMessage,
      currentUser,
      images,
      toast,
      currentConversationId
    })
  }, [addMessage, currentUser, currentConversationId])

  const sendInactivityFollowUp = useCallback(() => {
    return sendInactivityFollowUpService({
      addMessage,
      currentUser,
      images,
      clearFollowUpTimer,
      followUpSentForConversationRef,
      currentConversationId,
      isSendingFollowUpRef
    })
  }, [addMessage, currentUser, clearFollowUpTimer, currentConversationId])

  const checkAndSendFollowUp = useCallback(() => {
    return checkAndSendFollowUpService({
      isSendingFollowUpRef,
      messages,
      checkForProtectionPlanAfterThreat,
      shouldSendFollowUpRef,
      lastActivityRef,
      sendInactivityFollowUp,
      clearFollowUpTimer,
      followUpSentForConversationRef,
      currentConversationId
    })
  }, [
    messages,
    sendInactivityFollowUp,
    clearFollowUpTimer,
    currentConversationId
  ])

  const startFollowUpTimer = useCallback(() => {
    return startFollowUpTimerService({
      clearFollowUpTimer,
      shouldSendFollowUpRef,
      lastActivityRef,
      setFollowUpCountdown,
      checkForProtectionPlanAfterThreat,
      messages,
      setCountdownInterval,
      checkAndSendFollowUp,
      followUpSentForConversationRef,
      currentConversationId
    })
  }, [
    clearFollowUpTimer,
    checkAndSendFollowUp,
    messages,
    currentConversationId
  ])

  const updateActivityTimestamp = useCallback(() => {
    return updateActivityTimestampService(lastActivityRef)
  }, [])

  const resetActivityTimer = useCallback(() => {
    return resetActivityTimerService({
      shouldSendFollowUpRef,
      isSendingFollowUpRef,
      messages,
      checkForProtectionPlanAfterThreat,
      setFollowUpCountdown,
      clearFollowUpTimer
    })
  }, [messages, clearFollowUpTimer])

  useEffect(() => {
    const handleActivity = () => {
      updateActivityTimestamp()

      if (timerResetTimeoutRef.current) {
        clearTimeout(timerResetTimeoutRef.current)
      }

      timerResetTimeoutRef.current = setTimeout(() => {
        resetActivityTimer()
      }, 1000)
    }

    const events = [
      'keydown',
      'mousedown',
      'mousemove',
      'click',
      'scroll',
      'touchstart'
    ]

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
      if (timerResetTimeoutRef.current) {
        clearTimeout(timerResetTimeoutRef.current)
      }
    }
  }, [updateActivityTimestamp, resetActivityTimer])

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkOpenAIConnection()
      setIsOpenAIConnected(isConnected)
    }

    checkConnection()
  }, [])

  useEffect(() => {
    if (!messagesLoaded || hasSentProactiveFollowUpRef.current) return
    if (!currentUser) return
    if (!messages || messages.length === 0) return

    // Check if we've already processed messages for this session
    const sessionProcessedKey = `sessionProcessed_${currentUser.uid}`
    if (sessionStorage.getItem(sessionProcessedKey)) {
      return
    }

    // Check for previous session threat first
    const shouldSendPreviousSessionFollowUp = checkPreviousSessionThreat(
      currentConversationId
    )

    if (shouldSendPreviousSessionFollowUp) {
      sendDisconnectionFollowUp()
      hasSentProactiveFollowUpRef.current = true
      sessionStorage.setItem(sessionProcessedKey, 'true')
      return
    }

    // Mark this session as processed at the end
    sessionStorage.setItem(sessionProcessedKey, 'false')
  }, [
    messagesLoaded,
    messages,
    currentUser,
    sendDisconnectionFollowUp,
    sendInactivityFollowUp,
    checkPreviousSessionThreat,
    currentConversationId
  ])

  // Reset follow-up sent flag when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      if (!followUpSentForConversationRef.current[currentConversationId]) {
        followUpSentForConversationRef.current[currentConversationId] = false
      }
    }
  }, [currentConversationId])

  useEffect(() => {
    if (messages.length === 0) return

    const hasThreatDetected = messages.some(
      (msg) => msg.sender === 'AI' && msg.message?.threatDetected === true
    )

    const hasProtectionPlan = checkForProtectionPlanAfterThreat(messages)

    // Update threat status in localStorage whenever threat or PPP status changes
    if (hasThreatDetected) {
      updateThreatStatus(currentConversationId, hasProtectionPlan)
    }

    setIsThreatDetected(hasThreatDetected)

    let latestThreatIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (
        messages[i].sender === 'AI' &&
        messages[i].message?.threatDetected === true
      ) {
        latestThreatIndex = i
        break
      }
    }

    if (
      latestThreatIndex !== -1 &&
      latestThreatIndex !== lastThreatMessageIndexRef.current
    ) {
      lastThreatMessageIndexRef.current = latestThreatIndex
      resetForNewIncident()
    }

    const latestMessage = messages[messages.length - 1]
    if (
      latestMessage &&
      latestMessage.sender === 'AI' &&
      latestMessage.message?.dataObj?.protectionPlanGenerated === true
    ) {
      if (lastProcessedPPPRef.current !== latestMessage.id) {
        lastProcessedPPPRef.current = latestMessage.id
        setTimeout(() => sendPPPInfoMessage(), 1000)
        // Update threat status when PPP is generated
        updateThreatStatus(currentConversationId, true)
      } else {
        console.log('Info message already sent for this PPP, skipping...')
      }
    }

    if (hasProtectionPlan && (followUpTimer || countdownInterval)) {
      clearFollowUpTimer()
      return
    }

    if (
      hasThreatDetected &&
      !hasProtectionPlan &&
      !followUpTimer &&
      !countdownInterval &&
      !isSendingFollowUpRef.current
    ) {
      startFollowUpTimer()
    } else if (!hasThreatDetected || hasProtectionPlan) {
      clearFollowUpTimer()
    }
  }, [
    messages,
    startFollowUpTimer,
    clearFollowUpTimer,
    followUpTimer,
    countdownInterval,
    checkForProtectionPlanAfterThreat,
    resetForNewIncident,
    sendPPPInfoMessage,
    currentConversationId
  ])

  useEffect(() => {
    return () => {
      if (followUpTimer) {
        clearTimeout(followUpTimer)
      }
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, [followUpTimer, countdownInterval])

  const value = {
    messages,
    conversations,
    currentConversationId,
    addMessage,
    createNewConversation,
    switchConversation,
    isOpenAIConnected,
    conversationState,
    setConversationState,
    isLoading,
    setIsLoading,
    isGeneratingProtectionPlan,
    setIsGeneratingProtectionPlan,
    clearFollowUpTimer,
    followUpCountdown,
    isThreatDetected,
    setIsThreatDetected,
    hasProtectionPlan,
    setHasProtectionPlan
  }

  return (
    <SupportChatContext.Provider value={value}>
      {children}
    </SupportChatContext.Provider>
  )
}
