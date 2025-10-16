import React, { useEffect, useState } from 'react'
import './Sidebar.css'
import { images } from '@/config/images'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logOut } from '@/services/authServices'
import Avatar from '../common/avatar/Avatar'
import { TbLogout } from 'react-icons/tb'
import { useAuth } from '@/context/AuthContext'
import userIcon from '@/assets/icons/user.svg'
import { getChildrenProfiles } from '@/services/parentService'

const Sidebar = ({ menuItems }) => {
  const location = useLocation()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [childProfile, setChildProfile] = useState(null)

  const missionsPath =
    location.pathname === '/dashboard/student/missions' ||
    location.pathname === '/dashboard/child/missions' ||
    location.pathname === '/dashboard/teacher/missions'

  const isParentOrChildPath =
    location.pathname.includes('/dashboard/parent') ||
    location.pathname.includes('/dashboard/child')

  const handleChangeUser = () => {
    navigate('/dashboard/parent/profiles')
  }

  const isTeacherPath = location.pathname.includes('/dashboard/teacher')

  const isChildPath = location.pathname.includes('/dashboard/child')

  useEffect(() => {
    if (currentUser && isChildPath) {
      const getChildProfile = async () => {
        const selectedProfile = JSON.parse(
          localStorage.getItem('selectedProfile')
        )
        const childProfiles = await getChildrenProfiles(currentUser.uid)
        const childProfile = childProfiles.find(
          (profile) => profile.childId === selectedProfile.childId
        )
        setChildProfile(childProfile)
      }
      getChildProfile()
    }
  }, [currentUser, isChildPath])

  const renderName = () => {
    if (isChildPath) {
      if (!childProfile) return ''
      return `${childProfile.firstName} ${childProfile.lastName}`
    }
    if (!currentUser) return ''
    return `${currentUser.firstName} ${currentUser.lastName}`
  }

  const renderRole = () => {
    if (isChildPath) {
      return 'CHILD'
    }
    return currentUser.role
  }

  return (
    <div className={`sidebar ${isTeacherPath ? 'teacher-sidebar' : ''}`}>
      <div className='sidebar-header'>
        <img src={images.digipalzLogoBlack} alt='Digipalz Logo' height={51} />
      </div>

      <div className='sidebar-user-profile'>
        <Avatar name={renderName()} size={80} />
        <div className='sidebar-user-info'>
          <h2>{renderName()}</h2>

          <div className='sidebar-user-status'>
            <img src={userIcon} alt='User' className='crown-icon' />
            <p>{renderRole()}</p>
          </div>
        </div>
      </div>

      <nav className='sidebar-menu'>
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className='sidebar-menu-text'>
            <div
              className={`sidebar-menu-item ${
                (item.text === 'Missions' && missionsPath) ||
                (item.text === 'Classroom' &&
                  (location.pathname === '/dashboard/teacher' ||
                    location.pathname === '/dashboard/teacher/classroom')) ||
                (item.text !== 'Missions' &&
                  item.text !== 'Classroom' &&
                  location.pathname === item.path)
                  ? 'active'
                  : ''
              }`}
            >
              <span className='menu-icon'>{item.icon}</span>
              {item.text}
            </div>
          </Link>
        ))}
      </nav>

      <div className='sidebar-menu-footer'>
        {isParentOrChildPath && (
          <button className='change-user-button' onClick={handleChangeUser}>
            Change User
          </button>
        )}
        <button className='auth-logout-button' onClick={logOut}>
          log out <TbLogout />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
