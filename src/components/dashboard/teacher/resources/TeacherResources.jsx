import { useState } from 'react'
import './TeacherResources.css'
import StudyGuidesPage from '../../../common/resources/StudyGuidesPage.jsx'

const TeacherResources = () => {
  // You could add state to manage different sections or tabs here
  const [activePage, setActivePage] = useState('studyGuides')

  // Render the appropriate page based on active section
  const renderPage = () => {
    switch (activePage) {
      case 'studyGuides':
        return <StudyGuidesPage />
      // You can add other page components here
      default:
        return <StudyGuidesPage />
    }
  }

  return <div className='tr-container'>{renderPage()}</div>
}

export default TeacherResources
