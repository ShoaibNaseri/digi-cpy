import './ChildAssignmentItem.css'

const ChildAssignmentItem = ({ assignment }) => {
  return (
    <div className='assignment'>
      <img src={assignment.image} alt={assignment.title} />
      <div className='assignment__item-content'>
        <div className='assignment__item-title-due'>
          <div className='assignment__item-title'>{assignment.title}</div>
          <div className='assignment__item-due'>Due: {assignment.due}</div>
        </div>
        <button className='assignment__item-start'>Start</button>
      </div>
    </div>
  )
}

export default ChildAssignmentItem
