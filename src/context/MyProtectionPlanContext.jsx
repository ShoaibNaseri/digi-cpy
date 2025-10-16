import React, { createContext, useContext, useState } from 'react'

const MyProtectionPlanContext = createContext()

export const useMyProtectionPlan = () => {
  const context = useContext(MyProtectionPlanContext)
  if (!context) {
    throw new Error(
      'useMyProtectionPlan must be used within a MyProtectionPlanProvider'
    )
  }
  return context
}

export const MyProtectionPlanProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)

  const openModal = (date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDate('')
  }

  const value = {
    isModalOpen,
    selectedDate,
    openModal,
    closeModal,
    selectedReport,
    setSelectedReport
  }

  return (
    <MyProtectionPlanContext.Provider value={value}>
      {children}
    </MyProtectionPlanContext.Provider>
  )
}
