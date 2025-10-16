import React, { useEffect, useState, lazy, Suspense } from 'react'
import HeroBanner from './components/HeroBanner.jsx'
import HowWeTeach from './components/HowWeTeach.jsx'
import useLandingPageLoader from '../../hooks/useLandingPageLoader.js'
import './LandingPage.css'

// Lazy load below-the-fold components
const StaticsFact = lazy(() => import('./components/StaticsFact.jsx'))
const TopicsWeCover = lazy(() => import('./components/TopicsWeCover.jsx'))
const WhyKidsLoveDigipalz = lazy(() =>
  import('./components/WhyKidsLoveDigipalz.jsx')
)
const WhatParentsSay = lazy(() => import('./components/WhatParentsSay.jsx'))
const FrequentlyAskedQuestions = lazy(() =>
  import('./components/FrequentlyAskedQuestions.jsx')
)
const HelpYourChild = lazy(() => import('./components/HelpYourChild.jsx'))
const MeetTheTeam = lazy(() => import('./components/MeetTheTeam.jsx'))
const LandingPageSaying = lazy(() =>
  import('./components/LandingPageSaying.jsx')
)
const LandingPageFooter = lazy(() =>
  import('./components/LandingPageFooter.jsx')
)

const LandingPage = () => {
  const { isLoading, loadingProgress } = useLandingPageLoader()
  const [showBelowFold, setShowBelowFold] = useState(false)

  useEffect(() => {
    // Set page title and meta description
    document.title = 'Teach Kids Online Safety Through Play | Digipalz'

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Digipalz is an interactive educational game that teaches children how to stay safe online. Trusted by parents and educators, it makes learning cyber safety and digital citizenship fun and effective.'
      )
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content =
        'Digipalz is an interactive educational game that teaches children how to stay safe online. Trusted by parents and educators, it makes learning cyber safety and digital citizenship fun and effective.'
      document.head.appendChild(meta)
    }
  }, [])

  // Load below-the-fold content after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBelowFold(true)
    }, 100) // Small delay to ensure smooth transition

    return () => clearTimeout(timer)
  }, [])

  // Prevent scrolling while loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isLoading])

  return (
    <>
      <div className='digipalz-landing-page-content-hero-and-how-we-teach'>
        <HeroBanner />
        <HowWeTeach />
      </div>

      {showBelowFold && (
        <Suspense
          fallback={
            <div
              className='loading-placeholder'
              style={{ height: '200px', background: '#f5f5f5' }}
            />
          }
        >
          <StaticsFact />
          <TopicsWeCover />
          <WhyKidsLoveDigipalz />
          <WhatParentsSay />
          <FrequentlyAskedQuestions />
          <HelpYourChild />
          <MeetTheTeam />
          {/* <LandingPageSaying /> */}
          <LandingPageFooter />
        </Suspense>
      )}
    </>
  )
}

export default LandingPage
