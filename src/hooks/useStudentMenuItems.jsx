import { FaUser } from 'react-icons/fa'
import { FaClipboardList } from 'react-icons/fa'

import { SiCircle } from 'react-icons/si'
import { PiChats } from 'react-icons/pi'
import { GiShieldEchoes } from 'react-icons/gi'
import { IoMdHelp } from 'react-icons/io'

const useStudentMenuItems = () => {
  return [
    {
      label: 'MAIN',
      items: [
        {
          text: 'Missions',
          path: '/dashboard/student/missions',
          icon: <SiCircle />
        },
        {
          text: 'Quizzes',
          path: '/dashboard/student/quizzes',
          icon: <FaClipboardList />
        },
        {
          text: 'Profile',
          path: '/dashboard/student/profile',
          icon: <FaUser />
        },
        // {
        //   text: 'Support Chat',
        //   path: '/dashboard/student/support-chat',
        //   icon: <PiChats />
        // },
        // {
        //   text: 'My Protection Plan',
        //   path: '/dashboard/student/my-protection-plan',
        //   icon: <GiShieldEchoes />
        // },
        {
          text: 'Help',
          path: '/dashboard/student/help',
          icon: <IoMdHelp />
        }
      ]
    }
  ]
}

export default useStudentMenuItems
