import { db } from '@/firebase/config'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  updateDoc
} from 'firebase/firestore'
import { encryptFields } from './encryptionService'

// Create a new conversation
export async function createConversation(userId) {
  const conversationsRef = collection(db, 'conversations')
  const newConversation = {
    userId,
    title: 'New Conversation',
    createdAt: new Date(),
    updatedAt: new Date(),
    messageCount: 0
  }
  const docRef = await addDoc(conversationsRef, encryptFields(newConversation))
  const conversationId = docRef.id
  await updateDoc(doc(db, 'conversations', conversationId), {
    id: conversationId
  })
  return conversationId
}

export async function addMessageToConversation({
  newMessage,
  conversationId,
  messagesLength
}) {
  const messagesRef = collection(db, 'messages')

  let messageToSave = {
    ...newMessage,
    conversationId,
    timestamp: new Date()
  }
  if (messageToSave.message && typeof messageToSave.message === 'object') {
    messageToSave.message = JSON.stringify({
      ...messageToSave.message,
      response:
        messageToSave.message.response || messageToSave.message.aiResponse
    })
  }

  await addDoc(messagesRef, encryptFields(messageToSave))

  if (conversationId) {
    await updateDoc(doc(db, 'conversations', conversationId), {
      messageCount: messagesLength + 1,
      updatedAt: new Date()
    })
  }
}

// Listen for conversations
export function listenForConversations(userId, callback) {
  const conversationsRef = collection(db, 'conversations')
  const q = query(
    conversationsRef,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )
  return onSnapshot(q, callback)
}

// Listen for messages in a conversation
export function listenForMessages(userId, conversationId, callback) {
  const messagesRef = collection(db, 'messages')
  const q = query(
    messagesRef,
    where('userId', '==', userId),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  )
  return onSnapshot(q, callback)
}

// Check for protection plan after threat
export function checkForProtectionPlanAfterThreat(messages) {
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
  if (latestThreatIndex === -1) return false
  for (let i = latestThreatIndex + 1; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.sender !== 'AI') continue
    if (msg.message?.dataObj?.protectionPlanGenerated === true) return true
    if (
      typeof msg.message?.aiResponse === 'string' &&
      msg.message.aiResponse.includes('Personal Protection Plan')
    )
      return true
    if (
      typeof msg.message === 'string' &&
      msg.message.includes('Personal Protection Plan')
    )
      return true
  }
  return false
}

// Send PPP info message
export async function sendPPPInfoMessage(addMessage, currentUser, images) {
  try {
    const infoMessage =
      "Great! I've generated a Personal Protection Plan for you. This plan contains important steps to help keep you safe. Please save this plan and show it to a trusted adult like a parent, teacher, or school counselor. They can help you follow through with the safety steps. Remember, you're not alone in this!"
    await addMessage({
      id: Date.now() + 2,
      image: images.supportMrAzabukiImage,
      message: {
        aiResponse: infoMessage,
        dataObj: { isPPPInfo: true }
      },
      sender: 'AI',
      userId: currentUser.uid
    })
  } catch (error) {
    console.error('Error sending PPP info message:', error)
  }
}

// Reset for new incident
export function resetForNewIncident(
  clearFollowUpTimer,
  shouldSendFollowUpRef,
  lastActivityRef,
  isSendingFollowUpRef
) {
  clearFollowUpTimer()
  shouldSendFollowUpRef.current = false
  lastActivityRef.current = Date.now()
  isSendingFollowUpRef.current = false
}

// Helper functions to check and set follow-up status
function hasInactivityFollowUp(conversationId) {
  return (
    localStorage.getItem(`INACTIVITY_FOLLOW_UP_${conversationId}`) === 'true'
  )
}

function hasDisconnectionFollowUp(conversationId) {
  return (
    localStorage.getItem(`DISCONNECTION_FOLLOW_UP_${conversationId}`) === 'true'
  )
}

function setInactivityFollowUp(conversationId) {
  localStorage.setItem(`INACTIVITY_FOLLOW_UP_${conversationId}`, 'true')
}

function setDisconnectionFollowUp(conversationId) {
  localStorage.setItem(`DISCONNECTION_FOLLOW_UP_${conversationId}`, 'true')
}

function getThreatStatus(conversationId) {
  const status = localStorage.getItem(`THREAT_STATUS_${conversationId}`)

  if (!status) return null
  return JSON.parse(status)
}

function clearThreatStatus(conversationId) {
  localStorage.removeItem(`THREAT_STATUS_${conversationId}`)
}

// Check for previous session threat
export function checkPreviousSessionThreat(conversationId) {
  if (!conversationId) {
    return false
  }

  const threatStatus = getThreatStatus(conversationId)
  if (!threatStatus) {
    return false
  }

  // If we already sent a disconnection follow-up for this conversation, don't send again
  if (hasDisconnectionFollowUp(conversationId)) {
    return false
  }

  // Check if the threat is still relevant (within 24 hours)
  const twentyFourHours = 24 * 60 * 60 * 1000
  const isRecent = Date.now() - threatStatus.timestamp < twentyFourHours
  const timeSinceDetection = Math.round(
    (Date.now() - threatStatus.timestamp) / (1000 * 60)
  ) // in minutes

  // Only follow up if there's no PPP and it's recent
  const shouldFollowUp = !threatStatus.hasPPP && isRecent

  return shouldFollowUp
}

// Update threat session status
export function updateThreatStatus(conversationId, hasPPP = false) {
  if (!conversationId) {
    return
  }

  if (hasPPP) {
  } else {
  }
}

// Send disconnection follow-up
export async function sendDisconnectionFollowUp({
  addMessage,
  currentUser,
  images,
  toast,
  currentConversationId
}) {
  if (!currentUser || !currentConversationId) return

  // Check if we should send a follow-up for this conversation
  if (!checkPreviousSessionThreat(currentConversationId)) {
    return
  }

  if (hasDisconnectionFollowUp(currentConversationId)) {
    return
  }

  try {
    const contextualMessage =
      'I noticed you had to leave during our previous conversation about a concerning situation. How are you feeling about that situation now? Would you like to continue talking about it?'
    await addMessage({
      id: Date.now(),
      image: images.supportMrAzabukiImage,
      message: {
        aiResponse: contextualMessage,
        dataObj: { isDisconnectionFollowUp: true }
      },
      sender: 'AI',
      userId: currentUser.uid
    })
    setDisconnectionFollowUp(currentConversationId)
    toast.info('Welcome back - continuing our previous conversation.', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: true
    })
  } catch (error) {
    console.error('Error sending disconnection follow-up message:', error)
  }
}

// Send inactivity follow-up
export async function sendInactivityFollowUp({
  addMessage,
  currentUser,
  images,
  clearFollowUpTimer,
  followUpSentForConversationRef,
  currentConversationId,
  isSendingFollowUpRef
}) {
  if (isSendingFollowUpRef.current) return
  if (followUpSentForConversationRef.current[currentConversationId]) return
  if (hasInactivityFollowUp(currentConversationId)) {
    clearFollowUpTimer()
    return
  }

  try {
    isSendingFollowUpRef.current = true
    const contextualMessage =
      "I noticed you haven't responded in a while. Are you still there? We can continue discussing the situation whenever you're ready."
    await addMessage({
      id: Date.now(),
      image: images.supportMrAzabukiImage,
      message: {
        aiResponse: contextualMessage,
        dataObj: { isInactivityFollowUp: true }
      },
      sender: 'AI',
      userId: currentUser.uid
    })
    clearFollowUpTimer()
    followUpSentForConversationRef.current[currentConversationId] = true
    setInactivityFollowUp(currentConversationId)
  } catch (error) {
    console.error('Error sending inactivity follow-up message:', error)
  } finally {
    isSendingFollowUpRef.current = false
  }
}

// Check and send follow-up
export function checkAndSendFollowUp({
  isSendingFollowUpRef,
  messages,
  checkForProtectionPlanAfterThreat,
  shouldSendFollowUpRef,
  lastActivityRef,
  sendInactivityFollowUp,
  clearFollowUpTimer,
  followUpSentForConversationRef,
  currentConversationId
}) {
  if (isSendingFollowUpRef.current) {
    return
  }
  if (followUpSentForConversationRef.current[currentConversationId]) {
    clearFollowUpTimer()
    return
  }
  if (hasInactivityFollowUp(currentConversationId)) {
    clearFollowUpTimer()
    return
  }

  const hasThreatDetected = messages.some(
    (msg) => msg.sender === 'AI' && msg.message?.threatDetected === true
  )
  const hasProtectionPlan = checkForProtectionPlanAfterThreat(messages)
  if (
    hasThreatDetected &&
    !hasProtectionPlan &&
    shouldSendFollowUpRef.current
  ) {
    const timeSinceActivity = Date.now() - lastActivityRef.current
    if (timeSinceActivity >= 300000) {
      sendInactivityFollowUp()
    } else {
    }
  } else {
    clearFollowUpTimer()
  }
}

// Start follow-up timer
export function startFollowUpTimer({
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
}) {
  if (followUpSentForConversationRef.current[currentConversationId]) {
    return
  }
  if (hasInactivityFollowUp(currentConversationId)) {
    return
  }

  clearFollowUpTimer()
  shouldSendFollowUpRef.current = true
  lastActivityRef.current = Date.now()
  setFollowUpCountdown(300)
  const newCountdownInterval = setInterval(() => {
    setFollowUpCountdown((prev) => {
      const newCount = prev - 1
      const timeSinceActivity = Date.now() - lastActivityRef.current
      const hasProtectionPlan = checkForProtectionPlanAfterThreat(messages)
      if (
        hasProtectionPlan ||
        followUpSentForConversationRef.current[currentConversationId] ||
        hasInactivityFollowUp(currentConversationId)
      ) {
        clearInterval(newCountdownInterval)
        setCountdownInterval(null)
        shouldSendFollowUpRef.current = false
        return 0
      }
      if (newCount <= 0) {
        if (timeSinceActivity >= 300000) {
          clearInterval(newCountdownInterval)
          setCountdownInterval(null)
          checkAndSendFollowUp()
          return 0
        } else {
          return 300
        }
      }
      return newCount
    })
  }, 1000)
  setCountdownInterval(newCountdownInterval)
}

// Update activity timestamp
export function updateActivityTimestamp(lastActivityRef) {
  lastActivityRef.current = Date.now()
}

// Reset activity timer
export function resetActivityTimer({
  shouldSendFollowUpRef,
  isSendingFollowUpRef,
  messages,
  checkForProtectionPlanAfterThreat,
  setFollowUpCountdown,
  clearFollowUpTimer
}) {
  if (shouldSendFollowUpRef.current && !isSendingFollowUpRef.current) {
    const hasThreatDetected = messages.some(
      (msg) => msg.sender === 'AI' && msg.message?.threatDetected === true
    )
    const hasProtectionPlan = checkForProtectionPlanAfterThreat(messages)
    if (hasThreatDetected && !hasProtectionPlan) {
      setFollowUpCountdown(300)
    } else {
      clearFollowUpTimer()
    }
  }
}
