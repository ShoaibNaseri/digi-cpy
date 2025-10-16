import { db } from '@/firebase/config'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  addDoc,
  orderBy 
} from 'firebase/firestore'

export const migrateExistingMessages = async (userId) => {
  try {
    
    // Get all messages for the user that don't have a conversationId
    const messagesRef = collection(db, 'messages')
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      where('conversationId', '==', null),
      orderBy('timestamp', 'asc')
    )
    
    const snapshot = await getDocs(q)
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    if (messages.length === 0) {
      return
    }
    
    // Create a default conversation for existing messages
    const conversationsRef = collection(db, 'conversations')
    const defaultConversation = {
      userId: userId,
      title: 'Previous Conversations',
      createdAt: messages[0]?.timestamp || new Date(),
      updatedAt: messages[messages.length - 1]?.timestamp || new Date(),
      messageCount: messages.length,
      isMigrated: true
    }
    
    const conversationDoc = await addDoc(conversationsRef, defaultConversation)
    const conversationId = conversationDoc.id
    
    // Update the conversation with its ID
    await updateDoc(doc(db, 'conversations', conversationId), {
      id: conversationId
    })
    
    // Update all messages with the conversationId
    const updatePromises = messages.map(message => 
      updateDoc(doc(db, 'messages', message.id), {
        conversationId: conversationId
      })
    )
    
    await Promise.all(updatePromises)
    
    console.log(`Successfully migrated ${messages.length} messages to conversation ${conversationId}`)
    
    return conversationId
  } catch (error) {
    console.error('Error migrating messages:', error)
    throw error
  }
}

export const checkAndMigrateMessages = async (userId) => {
  try {
    // Check if user has any messages without conversationId
    const messagesRef = collection(db, 'messages')
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      where('conversationId', '==', null)
    )
    
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      console.log('Found messages without conversationId, starting migration...')
      return await migrateExistingMessages(userId)
    }
    
    return null
  } catch (error) {
    console.error('Error checking for migration:', error)
    return null
  }
} 