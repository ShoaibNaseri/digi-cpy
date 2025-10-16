import { createContext, useContext, useState, useEffect } from 'react'

const EducatorDashboardContext = createContext()

export const EducatorDashboardProvider = ({ children }) => {
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
    <EducatorDashboardContext.Provider
      value={{ isSideBarOpen, setIsSideBarOpen }}
    >
      {children}
    </EducatorDashboardContext.Provider>
  )
}

export const useEducatorDashboard = () => {
  const context = useContext(EducatorDashboardContext)

  if (!context) {
    throw new Error(
      'useEducatorDashboard must be used within a EducatorDashboardProvider'
    )
  }

  return context
}
