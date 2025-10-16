import EducatorDashboardHeader from './EducatorDashboardHeader'
import EducatorDashboardSchoolInfo from './EducatorDashboardSchoolInfo'
import EducatorDashboardStats from './EducatorDashboardStats'
import './EducatorDashboard.css'
import PageHeader from '../../common/dashboard-header/common/PageHeader'
import useEducatorMenuItems from '@/hooks/useEducatorMenuItems.jsx'
import { useAuth } from '@/context/AuthContext'
import { createStudentAchievementNotification } from '@/services/studentNotificationService'

const EducatorDashboard = () => {
  const menuItems = useEducatorMenuItems()
  const { currentUser } = useAuth()

  const generateNotification = () => {
    createStudentAchievementNotification(
      currentUser.uid,
      'Achievement',
      'Achievement description'
    )
  }

  return (
    <div className='educator-dashboard-container'>
      <div className='educator-dashboard-content'>
        {/* Header */}
        <PageHeader
          title='Dashboard'
          subtitle="Overview of your school's digital safety program"
          menuItems={menuItems}
        />

        {/* Stats Cards */}
        <EducatorDashboardStats />
      </div>
    </div>
  )
}

export default EducatorDashboard
