import Navbar from '../../components/landingPage/Navbar/Navbar.jsx'
import { Outlet } from 'react-router-dom'
import './HomePageLayout.css'
import useLandingPageLoader from '../../hooks/useLandingPageLoader.js'
import LandingPagePreloader from '../../components/common/LandingPagePreloader.jsx'
import LandingPageFooter from '../../pages/landing/components/LandingPageFooter.jsx'
const HomePageLayout = () => {
  const { isLoading } = useLandingPageLoader()
  if (isLoading) {
    return <LandingPagePreloader isLoading={isLoading} />
  }
  return (
    <div
      className='digikelz-main-container'
      style={{
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      <div>
        <Navbar />
      </div>
      <div className='digipalz-landing-page-content'>
        <Outlet />
      </div>
    </div>
  )
}

export default HomePageLayout
