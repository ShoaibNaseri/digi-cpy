import './TeacherHelpContent.css'
import { icons } from '@/config/teacherDash/images.js'
import ResourceCardAccessibility from './ResourceCardAccessibility.jsx'
import HelpFaqList from '../../help/HelpFaqList'

//icon
const IoBookOutline = icons.IoBookOutlineIcon
const IoVideocamOutline = icons.IoVideocamOutlineIcon
const IoIosChatbubbles = icons.IoIosChatbubblesIcon

const TeacherHelpCenter = () => {
  return (
    <div className='teacher-helpcenter-container'>
      <ResourceCardAccessibility />
      {/* Header Section */}
      <div className='teacher-helpcenter-header'>
        <h2 className='teacher-helpcenter-title'>Help Center</h2>
        <p className='teacher-helpcenter-subtitle'>
          Find answers to common questions or contact our support team
        </p>
      </div>

      {/* Resources Section */}
      <div className='teacher-helpcenter-resources'>
        <div className='teacher-helpcenter-resource-card'>
          <div className='teacher-helpcenter-resource-icon'>
            <IoBookOutline className='' size={50} />
          </div>
          <h3 className='teacher-helpcenter-resource-title'>Documentation</h3>
          <p className='teacher-helpcenter-resource-description'>
            Browse our comprehensive guides
          </p>
        </div>

        <div className='teacher-helpcenter-resource-card'>
          <div className='teacher-helpcenter-resource-icon'>
            <IoVideocamOutline className='' size={50} />
          </div>
          <h3 className='teacher-helpcenter-resource-title'>Video Tutorials</h3>
          <p className='teacher-helpcenter-resource-description'>
            Learn through step-by-step videos
          </p>
        </div>
        <div className='teacher-helpcenter-resource-card'>
          <div className='teacher-helpcenter-resource-icon'>
            <IoIosChatbubbles className='' size={50} />
          </div>
          <h3 className='teacher-helpcenter-resource-title'>Community</h3>
          <p className='teacher-helpcenter-resource-description'>
            Connect with other teachers
          </p>
        </div>
      </div>
      {/* FAQ Section */}
      <HelpFaqList />
    </div>
  )
}

export default TeacherHelpCenter
