import { useState } from 'react'
import './StudyGuidesPage.css'
import { icons } from '@/config/teacherDash/images.js'
import { IoNotifications } from 'react-icons/io5'
import { BsStarFill } from 'react-icons/bs'
import PDFModal from '@/components/common/PDFModal/PDFModal'
import FeedbackModal from '@/components/common/FeedbackModal/FeedbackModal'
import { getAllMissions } from '@/utils/jsnMissions'
import PageHeader from '../dashboard-header/common/PageHeader'
import useStudentMenuItems from '@/hooks/useStudentMenuItems'
import useEducatorMenuItems from '@/hooks/useEducatorMenuItems'
import useParentMenuItems from '@/hooks/useParentMenuItems'
import { useLocation } from 'react-router-dom'

// Icons for header
const IoPerson = icons.profileIcon

// Icons for action buttons
const IoDocument = icons.IoBookOutlineIcon
const IoChatbubbles = icons.IoIosChatbubblesIcon
const IoPencil = icons.IoMdCopyIcon

// Reusable ResourceCard Component
const ResourceCard = ({ resource, onDownload, onFeedback, isParent }) => {
  return (
    <div className='tr-card'>
      <div className={`tr-card-header ${resource.headerClass}`}>
        <h2 className='tr-card-title'>{resource.title}</h2>
        {/* <p className='tr-card-details'>{resource.details}</p> */}
      </div>

      <div className='tr-card-content'>
        <p className='tr-card-description'>{resource.discription}</p>

        <div className='tr-action-buttons'>
          <button
            className='tr-action-btn lesson-plan'
            onClick={() => onDownload(resource)}
          >
            <span className='tr-action-btn-icon'>
              <IoDocument size={24} />
            </span>
            Lesson Plan
          </button>
          {!isParent && (
            <button className='tr-action-btn class-discussion'>
              <span className='tr-action-btn-icon'>
                <IoChatbubbles size={24} />
              </span>
              Class Discussion
            </button>
          )}
          <button className='tr-action-btn worksheets'>
            <span className='tr-action-btn-icon'>
              <IoPencil size={24} />
            </span>
            Worksheets
          </button>
        </div>
      </div>
      <button className='tr-feedback' onClick={() => onFeedback(resource)}>
        <span className='tr-feedback-icon'>
          <BsStarFill size={24} />
        </span>
        Provide Feedback
      </button>
    </div>
  )
}

const StudyGuidesPage = (isParent = false) => {
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const isParentPath = location.pathname.includes('/dashboard/parent')
  const isEducatorPath = location.pathname.includes('/dashboard/educator')
  const isStudentPath = location.pathname.includes('/dashboard/student')
  const studentMenuItems = useStudentMenuItems()
  const educatorMenuItems = useEducatorMenuItems()
  const parentMenuItems = useParentMenuItems()
  const menuItems = isParentPath
    ? parentMenuItems
    : isEducatorPath
    ? educatorMenuItems
    : isStudentPath
    ? studentMenuItems
    : isParentPath
    ? parentMenuItems
    : []
  // Function to handle opening PDF in modal
  const handleDownload = (resource) => {
    setSelectedResource(resource)
    setIsModalOpen(true)
  }

  // Function to handle opening feedback modal
  const handleFeedback = (resource) => {
    setSelectedResource(resource)
    setIsFeedbackModalOpen(true)
  }

  // Function to close PDF modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedResource(null)
  }

  // Function to close feedback modal
  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false)
    setSelectedResource(null)
  }

  const teacherResources = getAllMissions()

  return (
    <>
      <div className='tr-container'>
        <PageHeader
          title=' Resources'
          subtitle='Lesson plans and teaching resources'
          menuItems={menuItems}
        />

        <div className='tr-grid'>
          {teacherResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDownload={handleDownload}
              onFeedback={handleFeedback}
              isParent={isParentPath}
            />
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PDFModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        pdfUrl={selectedResource ? `/${selectedResource.pdfLocation}` : ''}
        title={
          selectedResource
            ? `${selectedResource.title} - Lesson Plan`
            : 'Lesson Plan'
        }
        downloadFileName={
          selectedResource
            ? `${selectedResource.title
                .replace(/\s+/g, '_')
                .toLowerCase()}_lesson_plan.pdf`
            : 'lesson_plan.pdf'
        }
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleCloseFeedbackModal}
        resourceTitle={selectedResource ? selectedResource.title : ''}
        resourceId={selectedResource ? selectedResource.id : ''}
      />
    </>
  )
}

export default StudyGuidesPage
