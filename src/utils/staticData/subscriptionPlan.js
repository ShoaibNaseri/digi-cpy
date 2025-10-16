// Plan configuration constants
export const PLAN_TYPES = {
  SINGLE_MONTHLY: 'singleMonthly',
  SINGLE_YEARLY: 'singleYearly',
  MULTIPLE_MONTHLY: 'multipleMonthly',
  MULTIPLE_YEARLY: 'multipleYearly'
}

// Common features shared across plans
export const COMMON_FEATURES = {
  CORE_CURRICULUM: 'Core safety curriculum ( 10 Complete Lessons )',
  ADVANCED_CURRICULUM: 'Advanced safety curriculum ( 12 Complete Lessons )',
  BONUS_LESSONS: '2 bonus Lessons',
  QUIZZES: 'Quizzes',
  AUTOMATED_GRADING: 'Automated Grading',
  PARENTAL_CONTROLS: 'Parental Controls',
  PROGRESS_TRACKING: 'Progress Tracking Dashboard',
  MULTIPLE_ACCOUNTS: 'Plan include up to 3 child accounts'
}

// Single child plan options
export const SINGLE_CHILD_PLANS = {
  [PLAN_TYPES.SINGLE_MONTHLY]: {
    id: PLAN_TYPES.SINGLE_MONTHLY,
    title: 'Monthly Plan',
    price: '$9.99',
    period: '/per month',
    features: [
      COMMON_FEATURES.CORE_CURRICULUM,
      COMMON_FEATURES.QUIZZES,
      COMMON_FEATURES.AUTOMATED_GRADING,
      COMMON_FEATURES.PARENTAL_CONTROLS,
      COMMON_FEATURES.PROGRESS_TRACKING
    ],
    buttonText: 'Start Free Trial',
    isFeatured: false
  },
  [PLAN_TYPES.SINGLE_YEARLY]: {
    id: PLAN_TYPES.SINGLE_YEARLY,
    title: 'Yearly Plan',
    price: '$95',
    period: '/per year',
    features: [
      COMMON_FEATURES.ADVANCED_CURRICULUM,
      COMMON_FEATURES.BONUS_LESSONS,
      COMMON_FEATURES.QUIZZES,
      COMMON_FEATURES.AUTOMATED_GRADING,
      COMMON_FEATURES.PARENTAL_CONTROLS,
      COMMON_FEATURES.PROGRESS_TRACKING
    ],
    buttonText: 'Best Value - Start Free Trial',
    isFeatured: true,
    savings: 'SAVE 20%'
  }
}

// Multiple children plan options
export const MULTIPLE_CHILDREN_PLANS = {
  [PLAN_TYPES.MULTIPLE_MONTHLY]: {
    id: PLAN_TYPES.MULTIPLE_MONTHLY,
    title: 'Family Plan',
    price: '$12.99',
    period: '/per month',
    features: [
      COMMON_FEATURES.MULTIPLE_ACCOUNTS,
      COMMON_FEATURES.CORE_CURRICULUM,
      COMMON_FEATURES.QUIZZES,
      COMMON_FEATURES.AUTOMATED_GRADING,
      COMMON_FEATURES.PARENTAL_CONTROLS,
      COMMON_FEATURES.PROGRESS_TRACKING
    ],
    buttonText: 'Start Free Trial',
    isFeatured: false
  },
  [PLAN_TYPES.MULTIPLE_YEARLY]: {
    id: PLAN_TYPES.MULTIPLE_YEARLY,
    title: 'Family Plan',
    price: '$125',
    period: '/per year',
    features: [
      COMMON_FEATURES.MULTIPLE_ACCOUNTS,
      COMMON_FEATURES.ADVANCED_CURRICULUM,
      COMMON_FEATURES.BONUS_LESSONS,
      COMMON_FEATURES.QUIZZES,
      COMMON_FEATURES.AUTOMATED_GRADING,
      COMMON_FEATURES.PARENTAL_CONTROLS,
      COMMON_FEATURES.PROGRESS_TRACKING
    ],
    buttonText: 'Best Value - Start Free Trial',
    isFeatured: true,
    savings: 'SAVE 20%'
  }
}

// Trial banner configuration
export const TRIAL_BANNER = {
  header: 'No Payment Required',
  title: 'Start Your 14-Day Free Trial Today!',
  description:
    'Unlock all features and see the value for yourself. Cancel anytime during trial.'
}

// Individual plan exports for easy importing
export const SingleMonthly = SINGLE_CHILD_PLANS[PLAN_TYPES.SINGLE_MONTHLY]
export const SingleYearly = SINGLE_CHILD_PLANS[PLAN_TYPES.SINGLE_YEARLY]
export const MultipleMonthly =
  MULTIPLE_CHILDREN_PLANS[PLAN_TYPES.MULTIPLE_MONTHLY]
export const MultipleYearly =
  MULTIPLE_CHILDREN_PLANS[PLAN_TYPES.MULTIPLE_YEARLY]

// Legacy exports for backward compatibility
