import ChildProfile from '../../../components/dashboard/profile/Profile'
import { ProfileProvider } from '../../../context/ProfileContext'

const ChildProfilePage = () => {
  return (
    <ProfileProvider>
      <ChildProfile />
    </ProfileProvider>
  )
}

export default ChildProfilePage
