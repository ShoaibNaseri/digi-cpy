import ParentProfile from '@/components/dashboard/profile/Profile'
import { ProfileProvider } from '@/context/ProfileContext'

const ParentMyProfilePage = () => {
  return (
    <ProfileProvider>
      <ParentProfile isAdminOrParent />
    </ProfileProvider>
  )
}

export default ParentMyProfilePage
