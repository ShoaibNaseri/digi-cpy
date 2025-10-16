import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'
import {
  FaBuilding,
  FaRegCalendarCheck,
  FaBook,
  FaRegChartBar,
  FaClipboardQuestion,
  FaKey
} from 'react-icons/fa6'
import { MdAssignment } from 'react-icons/md'
import { BiSupport } from 'react-icons/bi'
import { MdHelp } from 'react-icons/md'
import { CgProfile } from 'react-icons/cg'
import { useAuth } from '@/context/AuthContext'
import { getUserSchool } from '@/services/userService'
import { updateUser } from '@/services/adminService'
import './TeacherDashboardLayout.css'

const TeacherDashboardLayout = ({ hideSidebar }) => {
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchUserSchool = async () => {
      const userSchool = await getUserSchool(currentUser.schoolId)
      const isSchoolAddressChanged =
        userSchool.country !== currentUser.country ||
        userSchool.region !== currentUser.region

      if (isSchoolAddressChanged) {
        await updateUser(currentUser.uid, {
          country: userSchool.country || '',
          region: userSchool.region || ''
        })
      }
    }

    fetchUserSchool()
  }, [currentUser])

  const menuItems = [
    {
      icon: <FaBuilding />,
      text: 'Classroom',
      path: '/dashboard/teacher'
    },
    {
      icon: <FaKey />,
      text: 'Access Code',
      path: '/dashboard/teacher/access-code'
    },
    {
      icon: <FaRegCalendarCheck />,
      text: 'Mission Planner',
      path: '/dashboard/teacher/planner'
    },
    // {
    //   icon: <MdAssignment />,
    //   text: 'Assignments',
    //   path: '/dashboard/teacher/assignments'
    // },
    {
      icon: <FaClipboardQuestion />,
      text: 'Quizzes',
      path: '/dashboard/teacher/quizzes'
    },
    {
      icon: <FaBook />,
      text: 'Teacher Resources',
      path: '/dashboard/teacher/study-resources'
    },
    {
      icon: <FaRegChartBar />,
      text: 'Analytics',
      path: '/dashboard/teacher/analytics'
    },
    /* comment out since this is not on SOW
    {
      icon: <FaRocketchat />,
      text: 'Community',
      path: '/dashboard/teacher/community'
    },
    */
    {
      icon: <CgProfile />,
      text: 'Profile',
      path: '/dashboard/teacher/profile'
    },
    {
      icon: <MdHelp />,
      text: 'Help',
      path: '/dashboard/teacher/help'
    },
    {
      icon: <BiSupport />,
      text: 'Contact',
      path: '/dashboard/teacher/contact'
    }
  ]

  return (
    <div className='layout'>
      {!hideSidebar && <Sidebar menuItems={menuItems} />}
      <main className='TeacherDashboard_main__container'>
        <Outlet />
      </main>
    </div>
  )
}

export default TeacherDashboardLayout
