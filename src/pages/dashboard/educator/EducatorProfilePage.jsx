import EducatorProfile from '@/components/dashboard/profile/Profile'
import { ProfileProvider } from '@/context/ProfileContext'
import './EducatorProfilePage.css'

const EducatorProfilePage = () => {
  return (
    <ProfileProvider>
      <div className='educator-profile-page'>
        <EducatorProfile isAdmin='true' />
      </div>
    </ProfileProvider>
  )
}

export default EducatorProfilePage
