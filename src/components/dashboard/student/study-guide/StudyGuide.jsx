import './StudyGuide.css'
import StudyGuideCard from './StudyGuideCard'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useStudentMenuItems from '@/hooks/useStudentMenuItems'

const StudyGuide = () => {
  const studentMenuItems = useStudentMenuItems()
  const topics = [
    { id: 1, title: 'Cyberbullying' },
    {
      id: 2,
      title: 'IP Addresses & Digital Footprints'
    },
    {
      id: 3,
      title: 'Online Scams & Password Protection'
    },
    {
      id: 4,
      title: 'Personal Information & Identity Theft'
    },
    {
      id: 5,
      title: 'Artificial Intelligence & Deepfakes'
    },
    { id: 6, title: 'Extortion' },
    {
      id: 7,
      title: 'Cat fishing & Fake Profiles'
    },
    { id: 8, title: 'Grooming' },
    { id: 9, title: 'Online Predators' },
    {
      id: 10,
      title: 'Social Engineering'
    }
  ]

  return (
    <div className='study-guide'>
      <PageHeader
        title='Study Guide'
        subtitle='Download comprehensive study materials to enhance your learning'
        menuItems={studentMenuItems}
      />

      <div className='study-guide__grid'>
        {topics.map((topic) => (
          <div key={topic.id} className='study-guide__grid-item'>
            <StudyGuideCard title={topic.title} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudyGuide
