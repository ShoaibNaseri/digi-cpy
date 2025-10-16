# Google Tag Manager (GTM) Integration with Cookie Consent

This document describes the complete Google Tag Manager implementation for the Digipalz educational platform, including cookie consent integration, tracking setup, and usage guidelines.

## 🎯 Overview

The GTM integration provides:

- **Cookie Consent Compliance**: Full GDPR, CCPA, and PIPEDA compliance
- **Automatic Consent Mode**: Dynamic consent state management
- **Educational Tracking**: Specialized events for learning platforms
- **Privacy-First**: No tracking without explicit user consent
- **Development Tools**: Comprehensive testing and debugging tools

## 🏗️ Architecture

### Core Components

1. **GTM Service** (`src/services/gtm/gtmService.js`)

   - GTM container initialization
   - Data layer management
   - Consent mode integration

2. **GTM Configuration** (`src/config/gtm.js`)

   - Environment-specific GTM IDs
   - Event definitions and mappings
   - Custom dimensions configuration

3. **GTM Tracker** (`src/utils/gtmTracker.js`)

   - High-level tracking utilities
   - Educational event tracking
   - Consent-aware tracking

4. **React Hook** (`src/hooks/useGTM.js`)
   - React integration
   - Component-level tracking
   - Lifecycle event handling

## 🔧 Setup and Configuration

### 1. Environment Variables

Add your GTM container IDs to your environment files:

```env
# Development
REACT_APP_GTM_ID_DEV=GTM-XXXXXXX

# Staging
REACT_APP_GTM_ID_STAGING=GTM-XXXXXXX

# Production
REACT_APP_GTM_ID=GTM-XXXXXXX
```

### 2. GTM Container Setup

In your GTM container, configure:

#### Consent Mode Variables

- `ad_storage`
- `ad_user_data`
- `ad_personalization`
- `analytics_storage`
- `functionality_storage`
- `personalization_storage`
- `security_storage`

#### Custom Dimensions

- Custom Dimension 1: User Type (student, educator, admin)
- Custom Dimension 2: Subscription Plan (free, premium, school)
- Custom Dimension 3: Region (EU, US, CA, etc.)
- Custom Dimension 4: Consent Status (full, partial, essential_only)
- Custom Dimension 5: User Role (student, teacher, parent, admin)
- Custom Dimension 6: School Type (public, private, homeschool)
- Custom Dimension 7: Grade Level (k-2, 3-5, 6-8, 9-12)
- Custom Dimension 8: Device Type (mobile, tablet, desktop)

#### Custom Metrics

- Custom Metric 1: Session Duration
- Custom Metric 2: Game Completion Time
- Custom Metric 3: Lesson Progress
- Custom Metric 4: Quiz Score

### 3. Application Integration

The GTM integration is automatically initialized when the cookie consent system loads:

```jsx
// App.jsx
<CookieConsentProvider
  gtmOptions={{
    enabled: true,
    debug: process.env.NODE_ENV === 'development'
  }}
>
  <AppRoutes />
</CookieConsentProvider>
```

## 📊 Event Tracking

### Basic Usage

```javascript
import gtmTracker from '@/utils/gtmTracker'

// Track a lesson start
gtmTracker.trackLessonStart({
  lesson_id: 'lesson_123',
  lesson_name: 'Digital Safety Basics',
  subject: 'Digital Citizenship',
  grade_level: '6-8',
  difficulty: 'beginner'
})

// Track a game completion
gtmTracker.trackGameComplete({
  game_id: 'password_game',
  game_name: 'Password Inspector',
  score: 850,
  level_reached: 5,
  completion_time: 180,
  success: true
})
```

### React Hook Usage

```javascript
import { useGTM } from '@/hooks/useGTM'

function LessonComponent() {
  const { trackLessonStart, trackLessonComplete } = useGTM()

  useEffect(() => {
    trackLessonStart({
      lesson_id: 'lesson_123',
      lesson_name: 'Digital Safety Basics'
    })
  }, [])

  const handleLessonComplete = () => {
    trackLessonComplete({
      lesson_id: 'lesson_123',
      completion_time: 300,
      score: 95
    })
  }

  return (
    <div>
      {/* Lesson content */}
      <button onClick={handleLessonComplete}>Complete Lesson</button>
    </div>
  )
}
```

### Available Tracking Methods

#### Authentication Events

- `trackLogin(userData)`
- `trackRegistration(userData)`
- `trackLogout()`

#### Educational Events

- `trackLessonStart(lessonData)`
- `trackLessonComplete(lessonData)`
- `trackQuizStart(quizData)`
- `trackQuizComplete(quizData)`

#### Game Events

- `trackGameStart(gameData)`
- `trackGameComplete(gameData)`
- `trackLevelUp(levelData)`
- `trackAchievementUnlock(achievementData)`

#### E-commerce Events

- `trackSubscription(subscriptionData)`
- `trackPurchase(purchaseData)`

#### Engagement Events

- `trackVideoPlay(videoData)`
- `trackVideoComplete(videoData)`
- `trackDownload(downloadData)`
- `trackSearch(searchData)`

#### Page Tracking

- `trackPageView(pageData)`

## 🍪 Cookie Consent Integration

### Consent Mode Mapping

The system automatically maps cookie categories to GTM consent types:

| Cookie Category | GTM Consent Types                                  |
| --------------- | -------------------------------------------------- |
| Essential       | `security_storage`                                 |
| Performance     | `analytics_storage`                                |
| Functional      | `functionality_storage`, `personalization_storage` |
| Marketing       | `ad_storage`, `ad_user_data`, `ad_personalization` |

### Automatic Consent Updates

When users change their cookie preferences:

1. GTM consent mode is automatically updated
2. Appropriate tags are enabled/disabled
3. Consent change events are tracked
4. Non-consented cookies are cleared

### Consent Events

The system tracks all consent-related events:

```javascript
// Automatic tracking on consent changes
{
  event: 'consent_updated',
  consent_action: 'accept_all',
  preferences: {
    essential: true,
    performance: true,
    functional: true,
    marketing: true
  },
  categories_granted: ['essential', 'performance', 'functional', 'marketing'],
  categories_denied: []
}
```

## 🧪 Testing and Debugging

### Development Tools

In development mode, use the GTM Test Panel:

```jsx
import GTMTestPanel from '@/components/gtm/GTMTestPanel'

function App() {
  return (
    <div>
      {/* Your app content */}
      {process.env.NODE_ENV === 'development' && <GTMTestPanel />}
    </div>
  )
}
```

The test panel provides:

- Real-time consent status
- Event testing buttons
- Debug information
- Test result history

### Console Debugging

Enable debug logging in development:

```javascript
// Check GTM status
console.log(gtmTracker.getDebugInfo())

// Check consent status
console.log(gtmService.getConsentStatus())
```

### GTM Preview Mode

1. Enable GTM Preview mode in your GTM container
2. Visit your development site
3. Debug events in the GTM preview panel

## 🔐 Privacy and Compliance

### GDPR Compliance

- ✅ Explicit consent required for non-essential cookies
- ✅ Consent withdrawal support
- ✅ Data portability (consent export)
- ✅ Right to be forgotten (consent clearing)

### CCPA Compliance

- ✅ "Do Not Sell" support
- ✅ Opt-out mechanisms
- ✅ Clear disclosure of data collection

### PIPEDA Compliance

- ✅ Meaningful consent collection
- ✅ Clear explanations of cookie purposes
- ✅ Easy consent management

## 📈 Best Practices

### Event Naming

Use consistent, descriptive event names:

```javascript
// Good
trackLessonStart({ lesson_id: 'safety_101' })

// Avoid
trackEvent('lesson', { action: 'start' })
```

### Data Quality

Always include relevant context:

```javascript
trackQuizComplete({
  quiz_id: 'quiz_123',
  score: 85,
  total_possible: 100,
  completion_time: 120,
  attempts: 1,
  subject: 'Digital Safety'
})
```

### Performance

- Events are automatically queued when consent is not available
- Use consent-aware tracking methods
- Avoid tracking without user consent

### Security

- Never track PII without explicit consent
- Use hashed or anonymized user identifiers
- Regularly audit tracked data

## 🚀 Advanced Usage

### Custom Events

```javascript
gtmTracker.trackCustomEvent('custom_interaction', {
  interaction_type: 'button_click',
  element_id: 'help_button',
  page_section: 'header'
})
```

### User Properties

```javascript
gtmTracker.setUserProperties({
  user_type: 'premium',
  subscription_plan: 'family',
  registration_date: '2024-01-15'
})
```

### Conditional Tracking

```javascript
// Only track if user has consented to performance cookies
if (gtmTracker.canTrack('performance')) {
  gtmTracker.trackPageView()
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Events not appearing in GTM**

   - Check console for consent status
   - Verify GTM container ID
   - Ensure consent is granted for event type

2. **Consent mode not updating**

   - Check cookie preferences in browser
   - Verify consent service integration
   - Check for JavaScript errors

3. **Missing data in GA4**
   - Verify GTM tag configuration
   - Check GA4 measurement ID
   - Ensure consent mode is properly configured

### Debug Commands

```javascript
// Check if GTM is initialized
console.log(gtmService.getDebugInfo())

// Check consent status
console.log(gtmTracker.getDebugInfo())

// Manually update consent (for testing)
gtmService.updateConsentMode()

// View current data layer
console.log(window.dataLayer)
```

## 📋 Migration Guide

### From GA4 Direct Integration

1. Remove existing GA4 scripts
2. Configure GA4 in GTM container
3. Update tracking calls to use GTM tracker
4. Test consent mode functionality

### From GTM without Consent Mode

1. Update GTM container with consent mode settings
2. Add consent state variables
3. Update tag triggers to respect consent
4. Test with different consent states

## 🔗 Related Documentation

- [Cookie Consent Implementation](./COOKIE_INTEGRATION_GUIDE.md)
- [Privacy Policy Guidelines](./PRIVACY_POLICY.md)
- [Data Protection](./DATA_PROTECTION.md)
- [GTM Configuration Templates](./GTM_TEMPLATES.md)

## ⚡ Quick Start Checklist

- [ ] Set environment variables for GTM IDs
- [ ] Configure GTM container with consent mode
- [ ] Add custom dimensions and metrics
- [ ] Enable GTM in app configuration
- [ ] Test with GTMTestPanel in development
- [ ] Verify consent mode functionality
- [ ] Deploy to staging for testing
- [ ] Monitor events in GTM/GA4

## 📞 Support

For technical support or questions about the GTM implementation:

1. Check the debug panel in development mode
2. Review console logs for errors
3. Verify consent status and preferences
4. Test with different consent configurations

Remember: All tracking respects user consent preferences and privacy regulations. No data is collected without proper user consent.
