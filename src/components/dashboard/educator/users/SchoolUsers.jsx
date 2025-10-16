import './SchoolUsers.css'
import UserManagementContent from '../../../onboarding/school/school-portal-setup/user-management/UserManagementContent'
import { SchoolPortalProvider } from '@/context/SchoolPortalContext'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useEducatorMenuItems from '@/hooks/useEducatorMenuItems.jsx'

const SchoolUsers = () => {
  const menuItems = useEducatorMenuItems()

  return (
    <SchoolPortalProvider>
      <div className='educator-school-users'>
        <PageHeader
          title='School Users Management'
          subtitle='Manage teachers, students, and administrative users for your school'
          menuItems={menuItems}
        />
        <UserManagementContent isEducatorDashboard={true} />
      </div>
    </SchoolPortalProvider>
  )
}

export default SchoolUsers
