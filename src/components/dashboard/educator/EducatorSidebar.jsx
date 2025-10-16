import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import './EducatorSidebar.css'
import { logOut } from '@/services/authServices'
import { useAuth } from '@/context/AuthContext'
import digipalzLogoBl from '@/assets/LandingPage/Digipalz_bl.png'
import Avatar from '../../common/avatar/Avatar'
import userIcon from '@/assets/icons/user.svg'
import logoutIcon from '@/assets/icons/log-out.svg'
import { PiCrownThin } from 'react-icons/pi'

const EducatorSidebar = ({ menuItems, hideSidebar }) => {
  const location = useLocation()
  const { currentUser } = useAuth()
  const [expandedItems, setExpandedItems] = useState({})

  const toggleExpanded = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const MenuItem = ({ item, index }) => {
    const isActive = location.pathname === item.path
    const isExpanded = expandedItems[index]
    const hasChildren = item.hasChildren && Array.isArray(item.children)

    // Check if any child is active
    const hasActiveChild =
      hasChildren &&
      item.children.some((child) => location.pathname === child.path)

    const menuItemContent = (
      <div
        className={`educator-menu-item ${isActive ? 'active' : ''} ${
          item.disabled ? 'disabled' : ''
        }`}
        onClick={hasChildren ? () => toggleExpanded(index) : undefined}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <span className='educator-menu-icon'>{item.icon}</span>
          <span>{item.text}</span>
        </div>
        {hasChildren && (
          <span className='educator-menu-chevron'>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}
      </div>
    )

    if (item.disabled) {
      return (
        <div key={index} className='educator-menu-text' aria-disabled='true'>
          {menuItemContent}
          {hasChildren && isExpanded && (
            <div className='educator-submenu'>
              {item.children.map((child, childIndex) => (
                <Link
                  key={childIndex}
                  to={child.path}
                  className={`educator-submenu-item ${
                    location.pathname === child.path ? 'active' : ''
                  }`}
                >
                  <span>{child.text}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (hasChildren) {
      return (
        <div key={index} className='educator-menu-text'>
          {menuItemContent}
          {isExpanded && (
            <div className='educator-submenu'>
              {item.children.map((child, childIndex) => (
                <Link
                  key={childIndex}
                  to={child.path}
                  className={`educator-submenu-item ${
                    location.pathname === child.path ? 'active' : ''
                  }`}
                >
                  <span>{child.text}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link key={index} to={item.path} className='educator-menu-text'>
        {menuItemContent}
      </Link>
    )
  }

  const renderName = () => {
    if (!currentUser) return ''
    return `${currentUser.firstName} ${currentUser.lastName}`
  }

  const renderRole = () => {
    return currentUser?.role || 'EDUCATOR'
  }

  return (
    hideSidebar && (
      <div className='educator-sidebar'>
        <div className='educator-sidebar-header'>
          <img src={digipalzLogoBl} alt='Digipalz Logo' />
        </div>

        <div className='educator-sidebar-user-profile'>
          <Avatar name={renderName()} size={70} />
          <div className='educator-sidebar-user-info'>
            <h2>{renderName()}</h2>
            <div className='educator-sidebar-user-status'>
              <PiCrownThin className='educator-crown-icon' />
              <p>{renderRole()}</p>
            </div>
          </div>
        </div>

        <nav className='educator-sidebar-menu'>
          {Array.isArray(menuItems) &&
            menuItems.length > 0 &&
            (typeof menuItems[0].label === 'string' &&
            Array.isArray(menuItems[0].items)
              ? menuItems.map((section, sectionIdx) => (
                  <div key={sectionIdx} className='educator-sidebar-section'>
                    <div className='educator-sidebar-section-label'>
                      {section.label}
                    </div>
                    {section.items.map((item, itemIdx) => (
                      <MenuItem key={itemIdx} item={item} index={itemIdx} />
                    ))}
                  </div>
                ))
              : menuItems.map((item, index) => (
                  <MenuItem key={index} item={item} index={index} />
                )))}
        </nav>

        <div className='educator-sidebar-footer'>
          <button className='educator-logout-button' onClick={logOut}>
            <img src={logoutIcon} alt='' />
            Logout
          </button>
        </div>
      </div>
    )
  )
}

export default EducatorSidebar
