import { icons } from '@/config/teacherDash/images.js'

//icon
const IoBookOutline = icons.IoBookOutlineIcon
const IoVideocamOutline = icons.IoVideocamOutlineIcon
const IoIosChatbubbles = icons.IoIosChatbubblesIcon

const HelpResourceCards = () => {
  return (
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
          Connect with other students
        </p>
      </div>
    </div>
  )
}

export default HelpResourceCards
