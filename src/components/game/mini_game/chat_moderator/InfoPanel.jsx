import React from 'react'
import { FaUsers, FaCalendar, FaMicrophoneLines } from 'react-icons/fa6'

const InfoPanel = ({ selectedQuestion }) => {
  return (
    <aside className='info-panel'>
      <h4 className='text-green'>GAME INSTRUCTIONS</h4>
      <p className='text-gray'>Game Instructions.</p>
      <ul>
        <li className='info-panel-item'>
          <div className='info-panel-icon text-green'>
            <FaUsers size={15} />
          </div>
          <div className='info-panel-text text-gray'>256 Members</div>
        </li>
        <li className='info-panel-item'>
          <div className='info-panel-icon text-green'>
            <FaMicrophoneLines size={15} />
          </div>
          <div className='info-panel-text text-gray'>3 Online</div>
        </li>
        <li className='info-panel-item'>
          <div className='info-panel-icon text-green'>
            <FaCalendar size={15} />
          </div>
          <div className='info-panel-text text-gray'> Created Jan 15, 2025</div>
        </li>
      </ul>
    </aside>
  )
}

export default InfoPanel
