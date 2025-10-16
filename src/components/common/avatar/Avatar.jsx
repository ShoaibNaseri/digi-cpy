import React from 'react'
import './Avatar.css'

const Avatar = ({ name, size = 40, className = '' }) => {
  const getInitials = (name) => {
    if (!name) return ''
    const firstName = name.split(' ')[0]
    return firstName.charAt(0).toUpperCase()
  }

  const getColor = (name) => {
    if (!name) return '#cccccc'
    const colors = [
      '#4A6FFF',
      '#9C27B0',
      '#E91E63',
      '#F44336',
      '#FF9800',
      '#009688',
      '#3F51B5',
      '#2196F3'
    ]
    const index = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  const initials = getInitials(name)
  const backgroundColor = getColor(name)

  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: size * 0.4,
        aspectRatio: '1/1',
        borderRadius: '50%',
        color: 'white'
      }}
    >
      {initials}
    </div>
  )
}

export default Avatar
