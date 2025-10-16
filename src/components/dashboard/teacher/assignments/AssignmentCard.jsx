import React from 'react'
import { motion } from 'framer-motion'
import './AssignmentCard.css'
import { 
  IoEyeOutline, 
  IoDownloadOutline, 
  IoListOutline 
} from 'react-icons/io5'

const AssignmentCard = ({ 
  assignment, 
  index = 0,
  onViewDetails,
  onDownloadPDF,
  onViewClassResults,
  onSetLearning 
}) => {
  const {
    title,
    category,
    dueDate,
    status,
    studentsCompleted,
    averageScore,
    studentSubmissions,
    backgroundColor = 'default',
    isCompleted = false
  } = assignment

  // Get background color class based on assignment data or use default
  const getBackgroundColorClass = () => {
    if (backgroundColor && backgroundColor !== 'default') {
      return backgroundColor
    }
    
    // Default color scheme based on index if no specific color provided
    const colors = ['purple', 'dark-blue', 'light-pink', 'bright-pink', 'cyan', 'green']
    return colors[index % colors.length]
  }

  // Get status class and text
  const getStatusInfo = () => {
    if (isCompleted) {
      return { class: 'completed', text: 'Completed' }
    }
    return { class: 'in-progress', text: 'In Progress' }
  }

  // Get header background color class based on index
  const getHeaderBackgroundClass = (index) => {
    const colors = ['bg-purple', 'bg-blue', 'bg-pink', 'bg-red', 'bg-cyan', 'bg-green']
    return colors[index % colors.length]
  }

  const statusInfo = getStatusInfo()
  const bgColorClass = getBackgroundColorClass()

  return (
    <motion.div
      className="teacher-assignments__card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
             {/* Card Header with Title and Meta */}
       <div className={`teacher-assignments__card-header ${getHeaderBackgroundClass(index)}`}>
         {/* Set Learning Button - Top Left */}
         <button 
           className="teacher-assignments__set-learning-btn"
           onClick={() => onSetLearning?.(assignment)}
         >
           {category}
         </button>
         
         <div className="teacher-assignments__card-title-section">
           <h2 className="teacher-assignments__card-title">
             {title}
           </h2>
           <p className="teacher-assignments__card-meta">
             {category} • Due {dueDate}
           </p>
         </div>
       </div>

      {/* Assignment Content Card */}
      <div className="teacher-assignments__assignment-card">
        {/* Status and Metrics Section */}
        <div className="teacher-assignments__metrics-section">
          <div className="teacher-assignments__metric-row">
            <span className="teacher-assignments__metric-label">
              Status:
            </span>
            <div
              className={`teacher-assignments__status-badge ${
                statusInfo.class
              }`}
            >
              {statusInfo.text}
            </div>
          </div>
          
          {!isCompleted && (
            <>
              <div className="teacher-assignments__metric-row">
                <span className="teacher-assignments__metric-label">
                  Students Completed:
                </span>
                <span className="teacher-assignments__metric-value">
                  {studentsCompleted}%
                </span>
              </div>
              <div className="teacher-assignments__metric-row">
                <span className="teacher-assignments__metric-label">
                  Average Score:
                </span>
                <span className="teacher-assignments__metric-value">
                  {averageScore}%
                </span>
              </div>
              <div className="teacher-assignments__metric-row">
                <span className="teacher-assignments__metric-label">
                  Student Submissions:
                </span>
                <span className="teacher-assignments__metric-value">
                  {studentSubmissions}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons Section - Now Outside the Assignment Card */}
      <div className="teacher-assignments__action-buttons">
        {isCompleted ? (
          // Completed assignment - show View Class Results button
          <button
            className="teacher-assignments__view-results-button"
            onClick={() => onViewClassResults?.(assignment)}
          >
            <IoListOutline className="teacher-assignments__button-icon" />
            View Class Results
          </button>
        ) : (
          // In Progress assignment - show Download PDF and View Details buttons
          <>
            <button
              className="teacher-assignments__edit-button"
              onClick={() => onDownloadPDF?.(assignment)}
            >
              <IoDownloadOutline className="teacher-assignments__button-icon" />
              Download PDF
            </button>
            <button
              className="teacher-assignments__view-results-button"
              onClick={() => onViewDetails?.(assignment)}
            >
              <IoEyeOutline className="teacher-assignments__button-icon" />
              View Details
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default AssignmentCard
