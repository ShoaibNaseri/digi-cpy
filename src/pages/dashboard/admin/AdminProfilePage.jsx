import AdminProfile from '@/components/dashboard/profile/Profile'
import { ProfileProvider } from '@/context/ProfileContext'

const AdminProfilePage = () => {
  return (
    <ProfileProvider>
      <AdminProfile isAdminOrParent />
    </ProfileProvider>
  )
}

export default AdminProfilePage
