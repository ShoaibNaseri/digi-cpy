import React from 'react'
import './tobe.css'
import { useNavigate } from 'react-router-dom'
const TobeComponent = ({ interfaceBG }) => {
  //use navigate from react-router-dom
  const navigate = useNavigate()
  const redirectTo = () => {
    const contextData = localStorage.getItem('currentMissionContext')
    if (contextData) {
      const missionContext = JSON.parse(contextData)
      if (missionContext.userType === 'child') {
        navigate('/dashboard/child/quizzes')
      } else {
        navigate('/dashboard/student/quizzes')
      }
    } else {
      navigate('/dashboard/student/quizzes')
    }
  }
  return (
    <div
      className='content-container'
      style={{
        backgroundImage: interfaceBG ? `url(${interfaceBG})` : 'none'
      }}
    >
      <div className='final-content-block'>
        <h1>To be continued...</h1>
        <button onClick={redirectTo} className='tobe-button'>
          CONTINUE
        </button>
      </div>
    </div>
  )
}

export default TobeComponent
