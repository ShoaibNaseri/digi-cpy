import StudentProfile from '../../../components/dashboard/profile/Profile'
import { ProfileProvider } from '../../../context/ProfileContext'

const StudentProfilePage = () => {
  return (
    <ProfileProvider>
      <StudentProfile />
    </ProfileProvider>
  )
}

export default StudentProfilePage
