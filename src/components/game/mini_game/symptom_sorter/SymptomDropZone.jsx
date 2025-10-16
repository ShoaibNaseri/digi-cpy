import React from 'react'
import SymptomItem from './SymptomItem'
import './symptomdropzone.css'

const SymptomDropZone = ({
  title,
  symptoms,
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  dropRef
}) => {
  return (
    <div
      className={`symptom-drop-zone ${isDragOver ? 'drag-over' : ''}`}
      ref={dropRef}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <h1 className='symptom-drop-zone-title'>{title}</h1>
      <div className='symptom-items-container'>
        {symptoms.map((symptom) => (
          <SymptomItem
            key={symptom.id}
            symptom={symptom}
            isCorrect={true}
            color='green'
          />
        ))}
      </div>
    </div>
  )
}

export default SymptomDropZone
