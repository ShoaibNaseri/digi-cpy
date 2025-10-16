import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import './AdminSidebar.css'
import { logOut } from '@/services/authServices'
import { images } from '@/config/images'
import digipalzLogoBl from '@/assets/LandingPage/Digipalz_bl.png'

const AdminSidebar = ({ menuItems, hideSidebar }) => {
  const location = useLocation()
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
        className={`menu-item ${isActive ? 'active' : ''} ${
          item.disabled ? 'disabled' : ''
        }`}
        onClick={hasChildren ? () => toggleExpanded(index) : undefined}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <span className='menu-icon'>{item.icon}</span>
          <span>{item.text}</span>
        </div>
        {hasChildren && (
          <span className='menu-chevron'>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}
      </div>
    )

    if (item.disabled) {
      return (
        <div key={index} className='menu-text' aria-disabled='true'>
          {menuItemContent}
          {hasChildren && isExpanded && (
            <div className='submenu'>
              {item.children.map((child, childIndex) => (
                <Link
                  key={childIndex}
                  to={child.path}
                  className={`submenu-item ${
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
        <div key={index} className='menu-text'>
          {menuItemContent}
          {isExpanded && (
            <div className='submenu'>
              {item.children.map((child, childIndex) => (
                <Link
                  key={childIndex}
                  to={child.path}
                  className={`submenu-item ${
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
      <Link key={index} to={item.path} className='menu-text'>
        {menuItemContent}
      </Link>
    )
  }

  return (
    hideSidebar && (
      <div className='admin-sidebar'>
        <div className='admin-sidebar-header'>
          <img src={digipalzLogoBl} alt='logo' />
        </div>

        <nav className='admin-sidebar-menu'>
          {Array.isArray(menuItems) &&
            menuItems.length > 0 &&
            (typeof menuItems[0].label === 'string' &&
            Array.isArray(menuItems[0].items)
              ? menuItems.map((section, sectionIdx) => (
                  <div key={sectionIdx} className='sidebar-section'>
                    <div className='sidebar-section-label'>{section.label}</div>
                    {section.items.map((item, itemIdx) => (
                      <MenuItem key={itemIdx} item={item} index={itemIdx} />
                    ))}
                  </div>
                ))
              : menuItems.map((item, index) => (
                  <MenuItem key={index} item={item} index={index} />
                )))}
        </nav>

        <div className='logout-section'>
          <button className='logout-button' onClick={logOut}>
            Logout
          </button>
        </div>
      </div>
    )
  )
}

export default AdminSidebar
