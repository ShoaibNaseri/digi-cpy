import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'
import { FaUser } from 'react-icons/fa'
import { FaClipboardList } from 'react-icons/fa'

import { SiCircle } from 'react-icons/si'
import { TbHelpSquareRoundedFilled } from 'react-icons/tb'
import { useAuth } from '@/context/AuthContext'
import { getUserSchool } from '@/services/userService'
import { useState, useEffect } from 'react'
import { getPaymentRecord } from '@/services/paymentService'
import './StudentDashboardLayout.css'
import { BiSupport } from 'react-icons/bi'

const ICON_SIZE = 20

import { updateUser } from '@/services/adminService'

const StudentDashboardLayout = ({ hideSidebar }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const isSupportChat = location.pathname === '/dashboard/student/support-chat'
  const { currentUser } = useAuth()
  const [isUserPremium, setIsUserPremium] = useState(false)

  useEffect(() => {
    const premiumOnlyPaths = [
      '/dashboard/student/support-chat',
      '/dashboard/student/my-protection-plan'
    ]

    const fetchUserSchool = async () => {
      const userSchool = await getUserSchool(currentUser.schoolId)
      const paymentRecord = await getPaymentRecord(userSchool.paymentId)

      const isSchoolAddressChanged =
        userSchool.country !== currentUser.country ||
        userSchool.region !== currentUser.region

      if (isSchoolAddressChanged) {
        await updateUser(currentUser.uid, {
          country: userSchool.country || '',
          region: userSchool.region || ''
        })
      }

      setIsUserPremium(paymentRecord.planType === 'premium')
      return paymentRecord.planType === 'premium'
    }

    const isPremium = fetchUserSchool()

    if (!isPremium && premiumOnlyPaths.includes(location.pathname)) {
      navigate('/dashboard/student')
    }
  }, [isUserPremium, location.pathname, navigate, currentUser])

  const menuItems = [
    {
      icon: <SiCircle size={ICON_SIZE} />,
      text: 'Missions',
      path: '/dashboard/student'
    },
    {
      icon: <FaClipboardList size={ICON_SIZE} />,
      text: 'Quizzes',
      path: '/dashboard/student/quizzes'
    },
    // {
    //   icon: <RiGraduationCapFill size={ICON_SIZE} />,
    //   text: 'Study Guide',
    //   path: '/dashboard/student/study-guide'
    // },
    // {
    //   icon: <IoMdChatbubbles size={ICON_SIZE} />,
    //   text: 'Support Chat',
    //   path: '/dashboard/student/support-chat'
    // },
    // {
    //   icon: <BsShieldFillCheck size={ICON_SIZE} />,
    //   text: 'My Protection Plan',
    //   path: '/dashboard/student/my-protection-plan'
    // },
    {
      icon: <FaUser size={ICON_SIZE} />,
      text: 'Profile',
      path: '/dashboard/student/profile'
    },
    {
      icon: <TbHelpSquareRoundedFilled size={ICON_SIZE} />,
      text: 'Help',
      path: '/dashboard/student/help'
    },
    {
      icon: <BiSupport size={ICON_SIZE} />,
      text: 'Contact',
      path: '/dashboard/student/contact'
    }
  ].filter(Boolean)

  return (
    <div className=' layout-student'>
      {!hideSidebar && <Sidebar menuItems={menuItems} />}
      <main
        className={`${
          isSupportChat ? 'main__container-support-chat' : 'main__container'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default StudentDashboardLayout
