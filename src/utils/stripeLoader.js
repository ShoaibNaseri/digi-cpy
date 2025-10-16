// src/utils/stripe.js
import { loadStripe } from '@stripe/stripe-js'

// Replace with your actual Stripe **publishable** key
export const stripePromise = loadStripe(
  'pk_test_51RKRgvPKueASdmByWh3lVBAhTIQu2V8M53iRzci2huq48CPPRzMx5LE6sTFLzf06JehArHo0t3EKvoihum3GgOox00265tncNr'
)
