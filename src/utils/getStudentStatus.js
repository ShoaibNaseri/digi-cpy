const getStudentStatus = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'incomplete':
      return 'Incomplete'
    case 'in-progress':
      return 'In Progress'
    default:
      return 'N/A'
  }
}

export default getStudentStatus
