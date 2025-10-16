/**
 * GTM Test Panel Component
 * Development tool for testing GTM integration and cookie consent
 * Only renders in development mode
 */

import React, { useState, useEffect } from 'react'
import { useCookieConsent } from '../../context/CookieConsentContext'
import gtmService from '../../services/gtm/gtmService'
import gtmTracker from '../../utils/gtmTracker'
import { GTM_EVENTS } from '../../config/gtm'

const GTMTestPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState({})
  const [testResults, setTestResults] = useState([])
  const { preferences, hasValidConsent } = useCookieConsent()

  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null
  }

  useEffect(() => {
    updateDebugInfo()
  }, [preferences])

  const updateDebugInfo = () => {
    setDebugInfo({
      gtmService: gtmService.getDebugInfo(),
      tracker: gtmTracker.getDebugInfo(),
      consent: {
        hasValidConsent,
        preferences,
        consentStatus: gtmService.getConsentStatus()
      }
    })
  }

  const addTestResult = (test, success, details = '') => {
    const result = {
      id: Date.now(),
      test,
      success,
      details,
      timestamp: new Date().toISOString()
    }
    setTestResults((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10 results
  }

  const runTest = (testName, testFn) => {
    try {
      testFn()
      addTestResult(testName, true, 'Test completed successfully')
    } catch (error) {
      addTestResult(testName, false, error.message)
    }
  }

  const testBasicTracking = () => {
    runTest('Basic Event Tracking', () => {
      gtmTracker.trackCustomEvent('test_event', {
        test_property: 'test_value',
        timestamp: new Date().toISOString()
      })
    })
  }

  const testConsentUpdate = () => {
    runTest('Consent Update', () => {
      gtmService.updateConsentMode()
    })
  }

  const testEducationalTracking = () => {
    runTest('Educational Event', () => {
      gtmTracker.trackLessonStart({
        lesson_id: 'test_lesson_123',
        lesson_name: 'Test Lesson',
        subject: 'Digital Safety',
        grade_level: '6-8'
      })
    })
  }

  const testGameTracking = () => {
    runTest('Game Event', () => {
      gtmTracker.trackGameStart({
        game_id: 'test_game_123',
        game_name: 'Test Game',
        game_type: 'educational',
        difficulty_level: 'medium'
      })
    })
  }

  const testPageView = () => {
    runTest('Page View', () => {
      gtmTracker.trackPageView({
        page_title: 'Test Page',
        content_group: 'Test'
      })
    })
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (!isOpen) {
    return (
      <div style={styles.closedPanel}>
        <button onClick={() => setIsOpen(true)} style={styles.openButton}>
          🏷️ GTM Debug
        </button>
      </div>
    )
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>GTM Test Panel</h3>
        <button onClick={() => setIsOpen(false)} style={styles.closeButton}>
          ✕
        </button>
      </div>

      <div style={styles.content}>
        {/* Status Section */}
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Status</h4>
          <div style={styles.statusGrid}>
            <div style={styles.statusItem}>
              <strong>GTM Initialized:</strong>
              <span
                style={{
                  color: debugInfo.gtmService?.isInitialized ? 'green' : 'red'
                }}
              >
                {debugInfo.gtmService?.isInitialized ? '✓' : '✗'}
              </span>
            </div>
            <div style={styles.statusItem}>
              <strong>GTM ID:</strong>
              <span>{debugInfo.gtmService?.gtmId || 'Not set'}</span>
            </div>
            <div style={styles.statusItem}>
              <strong>Valid Consent:</strong>
              <span style={{ color: hasValidConsent ? 'green' : 'orange' }}>
                {hasValidConsent ? '✓' : '✗'}
              </span>
            </div>
            <div style={styles.statusItem}>
              <strong>Data Layer Length:</strong>
              <span>{debugInfo.gtmService?.dataLayerLength || 0}</span>
            </div>
          </div>
        </section>

        {/* Consent Status */}
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Consent Status</h4>
          <div style={styles.consentGrid}>
            {preferences &&
              Object.entries(preferences).map(([category, enabled]) => (
                <div key={category} style={styles.consentItem}>
                  <span style={styles.categoryName}>{category}:</span>
                  <span
                    style={{
                      color: enabled ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}
                  >
                    {enabled ? '✓' : '✗'}
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* Test Buttons */}
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Test Events</h4>
          <div style={styles.buttonGrid}>
            <button onClick={testBasicTracking} style={styles.testButton}>
              Test Basic Event
            </button>
            <button onClick={testConsentUpdate} style={styles.testButton}>
              Test Consent Update
            </button>
            <button onClick={testEducationalTracking} style={styles.testButton}>
              Test Lesson Event
            </button>
            <button onClick={testGameTracking} style={styles.testButton}>
              Test Game Event
            </button>
            <button onClick={testPageView} style={styles.testButton}>
              Test Page View
            </button>
            <button onClick={updateDebugInfo} style={styles.refreshButton}>
              Refresh Debug Info
            </button>
          </div>
        </section>

        {/* Test Results */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h4 style={styles.sectionTitle}>Test Results</h4>
            <button onClick={clearResults} style={styles.clearButton}>
              Clear
            </button>
          </div>
          <div style={styles.resultsContainer}>
            {testResults.length === 0 ? (
              <p style={styles.noResults}>No test results yet</p>
            ) : (
              testResults.map((result) => (
                <div
                  key={result.id}
                  style={{
                    ...styles.resultItem,
                    borderLeftColor: result.success ? 'green' : 'red'
                  }}
                >
                  <div style={styles.resultHeader}>
                    <span style={styles.resultTest}>{result.test}</span>
                    <span
                      style={{
                        ...styles.resultStatus,
                        color: result.success ? 'green' : 'red'
                      }}
                    >
                      {result.success ? '✓' : '✗'}
                    </span>
                  </div>
                  {result.details && (
                    <div style={styles.resultDetails}>{result.details}</div>
                  )}
                  <div style={styles.resultTime}>
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Debug Info */}
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Debug Info</h4>
          <pre style={styles.debugInfo}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  )
}

const styles = {
  closedPanel: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 10000
  },
  openButton: {
    backgroundColor: '#7b34bf',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  panel: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '400px',
    maxHeight: '600px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    zIndex: 10000,
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
  },
  content: {
    maxHeight: '500px',
    overflowY: 'auto',
    padding: '16px'
  },
  section: {
    marginBottom: '20px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    fontSize: '12px'
  },
  consentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  consentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    fontSize: '12px'
  },
  categoryName: {
    textTransform: 'capitalize'
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  testButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.2s'
  },
  refreshButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  clearButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  resultsContainer: {
    maxHeight: '150px',
    overflowY: 'auto'
  },
  noResults: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    margin: 0
  },
  resultItem: {
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    borderLeft: '3px solid',
    fontSize: '12px'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  resultTest: {
    fontWeight: '500'
  },
  resultStatus: {
    fontWeight: 'bold'
  },
  resultDetails: {
    color: '#6b7280',
    fontSize: '11px',
    marginBottom: '4px'
  },
  resultTime: {
    color: '#9ca3af',
    fontSize: '10px'
  },
  debugInfo: {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '10px',
    maxHeight: '150px',
    overflow: 'auto',
    margin: 0
  }
}

export default GTMTestPanel
