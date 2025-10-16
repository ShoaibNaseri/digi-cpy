import { CgArrowRight } from 'react-icons/cg'
import './ChildMissionCard.css'

const ChildMissionCard = ({
  title,
  icon,
  description,
  tags,
  minutesToComplete
}) => {
  return (
    <div className='mission-card'>
      <div className='mission-card__content'>
        <div className='mission-card__icon'>
          <img src={icon} alt={title} />
        </div>
        <h3 className='mission-card__title'>{title}</h3>
        <p className='mission-card__description'>{description}</p>
        <div className='mission-card__tags'>
          {tags.map((tag, index) => (
            <span key={index} className='mission-card__tag'>
              {tag}
            </span>
          ))}
        </div>
        <div className='mission-card__footer'>
          <span className='mission-card__duration'>
            {minutesToComplete} mins
          </span>
          <CgArrowRight size={16} />
        </div>
      </div>
    </div>
  )
}

export default ChildMissionCard
