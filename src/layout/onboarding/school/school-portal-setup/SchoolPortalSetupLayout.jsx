import { Outlet } from 'react-router-dom'
import './SchoolPortalSetupLayout.css'
// import SchoolOnboardingFooter from '@/components/common/footer/SchoolOnboardingFooter'
import { SchoolPortalProvider } from '@/context/SchoolPortalContext'
// import digipalzLogo from '@/assets/Digipalz-Black-Logo.png'

// const PortalHeader = () => {
//   return (
//     <header className='portal-header'>
//       <div className='portal-header__logo-container'>
//         <img
//           src={digipalzLogo}
//           alt='Digipalz'
//           className='portal-header__logo-image'
//         />
//       </div>
//     </header>
//   )
// }

const SchoolPortalSetupLayout = () => {
  return (
    <>
      <SchoolPortalProvider>
        {/* <PortalHeader /> */}
        <main className='portal-main'>
          <Outlet />
        </main>
      </SchoolPortalProvider>
      {/* <SchoolOnboardingFooter /> */}
    </>
  )
}

export default SchoolPortalSetupLayout
