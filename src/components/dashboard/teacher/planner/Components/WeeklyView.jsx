import React from 'react'

const WeeklyView = ({ weekData, weekdays, renderMissionTags }) => (
  <div className='teacher-planner__weekly-view'>
    <div className='teacher-planner__weekly-header'>
      {weekdays.map((day) => (
        <div key={day} className='teacher-planner__weekday-header'>
          {day}
        </div>
      ))}
    </div>
    <div className='teacher-planner__weekly-body'>
      {weekData.map((day, index) => (
        <div
          key={index}
          className={`teacher-planner__weekly-day ${
            day.missions && day.missions.length > 0
              ? 'teacher-planner__weekly-day--has-content'
              : 'teacher-planner__weekly-day--empty'
          }`}
        >
          {/* Day number in top left corner */}
          {day.missions && day.missions.length > 0 ? (
            <div className=''></div>
          ) : (
            <div className='teacher-planner__day-number'>{day.day}</div>
          )}
          {renderMissionTags(day.missions, day.day)}
        </div>
      ))}
    </div>
  </div>
)

export default WeeklyView
