import { useMemo } from 'react'
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

const useEducatorMenuItems = () => {
  const menuItems = useMemo(
    () => [
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
    ],
    []
  )

  return menuItems
}

export default useEducatorMenuItems
