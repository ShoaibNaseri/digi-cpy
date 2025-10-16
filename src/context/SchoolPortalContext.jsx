import { createContext, useContext, useState } from 'react'

const SchoolPortalContext = createContext()

export const SchoolPortalProvider = ({ children }) => {
  const [isEducatorDashboard, setIsEducatorDashboard] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [schoolDetails, setSchoolDetails] = useState({
    schoolName: '',
    schoolPhone: '',
    schoolAddress: '',
    country: 'US',
    schoolWebsite: '',
    schoolDistrict: ''
  })

  const [primaryContacts, setPrimaryContacts] = useState({
    principalName: '',
    principalEmail: '',
    vicePrincipalName: '',
    vicePrincipalEmail: '',
    itAdminName: '',
    itAdminEmail: '',
    educDepartmentName: '',
    educDepartmentEmail: ''
  })

  return (
    <SchoolPortalContext.Provider
      value={{
        isEducatorDashboard,
        setIsEducatorDashboard,
        currentStep,
        setCurrentStep,
        schoolDetails,
        setSchoolDetails,
        primaryContacts,
        setPrimaryContacts,
        users,
        setUsers,
        form,
        setForm,
        isModalOpen,
        setIsModalOpen
      }}
    >
      {children}
    </SchoolPortalContext.Provider>
  )
}

export const useSchoolPortal = () => {
  const context = useContext(SchoolPortalContext)

  if (!context) {
    throw new Error(
      'useSchoolPortal must be used within a SchoolPortalProvider'
    )
  }
  return context
}
