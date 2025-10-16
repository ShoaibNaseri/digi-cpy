import { FaFilePdf, FaDownload } from 'react-icons/fa6'
import './StudyGuideCard.css'

const StudyGuideCard = ({ title }) => {
  return (
    <div className='guide-card'>
      <div className='guide-card__content'>
        <div className='guide-card__icon'>
          <FaFilePdf size={32} />
        </div>
        <h3 className='guide-card__title'>{title}</h3>
      </div>
      <button className='guide-card__download'>
        <FaDownload size={24} />
      </button>
    </div>
  )
}

export default StudyGuideCard
