import './app.css'
import { AuthProvider } from '@/context/AuthContext'
import { ProfileProvider } from '@/context/ProfileContext'
import { ImageProvider } from '@/context/ImageContext'
import { NotificationAlertProvider } from '@/context/NotificationAlertContext'
import { CookieConsentProvider } from '@/components/cookiesPolicy'
import AppRoutes from '@/routes/routes'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import sessionTracker from '@/utils/sessionTracker'
import { AccessibleImages } from '@/components/accessibility/Accessibility'
import { TabNav } from '@/components/tabNavigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GTMTestPanel } from '@/components/gtm'
import '@/utils/gtmDebug' // Import GTM debug utilities

const queryClient = new QueryClient()

function App() {
  useEffect(() => {
    // Cleanup session tracking when app unmounts
    return () => {
      sessionTracker.endSession()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <ImageProvider>
            <NotificationAlertProvider>
              <TabNav addSkipLink={true} autoEnhance={true}>
                <AccessibleImages>
                  <CookieConsentProvider
                    routeIntegrationOptions={{
                      autoShowSettingsOnPrivacyPages: true,
                      privacyRoutes: [
                        '/privacy-policy',
                        '/cookie-policy',
                        '/data-rights',
                        '/terms-of-service'
                      ]
                    }}
                  >
                    <AppRoutes />

                    {/* GTM Test Panel - Development Only (inside CookieConsentProvider) */}
                    {/* <GTMTestPanel /> */}
                  </CookieConsentProvider>
                </AccessibleImages>
              </TabNav>
              <Toaster
                position='bottom-right'
                duration={2000}
                toastOptions={{
                  style: {
                    background: 'rgba(255, 255, 255, 0.15)', // transparent white
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)', // Safari support
                    border: '1px solid rgba(255, 255, 255, 0.3)', // thin glass border
                    borderRadius: '16px', // rounded corners
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' // soft shadow
                  }
                }}
              />
            </NotificationAlertProvider>
          </ImageProvider>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
