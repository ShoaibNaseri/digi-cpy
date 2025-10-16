# Cookie Consent Integration Guide

## How to Integrate Cookie Policy System into DigiPalz App

### Overview

This guide shows how to integrate the complete cookie consent system into your DigiPalz application using the secure, standard approach.

---

## 1. App-Level Integration (Recommended)

### Option A: Complete Integration with Context Provider

Update your main `App.jsx` to wrap the entire app:

```jsx
// src/App.jsx
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CookieConsentProvider } from './components/cookiesPolicy'
import Routes from './routes/routes'
import './app.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CookieConsentProvider
          routeIntegrationOptions={{
            autoShowSettingsOnPrivacyPages: true,
            privacyRoutes: [
              '/privacy-policy',
              '/cookie-policy',
              '/data-rights',
              '/terms-of-service'
            ],
            debugMode: process.env.NODE_ENV === 'development'
          }}
        >
          <Routes />
        </CookieConsentProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
```

### Option B: Layout-Level Integration

If you prefer to integrate at the layout level:

```jsx
// src/layout/MainLayout.jsx
import React from 'react'
import { CookieConsentProvider } from '../components/cookiesPolicy'

function MainLayout({ children }) {
  return (
    <div className='main-layout'>
      <CookieConsentProvider>{children}</CookieConsentProvider>
    </div>
  )
}

export default MainLayout
```

---

## 2. Privacy Pages Integration

### Privacy Policy Page

```jsx
// src/pages/legal/PrivacyPolicy.jsx
import React from 'react'
import {
  usePrivacyPageCookies,
  CookieControls
} from '../components/cookiesPolicy'

function PrivacyPolicy() {
  // This hook automatically shows cookie settings on privacy pages
  const { showCookieSettings } = usePrivacyPageCookies()

  return (
    <div className='privacy-policy'>
      <h1>Privacy Policy</h1>

      {/* Your privacy policy content */}
      <section>
        <h2>How We Use Cookies</h2>
        <p>We use cookies to enhance your experience...</p>

        {/* Add cookie controls directly in the page */}
        <CookieControls showLabels={true} />
      </section>
    </div>
  )
}

export default PrivacyPolicy
```

### Cookie Policy Page

```jsx
// src/pages/legal/CookiePolicy.jsx
import React from 'react'
import {
  usePrivacyPageCookies,
  useCookieConsent
} from '../components/cookiesPolicy'

function CookiePolicy() {
  usePrivacyPageCookies() // Auto-show settings
  const { preferences, locationInfo, getConsentSummary } = useCookieConsent()

  const summary = getConsentSummary()

  return (
    <div className='cookie-policy'>
      <h1>Cookie Policy</h1>

      {/* Show current consent status */}
      {summary.hasConsent && (
        <div className='current-consent'>
          <h3>Your Current Settings</h3>
          <p>
            You have consented to {summary.categoriesAccepted} of{' '}
            {summary.totalCategories} cookie categories.
          </p>
          <p>Compliance region: {locationInfo?.region?.toUpperCase()}</p>
        </div>
      )}

      {/* Your cookie policy content */}
    </div>
  )
}

export default CookiePolicy
```

---

## 3. Settings/Dashboard Integration

### User Dashboard Integration

```jsx
// src/pages/dashboard/UserSettings.jsx
import React from 'react'
import {
  CookieControls,
  useCookieConsent
} from '../../components/cookiesPolicy'

function UserSettings() {
  const { exportUserData } = useCookieConsent()

  return (
    <div className='user-settings'>
      <h2>Account Settings</h2>

      {/* Other settings */}

      <section className='privacy-settings'>
        <h3>Privacy & Cookies</h3>
        <CookieControls className='cookie-settings-section' />
      </section>
    </div>
  )
}

export default UserSettings
```

---

## 4. Manual Control Examples

### Using the Hook Directly

```jsx
import React from 'react'
import { useCookieConsent } from './components/cookiesPolicy'

function CustomComponent() {
  const {
    hasValidConsent,
    preferences,
    showCookieSettings,
    acceptAllCookies,
    rejectAllCookies,
    withdrawConsent,
    isCategoryConsented
  } = useCookieConsent()

  // Check if analytics is allowed before loading
  React.useEffect(() => {
    if (isCategoryConsented('performance')) {
      // Load analytics
      console.log('Analytics allowed, loading...')
    }
  }, [isCategoryConsented])

  return (
    <div>
      <p>Consent status: {hasValidConsent ? 'Given' : 'Not given'}</p>
      <button onClick={showCookieSettings}>Manage Cookies</button>
    </div>
  )
}
```

### Conditional Content Based on Consent

```jsx
import React from 'react'
import { useCookieConsent } from './components/cookiesPolicy'

function AnalyticsComponent() {
  const { isCategoryConsented } = useCookieConsent()

  if (!isCategoryConsented('performance')) {
    return (
      <div className='analytics-blocked'>
        <p>Analytics disabled. Enable performance cookies to see insights.</p>
      </div>
    )
  }

  return (
    <div className='analytics-dashboard'>{/* Your analytics content */}</div>
  )
}
```

---

## 5. Testing & Development

### Testing Different Regions

Add these URL parameters to test different compliance rules:

- `?region=eu` - European Union (GDPR)
- `?region=uk` - United Kingdom (UK GDPR)
- `?region=us_ca` - California (CCPA)
- `?region=ca` - Canada (PIPEDA)
- `?region=other` - Rest of world

Example: `http://localhost:3000?region=eu`

### Testing Cookie Settings

- `?cookies=show` - Force show cookie settings modal
- `?region=eu&cookies=show` - Test EU compliance with settings open

### Development Console Commands

```javascript
// Available in development mode
window.digipalzCookieManager.showSettings()
window.digipalzCookieManager.getPreferences()
window.digipalzCookieManager.exportData()
window.digipalzCookieManager.withdrawConsent()
```

---

## 6. Route-Based Integration

### Automatic Settings Display

Routes that automatically show cookie settings:

- `/privacy-policy`
- `/cookie-policy`
- `/data-rights`
- `/terms-of-service`

### Custom Route Integration

```jsx
import { useCookieRouteIntegration } from './hooks/useCookieRouteIntegration'

function CustomPage() {
  const { routeUtils } = useCookieRouteIntegration({
    privacyRoutes: ['/my-custom-privacy-page'],
    autoShowSettingsOnPrivacyPages: true
  })

  return (
    <div>
      {routeUtils.isPrivacyRoute() && (
        <div className='privacy-notice'>
          This page contains privacy-related information.
        </div>
      )}
    </div>
  )
}
```

---

## 7. Styling Integration

The components use your existing CSS variables:

```css
/* Already integrated with your color scheme */
:root {
  --lp-color-neon: #cafd06; /* Used for accents */
  --lp-black-color: #000000; /* Used for text */
  --lp-font-size-16: 1rem; /* Used for sizing */
  /* ... other existing variables */
}

/* Purple buttons use: #7b34bf (your existing color) */
/* Neon green accents use: var(--lp-color-neon) */
```

### Custom Styling

Override specific components if needed:

```css
/* Custom banner styling */
.cookie-banner {
  /* Your custom styles */
}

/* Custom modal styling */
.cookie-settings-modal {
  /* Your custom styles */
}

/* Custom controls styling */
.cookie-controls {
  /* Your custom styles */
}
```

---

## 8. Security Considerations

### Data Protection

- All sensitive data is encrypted
- Secure cookie attributes are used
- No PII is stored without explicit consent
- GDPR data portability is supported

### Best Practices

- Context provider prevents prop drilling
- Memoized values prevent unnecessary re-renders
- Error boundaries protect the app
- Graceful degradation when services fail

---

## 9. Analytics Integration (Future)

When you're ready to add analytics:

```jsx
import { useCookieConsent } from './components/cookiesPolicy'

function useAnalytics() {
  const { isCategoryConsented } = useCookieConsent()

  React.useEffect(() => {
    if (isCategoryConsented('performance')) {
      // Initialize Google Analytics
      gtag('config', 'GA_MEASUREMENT_ID', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=Lax;Secure'
      })
    }
  }, [isCategoryConsented])
}
```

---

## 10. Troubleshooting

### Common Issues

1. **Banner not showing**: Check if consent is already given
2. **Settings not opening**: Ensure context provider is wrapped correctly
3. **Styling issues**: Verify CSS variables are defined
4. **Route integration not working**: Check React Router setup

### Debug Mode

Enable debug mode for detailed logging:

```jsx
<CookieConsentProvider
  routeIntegrationOptions={{
    debugMode: true
  }}
>
```

---

## Summary

The cookie consent system is now ready for integration! It provides:

✅ **Secure & Standard**: Follows React best practices and security standards  
✅ **Auth Integration**: Seamlessly works with your existing AuthContext  
✅ **Route Awareness**: Automatically handles privacy pages  
✅ **Full Compliance**: GDPR, CCPA, and PIPEDA compliant  
✅ **Beautiful UI**: Matches your app's design system  
✅ **Developer Friendly**: Easy to integrate and customize

Choose the integration approach that best fits your app architecture!
