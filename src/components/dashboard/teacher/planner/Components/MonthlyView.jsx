import React from 'react'

const MonthlyView = ({ calendarData, weekdays, renderMissionTags }) => (
  <div className='teacher-planner__monthly-view'>
    {/* Weekday Headers */}
    <div className='teacher-planner__monthly-header'>
      {weekdays.map((day) => (
        <div key={day} className='teacher-planner__weekday-header'>
          {day}
        </div>
      ))}
    </div>
    {/* Calendar Days */}
    <div className='teacher-planner__monthly-body'>
      {calendarData.map((day, index) => (
        <div
          key={index}
          className={`teacher-planner__monthly-day ${
            !day.day
              ? 'teacher-planner__monthly-day--empty'
              : day.missions && day.missions.length > 0
              ? 'teacher-planner__monthly-day--has-content'
              : 'teacher-planner__monthly-day--empty'
          }`}
        >
          {/* Day number in top left corner */}
          {day.missions && day.missions.length > 0 ? (
            <div className=''></div>
          ) : (
            <div className='teacher-planner__day-number'>{day.day}</div>
          )}
          {day.day && renderMissionTags(day.missions, day.day)}
        </div>
      ))}
    </div>
  </div>
)

export default MonthlyView
