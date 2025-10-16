import React from 'react'

const BiWeeklyView = ({ biWeekData, weekdays, renderMissionTags }) => {
  // Split into two weeks
  const firstWeek = biWeekData.slice(0, 7)
  const secondWeek = biWeekData.slice(7)

  return (
    <div className='teacher-planner__biweekly-view'>
      {/* First Week */}
      <div className='teacher-planner__biweekly-section'>
        <div className='teacher-planner__biweekly-section-header'>Week 1</div>
        <div className='teacher-planner__weekly-header'>
          {weekdays.map((day) => (
            <div
              key={`week1-${day}`}
              className='teacher-planner__weekday-header'
            >
              {day}
            </div>
          ))}
        </div>
        <div className='teacher-planner__weekly-body'>
          {firstWeek.map((day, index) => (
            <div
              key={`week1-day-${index}`}
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
      {/* Second Week */}
      <div className='teacher-planner__biweekly-section'>
        <div className='teacher-planner__biweekly-section-header'>Week 2</div>
        <div className='teacher-planner__weekly-header'>
          {weekdays.map((day) => (
            <div
              key={`week2-${day}`}
              className='teacher-planner__weekday-header'
            >
              {day}
            </div>
          ))}
        </div>
        <div className='teacher-planner__weekly-body'>
          {secondWeek.map((day, index) => (
            <div
              key={`week2-day-${index}`}
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
    </div>
  )
}

export default BiWeeklyView
