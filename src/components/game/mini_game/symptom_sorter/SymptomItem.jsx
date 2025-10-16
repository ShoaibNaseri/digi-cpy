import React from 'react'
import { FaCheck } from 'react-icons/fa'
import './symptomitem.css'

const SymptomItem = ({
  symptom,
  isCorrect,
  isWrong,
  color,
  draggable,
  onDragStart,
  onTouchStart
}) => {
  return (
    <div
      className={`symptom-item ${isCorrect ? 'correct-item' : ''} ${
        isWrong ? 'shake-animation' : ''
      }`}
      style={{ backgroundColor: isCorrect ? 'green' : color }}
      draggable={draggable}
      onDragStart={onDragStart}
      onTouchStart={onTouchStart}
    >
      <span className='symptom-text'>{symptom.name}</span>
      {isCorrect && (
        <span className='check-icon'>
          <FaCheck />
        </span>
      )}
    </div>
  )
}

export default SymptomItem
