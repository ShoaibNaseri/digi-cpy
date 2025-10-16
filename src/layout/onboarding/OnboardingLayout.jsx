import MinorOnboardingHeader from '@/components/common/header/MinorOnboardingHeader'
import MinorOnboardingFooter from '@/components/common/footer/MinorOnboardingFooter'
import { Outlet } from 'react-router-dom'
import './OnboardingLayout.css'

const OnboardingLayout = () => {
  return (
    <main className=''>
      <Outlet />
    </main>
  )
}

export default OnboardingLayout
