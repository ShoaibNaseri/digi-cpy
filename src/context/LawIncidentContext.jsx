import React, { createContext, useContext, useState } from 'react'

const LawIncidentContext = createContext()

export const useLawIncident = () => {
  const context = useContext(LawIncidentContext)
  if (!context) {
    throw new Error('useLawIncident must be used within a LawIncidentProvider')
  }
  return context
}

export const LawIncidentProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)

  const openModal = (date, report) => {
    setSelectedDate(date)
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDate('')
    setSelectedReport(null)
  }

  const value = {
    isModalOpen,
    selectedDate,
    selectedReport,
    openModal,
    closeModal
  }

  return (
    <LawIncidentContext.Provider value={value}>
      {children}
    </LawIncidentContext.Provider>
  )
}
