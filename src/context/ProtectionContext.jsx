import React, { createContext, useContext, useState } from 'react'

const ProtectionContext = createContext()

export const useProtection = () => {
  return useContext(ProtectionContext)
}

export const ProtectionProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)

  const openModal = (date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
    setSelectedReport(null)
  }

  return (
    <ProtectionContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        selectedDate,
        selectedReport,
        setSelectedReport
      }}
    >
      {children}
    </ProtectionContext.Provider>
  )
}

export default ProtectionProvider
