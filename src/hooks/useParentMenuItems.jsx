import { TbTarget } from 'react-icons/tb'
import {
  FaUser,
  FaQuestion,
  FaCreditCard,
  FaUsers,
  FaBookOpen,
  FaCog,
  FaPhone
} from 'react-icons/fa'

const useParentMenuItems = () => {
  return [
    {
      label: 'MAIN',
      items: [
        {
          text: 'Dashboard',
          path: '/dashboard/parent',
          icon: <TbTarget />
        },
        {
          text: 'Resources',
          path: '/dashboard/parent/teaching-resources',
          icon: <FaBookOpen />
        },
        {
          text: 'My Profile',
          path: '/dashboard/parent/profile',
          icon: <FaUser />
        },
        {
          text: 'My Children',
          path: '/dashboard/parent/add-child',
          icon: <FaUsers />
        },
        {
          text: 'Billings',
          path: '/dashboard/parent/billings',
          icon: <FaCreditCard />
        },
        {
          text: 'Help',
          path: '/dashboard/parent/help',
          icon: <FaQuestion />
        },
        {
          text: 'Contact',
          path: '/dashboard/parent/contact',
          icon: <FaPhone />
        }
      ]
    },
    {
      label: 'MANAGEMENT',
      items: [
        {
          text: 'Select Profile',
          path: '/dashboard/parent/profiles',
          icon: <FaUsers />
        }
      ]
    }
  ]
}

export default useParentMenuItems
