const formatTime = (timeString) => {
  if (!timeString) return 'Not specified'

  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)

  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${period}`
}

export default formatTime
