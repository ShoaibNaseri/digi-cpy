require('dotenv').config()
const klaviyoEmail = require('./klaviyoEmail')
const autoDeletions = require('./autoDeletions')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const stripe = require('stripe')(
  'sk_test_51RKRgvPKueASdmByq4yXa2kgv18izHcyVpDwLZtG9kQ4KMYUNEDbuz1GZ1xboD4ZS8NH2VbDFzwVBtHBSyE12eoC00GLci5aFy'
) // 🔁 Replace with your Stripe Secret Key
const serviceAccount = require('./serviceAccount.json')
const { setGlobalOptions } = require('firebase-functions/v2')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore()

const FIREBASE_REGION = process.env.VITE_FIREBASE_REGION || 'us-central1'

setGlobalOptions({
  region: FIREBASE_REGION
})

exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).send('')
  }

  const { seatCount, planType, email, userId } = req.body

  if (!seatCount || seatCount <= 0) {
    return res.status(400).json({ error: 'Invalid seat count' })
  }

  if (!planType || !['basic', 'premium'].includes(planType)) {
    return res.status(400).json({ error: 'Invalid plan type' })
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  const basePrices = {
    basic: 499, // $4.99
    premium: 599 // $5.99
  }
  const MONTHS_PER_YEAR = 10

  // Get discount rate - matching frontend logic exactly
  const getDiscountRate = (count) => {
    if (count >= 5000) return 0.15
    if (count >= 3000 && count <= 4999) return 0.13
    if (count >= 2000 && count <= 2999) return 0.09
    if (count >= 1000 && count <= 1999) return 0.07
    if (count >= 500 && count <= 999) return 0.05
    if (count >= 1 && count <= 499) return 0.0
    return null
  }

  const discount = getDiscountRate(seatCount)
  if (discount === null) {
    return res
      .status(400)
      .json({ error: 'Invalid seat count for discount calculation' })
  }

  // Calculate prices exactly as frontend does
  const unitPrice = basePrices[planType]
  const discountedPrice = unitPrice * (1 - discount)
  const totalPerSeat = Math.round(discountedPrice * MONTHS_PER_YEAR)
  const grandTotal = totalPerSeat * seatCount

  const discountText =
    discount > 0 ? `${discount * 100}% OFF` : 'Standard pricing'

  // Get frontend URL with fallback
  const frontendUrl =
    process.env.VITE_FRONTEND_URL || 'https://digipalz-10512.web.app'

  // Log the URL being used for debugging
  console.log('Using frontend URL:', frontendUrl)

  try {
    // Check for existing unpaid sessions for this user and delete them
    const unpaidSessionsQuery = await db
      .collection('payments')
      .where('userId', '==', userId)
      .where('sessionStatus', '==', 'unpaid')
      .get()

    if (!unpaidSessionsQuery.empty) {
      console.log(
        `Found ${unpaidSessionsQuery.size} unpaid sessions for user ${userId}, deleting them...`
      )

      // Delete all unpaid sessions
      const batch = db.batch()
      unpaidSessionsQuery.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()

      console.log(
        `Deleted ${unpaidSessionsQuery.size} unpaid sessions for user ${userId}`
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `DIGIPALZ SUBSCRIPTION - ${planType.toUpperCase()} PLAN`,
              description: `${seatCount} student seats - ${discountText} - ${MONTHS_PER_YEAR} months subscription`
            },
            unit_amount: totalPerSeat
          },
          quantity: seatCount
        }
      ],
      customer_creation: 'always',
      success_url: `${frontendUrl}/success-payment?success=true&session_id={CHECKOUT_SESSION_ID}&seats=${seatCount}&total=${grandTotal}&planType=${planType}&discount=${discount}`,
      cancel_url: `${frontendUrl}/home`,
      customer_email: email
    })

    // Optional: log the order in Firestore - temporarily disabled
    // await db.collection('orders').add({
    //   seatCount,
    //   discountApplied: seatCount > 200,
    //   total: Math.round(grandTotal),
    //   createdAt: admin.firestore.FieldValue.serverTimestamp()
    // })
    // Save payment session data to Firestore (before payment completion)
    const docRef = db.collection('payments').doc(session.id)
    const paymentData = {
      userId: userId,
      email: email,
      stripeSessionId: session.id,
      numOfSeats: seatCount,
      total: grandTotal,
      planType: planType,
      discount: discount * 100,
      perStudentPrice: totalPerSeat,
      paymentStatus: 'pending', // Set to pending since payment isn't complete yet
      sessionStatus: session.payment_status, // Keep original Stripe status
      paymentDate: null, // Will be set when payment completes
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    try {
      await docRef.set(paymentData)
      console.log(`Payment session created: ${session.id} for user: ${userId}`)
    } catch (firestoreError) {
      console.error(
        'Error saving payment session to Firestore:',
        firestoreError
      )
      // Don't fail the entire request if Firestore write fails
    }
    res.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({
      error: 'Failed to create Stripe session',
      details: error.message
    })
  }
})

exports.getCheckoutSession = functions.https.onRequest(async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  const { session_id } = req.query

  if (!session_id) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer']
    })

    res.json({
      customer_email: session.customer_details?.email || session.customer_email,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_details: session.customer_details
    })
  } catch (error) {
    console.error('Error retrieving session:', error)
    res.status(500).json({
      error: 'Failed to retrieve session details',
      details: error.message
    })
  }
})

exports.deleteStudentsByClassId = functions.https.onRequest(
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      return res.status(204).send('')
    }

    const { classId } = req.body

    if (!classId) {
      return res.status(400).json({ error: 'classId is required' })
    }

    try {
      const usersSnapshot = await db
        .collection('users')
        .where('classId', '==', classId)
        .where('role', '==', 'STUDENT')
        .get()

      if (usersSnapshot.empty) {
        return res
          .status(404)
          .json({ error: 'No students found for this classId' })
      }

      const deletePromises = usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id

        const quizzesSnapshot = await db
          .collection('studentQuizzes')
          .where('studentId', '==', userId)
          .get()
        const quizDeletes = quizzesSnapshot.docs.map((q) => q.ref.delete())
        await Promise.all(quizDeletes)

        try {
          await admin.auth().deleteUser(userId)
        } catch (err) {
          if (err.code !== 'auth/user-not-found') throw err
        }

        await userDoc.ref.delete()
      })

      await Promise.all(deletePromises)

      res.json({
        message:
          'All students in class deleted from users, studentQuizzes, and authentication.'
      })
    } catch (error) {
      console.error('Error deleting students:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

exports.createParentCheckoutSession = functions.https.onRequest(
  async (req, res) => {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).send('')
    }

    const { planType, userId, email } = req.body

    if (
      !planType ||
      ![
        'singleMonthly',
        'singleYearly',
        'multipleMonthly',
        'multipleYearly'
      ].includes(planType)
    ) {
      return res.status(400).json({ error: 'Invalid plan type' })
    }

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' })
    }

    // Define plan prices (in cents for Stripe)
    const planPrices = {
      singleMonthly: {
        name: 'Monthly Plan',
        amount: 999, // $9.99
        interval: 'month',
        description:
          'Monthly Plan - Complete access to all cyber safety missions'
      },
      singleYearly: {
        name: 'Yearly Plan',
        amount: 9500, // $99.00
        interval: 'year',
        description:
          'Yearly Plan - Complete access with two months free (20% savings)'
      },
      multipleMonthly: {
        name: 'Family Monthly Plan',
        amount: 1299, // $12.99
        interval: 'month',
        description: 'Family Plan - Access for up to 3 family members'
      },
      multipleYearly: {
        name: 'Family Yearly Plan',
        amount: 12500, // $125.00
        interval: 'year',
        description: 'Family Plan - Access for up to 3 family members'
      }
    }
    const selectedPlan = planPrices[planType]
    const TRIAL_PERIOD_DAYS = 7

    // Get frontend URL with fallback
    const frontendUrl =
      process.env.VITE_FRONTEND_URL || 'https://digipalz-10512.web.app'

    // Log the URL being used for debugging
    console.log('Using frontend URL for parent checkout:', frontendUrl)

    try {
      // Create the checkout session with trial period
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `DIGIPALZ ${planType.toUpperCase()} SUBSCRIPTION`,
                description: selectedPlan.description
              },
              unit_amount: selectedPlan.amount,
              recurring: {
                interval: selectedPlan.interval
              }
            },
            quantity: 1
          }
        ],
        subscription_data: {
          trial_period_days: TRIAL_PERIOD_DAYS,
          metadata: {
            userId: userId,
            planType: planType,
            subscriptionType: 'parent'
          }
        },
        metadata: {
          userId: userId,
          planType: planType,
          subscriptionType: 'parent'
        },
        success_url: `${frontendUrl}/onboarding/payment?success=true&session_id={CHECKOUT_SESSION_ID}&planType=${planType}&trial=true&amount=${
          selectedPlan.amount / 100
        }&email=${email}&userId=${userId}`,
        cancel_url: `${frontendUrl}/parent-plan-options`
      })

      // Save trial subscription record in Firestore
      await db.collection('subscriptions').add({
        userId: userId,
        email: email,
        planType: planType,
        status: 'trialing',
        stripeSessionId: session.id,
        trialStart: admin.firestore.FieldValue.serverTimestamp(),
        trialEnd: new Date(
          Date.now() + TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000
        ),
        interval: selectedPlan.interval,
        amount: selectedPlan.amount / 100, // Convert back to dollars for storage
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })

      res.json({ sessionId: session.id })
    } catch (error) {
      console.error('Stripe parent checkout error:', error)
      res.status(500).json({
        error: 'Failed to create parent subscription session',
        details: error.message
      })
    }
  }
)

exports.handleParentWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!endpointSecret) {
    console.error('Stripe webhook secret not configured')
    return res.status(500).send('Webhook secret not configured')
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log(
          'Processing checkout.session.completed for parent subscription:',
          session.id
        )

        if (session.metadata?.subscriptionType === 'parent') {
          // Update subscription status with both customer and subscription IDs
          const subscriptionsRef = db.collection('subscriptions')
          const snapshot = await subscriptionsRef
            .where('stripeSessionId', '==', session.id)
            .get()

          if (!snapshot.empty) {
            const doc = snapshot.docs[0]
            const subscriptionData = {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              status: 'trialing',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }

            await doc.ref.update(subscriptionData)
            console.log(
              `Updated subscription ${doc.id} with customer ID: ${session.customer} and subscription ID: ${session.subscription}`
            )

            // Also update the user document with subscription info
            const userData = doc.data()
            if (userData.userId) {
              await db
                .collection('users')
                .doc(userData.userId)
                .update({
                  subscription: {
                    planType: userData.planType,
                    status: 'trialing',
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription
                  },
                  hasSubscription: true,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })
              console.log(
                `Updated user ${userData.userId} with subscription details`
              )
            }
          } else {
            console.error(`No subscription found for session ID: ${session.id}`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        if (subscription.metadata?.subscriptionType === 'parent') {
          // Update subscription status when trial ends or subscription changes
          const subscriptionsRef = db.collection('subscriptions')
          const snapshot = await subscriptionsRef
            .where('stripeSubscriptionId', '==', subscription.id)
            .get()

          if (!snapshot.empty) {
            const doc = snapshot.docs[0]
            await doc.ref.update({
              status: subscription.status,
              currentPeriodStart: new Date(
                subscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })

            // If trial ended and subscription is now active, update user role
            if (subscription.status === 'active') {
              const userData = doc.data()
              await db
                .collection('users')
                .doc(userData.userId)
                .update({
                  subscription: {
                    planType: userData.planType,
                    status: 'active',
                    stripeSubscriptionId: subscription.id
                  },
                  hasSubscription: true,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })

              // Log successful subscription conversion
              console.log(
                `Trial successfully converted to active subscription for user: ${userData.userId}`
              )
            }

            // Handle past_due status (payment failed after trial)
            if (subscription.status === 'past_due') {
              const userData = doc.data()
              await db
                .collection('users')
                .doc(userData.userId)
                .update({
                  subscription: {
                    planType: userData.planType,
                    status: 'past_due',
                    stripeSubscriptionId: subscription.id
                  },
                  hasSubscription: false,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })

              console.log(`Subscription past due for user: ${userData.userId}`)
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        if (subscription.metadata?.subscriptionType === 'parent') {
          // Handle subscription cancellation
          const subscriptionsRef = db.collection('subscriptions')
          const snapshot = await subscriptionsRef
            .where('stripeSubscriptionId', '==', subscription.id)
            .get()

          if (!snapshot.empty) {
            const doc = snapshot.docs[0]
            const userData = doc.data()

            await doc.ref.update({
              status: 'cancelled',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })

            // Update user subscription status
            await db
              .collection('users')
              .doc(userData.userId)
              .update({
                subscription: {
                  planType: userData.planType,
                  status: 'cancelled',
                  stripeSubscriptionId: subscription.id
                },
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription
        )

        if (subscription.metadata?.subscriptionType === 'parent') {
          // Handle failed payment
          const subscriptionsRef = db.collection('subscriptions')
          const snapshot = await subscriptionsRef
            .where('stripeSubscriptionId', '==', invoice.subscription)
            .get()

          if (!snapshot.empty) {
            const doc = snapshot.docs[0]
            await doc.ref.update({
              status: 'past_due',
              lastPaymentError: 'Payment failed',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
})

exports.syncParentSubscription = functions.https.onRequest(async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).send('')
  }

  const { userId, email } = req.body

  if (!userId || !email) {
    return res.status(400).json({ error: 'User ID and email are required' })
  }

  try {
    console.log(`Syncing subscription for userId: ${userId}, email: ${email}`)

    // Find the subscription by userId and email (simplified query)
    const subscriptionsRef = db.collection('subscriptions')
    const snapshot = await subscriptionsRef
      .where('userId', '==', userId)
      .where('email', '==', email)
      .get()

    if (snapshot.empty) {
      console.log('No subscription found for this user')
      return res
        .status(404)
        .json({ error: 'No subscription found for this user' })
    }

    // Get the most recent subscription (if multiple exist)
    let subscriptionDoc = snapshot.docs[0]
    if (snapshot.docs.length > 1) {
      // Sort by createdAt if it exists, otherwise use the first one
      subscriptionDoc = snapshot.docs.sort((a, b) => {
        const aData = a.data()
        const bData = b.data()
        const aTime = aData.createdAt?.toDate
          ? aData.createdAt.toDate()
          : new Date(0)
        const bTime = bData.createdAt?.toDate
          ? bData.createdAt.toDate()
          : new Date(0)
        return bTime - aTime
      })[0]
    }

    const subscriptionData = subscriptionDoc.data()
    console.log('Found subscription:', subscriptionData)

    // If we already have both IDs, return the current data
    if (
      subscriptionData.stripeCustomerId &&
      subscriptionData.stripeSubscriptionId
    ) {
      console.log('Subscription already has both IDs, returning current data')
      return res.json({
        success: true,
        data: {
          stripeCustomerId: subscriptionData.stripeCustomerId,
          stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
          status: subscriptionData.status
        }
      })
    }

    console.log(
      'Missing IDs, checking for stripeSessionId:',
      subscriptionData.stripeSessionId
    )

    // Try to find the subscription using the session ID
    if (subscriptionData.stripeSessionId) {
      try {
        console.log(
          'Retrieving Stripe session:',
          subscriptionData.stripeSessionId
        )
        const session = await stripe.checkout.sessions.retrieve(
          subscriptionData.stripeSessionId,
          { expand: ['subscription'] }
        )

        console.log('Retrieved session:', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          status: session.status
        })

        if (session.subscription) {
          // Handle both string ID and expanded subscription object
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id

          console.log('Retrieving Stripe subscription:', subscriptionId)
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          )

          console.log('Retrieved subscription:', {
            id: subscription.id,
            status: subscription.status,
            customer: subscription.customer
          })

          // Update the subscription document with the missing IDs
          console.log('Updating subscription document with IDs')
          await subscriptionDoc.ref.update({
            stripeCustomerId: session.customer,
            stripeSubscriptionId: subscriptionId,
            billingCycleAnchor: subscription.billing_cycle_anchor,
            pyamentMethod: subscription.default_payment_method,
            canceledAt: subscription.canceled_at,
            cancelAt: subscription.cancel_at,
            paymentSettings: subscription.payment_settings,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            cancellationDetails: subscription.cancellation_details,
            status: subscription.status,
            items: subscription.items,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })

          // Update the user document
          console.log('Updating user document with subscription info')
          await db
            .collection('users')
            .doc(userId)
            .update({
              subscription: {
                planType: subscriptionData.planType,
                status: subscription.status,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: subscriptionId
              },
              hasSubscription: true,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })

          console.log('Successfully synced subscription data')
          return res.json({
            success: true,
            data: {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: subscriptionId,
              status: subscription.status
            }
          })
        } else {
          console.log('Session found but no subscription attached')
          return res.status(404).json({
            error: 'Session found but no subscription attached',
            sessionId: subscriptionData.stripeSessionId
          })
        }
      } catch (stripeError) {
        console.error('Error retrieving Stripe session:', stripeError)
        return res.status(500).json({
          error: 'Failed to sync with Stripe',
          details: stripeError.message,
          sessionId: subscriptionData.stripeSessionId
        })
      }
    }

    console.log('No stripeSessionId found in subscription data')
    return res
      .status(404)
      .json({ error: 'No Stripe session found for this subscription' })
  } catch (error) {
    console.error('Error syncing parent subscription:', error)
    res.status(500).json({
      error: 'Failed to sync subscription',
      details: error.message
    })
  }
})

exports.cancelParentSubscription = functions.https.onRequest(
  async (req, res) => {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).send('')
    }

    const { subscriptionId } = req.body

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' })
    }

    try {
      // Cancel the subscription in Stripe
      const cancelledSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true
        }
      )

      // Update the subscription status in Firestore
      const subscriptionsRef = db.collection('subscriptions')
      const snapshot = await subscriptionsRef
        .where('stripeSubscriptionId', '==', subscriptionId)
        .get()

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        const userData = doc.data()

        await doc.ref.update({
          status: 'cancel_at_period_end',
          cancelAtPeriodEnd: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })

        // Update user subscription status
        await db
          .collection('users')
          .doc(userData.userId)
          .update({
            subscription: {
              planType: userData.planType,
              status: 'cancel_at_period_end',
              stripeSubscriptionId: subscriptionId,
              cancelAtPeriodEnd: true
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
      }

      res.json({
        success: true,
        message:
          'Subscription will be cancelled at the end of the current billing period',
        subscription: cancelledSubscription
      })
    } catch (error) {
      console.error('Error cancelling parent subscription:', error)
      res.status(500).json({
        error: 'Failed to cancel subscription',
        details: error.message
      })
    }
  }
)

exports.handleSchoolPaymentWebhook = functions.https.onRequest(
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    const endpointSecret = process.env.STRIPE_SCHOOL_WEBHOOK_SECRET

    if (!endpointSecret) {
      console.error('Stripe school webhook secret not configured')
      return res.status(500).send('Webhook secret not configured')
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object

          // Check if this is a school payment (not parent subscription)
          if (session.metadata?.subscriptionType !== 'parent') {
            // Update payment status in Firestore
            const paymentRef = db.collection('payments').doc(session.id)
            const paymentDoc = await paymentRef.get()

            if (paymentDoc.exists) {
              await paymentRef.update({
                paymentStatus: 'completed',
                sessionStatus: session.payment_status,
                paymentDate: new Date().toISOString(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                stripeCustomerId: session.customer,
                paymentIntentId: session.payment_intent
              })

              console.log(`School payment completed: ${session.id}`)

              // Update user's subscription status
              const paymentData = paymentDoc.data()
              if (paymentData.userId) {
                await db
                  .collection('users')
                  .doc(paymentData.userId)
                  .update({
                    subscription: {
                      planType: paymentData.planType,
                      status: 'active',
                      numOfSeats: paymentData.numOfSeats,
                      total: paymentData.total,
                      stripeSessionId: session.id
                    },
                    hasSubscription: true,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                  })

                console.log(`User subscription updated: ${paymentData.userId}`)
              }
            }
          }
          break
        }

        case 'checkout.session.expired': {
          const session = event.data.object

          // Update payment status to expired
          const paymentRef = db.collection('payments').doc(session.id)
          await paymentRef.update({
            paymentStatus: 'expired',
            sessionStatus: session.payment_status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })

          console.log(`Payment session expired: ${session.id}`)
          break
        }

        default:
          console.log(`Unhandled school payment event type: ${event.type}`)
      }

      res.json({ received: true })
    } catch (error) {
      console.error('School payment webhook handler error:', error)
      res.status(500).json({ error: 'Webhook handler failed' })
    }
  }
)

exports.getParentSubscriptionDetails = functions.https.onRequest(
  async (req, res) => {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).send('')
    }

    const { subscriptionId } = req.query

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' })
    }

    try {
      console.log('Retrieving parent subscription details for:', subscriptionId)

      // Retrieve the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      console.log('Retrieved subscription:', {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end
      })

      // Return the Stripe data as-is without any modifications
      res.json({
        success: true,
        subscription: subscription
      })
    } catch (error) {
      console.error('Error retrieving parent subscription details:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve subscription details',
        details: error.message
      })
    }
  }
)

exports.getStript
exports.getStripeSubscription = stripe.subscriptions.retrieve
exports.getStripePaymentIntent = stripe.paymentIntents.retrieve
exports.getStripePaymentMethod = stripe.paymentMethods.retrieve
exports.getStripeInvoice = stripe.invoices.retrieve
exports.getStripeCharge = stripe.charges.retrieve
exports.getStripeRefund = stripe.refunds.retrieve
exports.sendKlaviyoInvitation = klaviyoEmail.sendKlaviyoInvitation

// Auto-deletion functions
exports.autoDeleteExpiredAccounts = autoDeletions.autoDeleteExpiredAccounts
exports.manualAutoDelete = autoDeletions.manualAutoDelete
exports.getCleanupStats = autoDeletions.getCleanupStats
