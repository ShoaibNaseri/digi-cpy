import { Outlet } from 'react-router-dom'
import '../admin/AdminDashboardLayout.css'
import EducatorSidebar from '@/components/dashboard/educator/EducatorSidebar'
import {
  EducatorDashboardProvider,
  useEducatorDashboard
} from '@/context/EducatorDashboardContext'
import {
  FaTachometerAlt,
  FaUsers,
  FaCog,
  FaBook,
  FaChartLine,
  FaCreditCard,
  FaShieldAlt,
  FaUser
} from 'react-icons/fa'
import { FaSchool } from 'react-icons/fa6'

const EducatorDashboardContent = () => {
  const { isSideBarOpen } = useEducatorDashboard()
  const menuItems = [
    {
      label: 'MAIN',
      items: [
        {
          text: 'Dashboard',
          path: '/dashboard/educator',
          icon: <FaTachometerAlt />
        },
        {
          text: 'School Details',
          path: '/dashboard/educator/school-details',
          icon: <FaSchool />
        }
      ]
    },
    {
      label: 'USERS',
      items: [
        {
          text: 'School Users',
          path: '/dashboard/educator/school-users',
          icon: <FaUsers />
        }
      ]
    },
    {
      label: 'MANAGEMENT',
      items: [
        {
          text: 'Lessons',
          path: '/dashboard/educator/lessons',
          icon: <FaBook />,
          disabled: false
        },
        {
          text: 'Analytics',
          path: '/dashboard/educator/analytics',
          icon: <FaChartLine />,
          disabled: true
        },
        {
          text: 'Billing',
          path: '/dashboard/educator/billing',
          icon: <FaCreditCard />
        }
      ]
    },
    {
      label: 'SETTINGS',
      items: [
        {
          text: 'My Profile',
          path: '/dashboard/educator/profile',
          icon: <FaUser />
        },
        {
          text: 'General Settings',
          path: '/dashboard/educator/general-settings',
          icon: <FaCog />,
          disabled: true
        },
        {
          text: 'Security',
          path: '/dashboard/educator/security',
          icon: <FaShieldAlt />,
          disabled: true
        }
      ]
    }
  ]

  return (
    <div className='admin-dashboard-layout'>
      <EducatorSidebar menuItems={menuItems} hideSidebar={isSideBarOpen} />
      <section>
        <main>
          <Outlet />
        </main>
      </section>
    </div>
  )
}

const EducatorDashboardLayout = () => {
  return (
    <EducatorDashboardProvider>
      <EducatorDashboardContent />
    </EducatorDashboardProvider>
  )
}

export default EducatorDashboardLayout
