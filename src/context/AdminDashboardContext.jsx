import { createContext, useContext, useState, useEffect } from 'react'

const AdminDashboardContext = createContext()

export const AdminDashboardProvider = ({ children }) => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')

    setIsSideBarOpen(!mediaQuery.matches)

    const handleResize = (e) => {
      setIsSideBarOpen(!e.matches)
    }

    mediaQuery.addEventListener('change', handleResize)

    return () => {
      mediaQuery.removeEventListener('change', handleResize)
    }
  }, [])

  return (
    <AdminDashboardContext.Provider value={{ isSideBarOpen, setIsSideBarOpen }}>
      {children}
    </AdminDashboardContext.Provider>
  )
}

export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext)

  if (!context) {
    throw new Error(
      'useAdminDashboard must be used within a AdminDashboardProvider'
    )
  }

  return context
}
