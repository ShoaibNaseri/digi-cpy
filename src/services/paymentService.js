import { db, firebaseConfig } from '@/firebase/config'
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore'
import { decryptFields, encryptFields } from './encryptionService'
import { stripePromise } from '@/utils/stripeLoader'

export const savePaymentRecord = async (userId, email, planType, amount) => {
  try {
    const paymentData = {
      userId,
      email,
      planType,
      amount,
      status: 'completed',
      createdAt: serverTimestamp(),
      paymentDate: new Date().toISOString()
    }

    const paymentRef = await addDoc(
      collection(db, 'payments'),
      encryptFields(paymentData)
    )

    const subscriptionData = {
      subscription: {
        planType,
        amount,
        status: 'active',
        startDate: new Date().toISOString(),
        paymentId: paymentRef.id
      },
      email: encryptFields({ email }).email,
      updatedAt: serverTimestamp()
    }

    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, subscriptionData)

    return { success: true, paymentId: paymentRef.id }
  } catch (error) {
    console.error('Error saving payment record:', error)
    return { success: false, error: error.message }
  }
}

export const checkAndSavePaymentRecord = async (
  userId,
  email,
  planType,
  amount,
  sessionId
) => {
  try {
    // Check if payment record already exists with this sessionId
    const paymentsRef = collection(db, 'payments')
    const q = query(paymentsRef, where('sessionId', '==', sessionId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Payment record already exists, no need to create duplicate
      console.log('Payment record already exists for session:', sessionId)
      return {
        success: true,
        paymentId: querySnapshot.docs[0].id,
        alreadyExists: true
      }
    }

    // Payment record doesn't exist, create new one
    const paymentData = {
      userId,
      email,
      planType,
      amount,
      sessionId,
      status: 'completed',
      createdAt: serverTimestamp(),
      paymentDate: new Date().toISOString()
    }

    const paymentRef = await addDoc(
      collection(db, 'payments'),
      encryptFields(paymentData)
    )

    const subscriptionData = {
      subscription: {
        planType,
        amount,
        status: 'active',
        startDate: new Date().toISOString(),
        paymentId: paymentRef.id
      },
      email: encryptFields({ email }).email,
      updatedAt: serverTimestamp()
    }

    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, subscriptionData)

    return { success: true, paymentId: paymentRef.id, alreadyExists: false }
  } catch (error) {
    console.error('Error checking and saving payment record:', error)
    return { success: false, error: error.message }
  }
}

export const getPaymentRecord = async (sessionId) => {
  try {
    const paymentRef = doc(db, 'payments', sessionId)
    const paymentDoc = await getDoc(paymentRef)
    return decryptFields(paymentDoc.data())
  } catch (error) {
    console.error('Error getting payment record:', error)
    return { success: false, error: error.message }
  }
}

export const getLatestPaymentRecord = async (userId) => {
  try {
    const paymentsRef = collection(db, 'payments')
    const q = query(
      paymentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return { success: false, error: 'No payment records found' }
    }

    return decryptFields(querySnapshot.docs[0].data())
  } catch (error) {
    console.error('Error getting latest payment record:', error)
    return { success: false, error: error.message }
  }
}
export const getUserPaymentRecords = async (userId) => {
  try {
    const paymentsRef = collection(db, 'payments')
    const q = query(paymentsRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => decryptFields(doc.data()))
  } catch (error) {
    console.error('Error getting user payment records:', error)
    return { success: false, error: error.message }
  }
}

export const getSchoolPaymentRecords = async (schoolId) => {
  try {
    const paymentsRef = collection(db, 'payments')
    const q = query(
      paymentsRef,
      where('schoolId', '==', schoolId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))
  } catch (error) {
    console.error('Error getting school payment records:', error)
    return { success: false, error: error.message }
  }
}
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId)
    await updateDoc(paymentRef, {
      status,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return { success: false, error: error.message }
  }
}
export const updatePaymentSessionStatus = async (paymentId) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId)
    await updateDoc(paymentRef, {
      sessionStatus: 'completed',
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString(),
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return { success: false, error: error.message }
  }
}
export const saveSchoolPaymentRecord = async (payload) => {
  try {
    const docRef = doc(db, 'payments', payload.sessionId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return {
        ...decryptFields(docSnap.data()),
        isExists: true
      }
    } else {
      const paymentData = {
        ...payload,
        createdAt: serverTimestamp(),
        paymentDate: new Date().toISOString()
      }

      await setDoc(docRef, encryptFields(paymentData))
      return {
        ...paymentData,
        isExists: false
      }
    }
  } catch (error) {
    console.error('Error saving school payment record:', error)
    return { success: false, error: error.message }
  }
}

export const stripeCheckout = async (priceId, studentCount, selectedPlan) => {
  try {
    const stripe = await stripePromise

    if (!stripe) {
      throw new Error('Stripe failed to load')
    }

    const { error } = await stripe.redirectToCheckout({
      mode: 'subscription',
      lineItems: [
        {
          price: priceId,
          quantity: parseInt(studentCount)
        }
      ],
      successUrl: `${
        window.location.origin
      }/school-plan-options/school-payment?success=true&planType=${selectedPlan}&amount=${parseInt(
        studentCount
      )}&numOfSeats=${studentCount}`,
      cancelUrl: `${window.location.origin}/school-plan-options?plan=${selectedPlan}&numOfSeats=${studentCount}`,
      billingAddressCollection: 'required',
      submitType: 'pay'
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error in stripeCheckout:', error)
    return { success: false, error: error.message }
  }
}

export const getCheckoutSession = async (sessionId) => {
  try {
    const response = await fetch(
      `${firebaseConfig.functionsUrl}/getCheckoutSession?session_id=${sessionId}`
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error in getCheckoutSession:', error)
    return { success: false, error: error.message }
  }
}

export const createParentCheckoutSession = async (planType, userId, email) => {
  try {
    const response = await fetch(
      `${firebaseConfig.functionsUrl}/createParentCheckoutSession`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planType,
          userId,
          email
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create checkout session')
    }

    const data = await response.json()
    return { success: true, sessionId: data.sessionId }
  } catch (error) {
    console.error('Error creating parent checkout session:', error)
    return { success: false, error: error.message }
  }
}

export const redirectToParentCheckout = async (planType, userId, email) => {
  try {
    const { success, sessionId, error } = await createParentCheckoutSession(
      planType,
      userId,
      email
    )

    if (!success) {
      throw new Error(error)
    }

    // Load Stripe and redirect to checkout
    const stripe = await stripePromise
    if (!stripe) {
      throw new Error('Stripe failed to load')
    }

    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: sessionId
    })

    if (stripeError) {
      throw stripeError
    }

    return { success: true }
  } catch (error) {
    console.error('Error redirecting to parent checkout:', error)
    return { success: false, error: error.message }
  }
}

export const saveParentTrialRecord = async (userId, email, planType) => {
  try {
    const trialData = {
      userId,
      email,
      planType,
      status: 'trialing',
      trialStart: new Date().toISOString(),
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      createdAt: serverTimestamp()
    }

    const trialRef = await addDoc(
      collection(db, 'trials'),
      encryptFields(trialData)
    )

    // Update user record with trial information
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      trial: {
        planType,
        status: 'active',
        trialId: trialRef.id,
        trialStart: new Date().toISOString(),
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      updatedAt: serverTimestamp()
    })

    return { success: true, trialId: trialRef.id }
  } catch (error) {
    console.error('Error saving parent trial record:', error)
    return { success: false, error: error.message }
  }
}

export const getParentSubscriptionStatus = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' }
    }

    const userData = userDoc.data()
    const subscription = userData.subscription || null
    const trial = userData.trial || null

    return {
      success: true,
      subscription: subscription ? decryptFields(subscription) : null,
      trial: trial ? decryptFields(trial) : null
    }
  } catch (error) {
    console.error('Error getting parent subscription status:', error)
    return { success: false, error: error.message }
  }
}

export const checkTrialExpiration = async (userId) => {
  try {
    const { success, trial, error } = await getParentSubscriptionStatus(userId)

    if (!success) {
      return { success: false, error }
    }

    if (!trial) {
      return { success: false, error: 'No trial found' }
    }

    const trialEndDate = new Date(trial.trialEnd)
    const now = new Date()
    const isExpired = now > trialEndDate

    return {
      success: true,
      isExpired,
      trialEndDate,
      daysRemaining: isExpired
        ? 0
        : Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24))
    }
  } catch (error) {
    console.error('Error checking trial expiration:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get subscription data from the subscriptions collection by userID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription data with success status
 */
export const getSubscriptionByUserId = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' }
    }

    const subscriptionsRef = collection(db, 'subscriptions')
    const q = query(subscriptionsRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        success: true,
        subscriptions: [],
        message: 'No subscriptions found for this user'
      }
    }

    const subscriptions = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      subscriptions.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to readable dates
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        trialStart: data.trialStart?.toDate?.() || data.trialStart,
        trialEnd: data.trialEnd?.toDate?.() || data.trialEnd
      })
    })

    // Sort by creation date (newest first)
    subscriptions.sort((a, b) => {
      const dateA =
        a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
      const dateB =
        b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
      return dateB - dateA
    })

    return {
      success: true,
      subscriptions,
      activeSubscription:
        subscriptions.find((sub) =>
          ['active', 'trialing'].includes(sub.status)
        ) || null,
      totalSubscriptions: subscriptions.length
    }
  } catch (error) {
    console.error('Error fetching subscriptions by userId:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch subscription data'
    }
  }
}

export const cancelParentSubscription = async (subscriptionId) => {
  try {
    const response = await fetch(
      `${firebaseConfig.functionsUrl}/cancelParentSubscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionId
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to cancel subscription')
    }

    return { success: true }
  } catch (error) {
    console.error('Error cancelling parent subscription:', error)
    return { success: false, error: error.message }
  }
}

export const updateParentSubscriptionFeild = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { hasSubscription: true })
  } catch (error) {
    console.error('Error updating parent subscription feild:', error)
    return { success: false, error: error.message }
  }
}

export const getParentSubscriptionDetails = async (subscriptionId) => {
  try {
    if (!subscriptionId) {
      return { success: false, error: 'Subscription ID is required' }
    }

    const response = await fetch(
      `${firebaseConfig.functionsUrl}/getParentSubscriptionDetails?subscriptionId=${subscriptionId}`
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.error ||
          `HTTP ${response.status}: Failed to fetch subscription details`
      )
    }

    const data = await response.json()
    return { success: true, subscription: data }
  } catch (error) {
    console.error('Error fetching parent subscription details:', error)
    return { success: false, error: error.message }
  }
}

export const syncParentSubscription = async (userId, email) => {
  try {
    if (!userId || !email) {
      return { success: false, error: 'User ID and email are required' }
    }

    const response = await fetch(
      `${firebaseConfig.functionsUrl}/syncParentSubscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          email
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.error ||
          `HTTP ${response.status}: Failed to sync subscription`
      )
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error syncing parent subscription:', error)
    return { success: false, error: error.message }
  }
}
