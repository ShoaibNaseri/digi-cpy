const stripeConfig = {
  stripeEnvironment: import.meta.env.VITE_STRIPE_ENVIRONMENT,
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  stripeSecretKey: import.meta.env.VITE_STRIPE_SECRET_KEY,
  stripeMonthlyPriceId: import.meta.env.VITE_STRIPE_PLAN_MONTHLY_ID,
  stripeYearlyPriceId: import.meta.env.VITE_STRIPE_PLAN_YEARLY_ID,
  stripeFamilyPriceId: import.meta.env.VITE_STRIPE_PLAN_FAMILY_ID,
  stripeBasicPriceId: import.meta.env.VITE_STRIPE_PLAN_BASIC_ID,
  stripePremiumPriceId: import.meta.env.VITE_STRIPE_PLAN_PREMIUM_ID
}

export default stripeConfig
