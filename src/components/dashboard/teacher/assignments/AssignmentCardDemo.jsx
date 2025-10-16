import React from 'react'
import AssignmentCard from './AssignmentCard'
import './AssignmentCardDemo.css'

const AssignmentCardDemo = () => {
  // Sample assignment data matching the image
  const assignments = [
    {
      title: 'Cyberbullying',
      category: 'SEL Learning',
      dueDate: 'March 15 2025',
      status: 'In Progress',
      studentsCompleted: 80,
      averageScore: 50,
      studentSubmissions: '45/70',
      backgroundColor: 'purple'
    },
    {
      title: 'My Digital Footprint',
      category: 'SEL Learning',
      dueDate: 'April 15 2025',
      status: 'In Progress',
      studentsCompleted: 60,
      averageScore: 70,
      studentSubmissions: '45/70',
      backgroundColor: 'dark-blue'
    },
    {
      title: 'Password Hero',
      category: 'Curriculum Learning',
      dueDate: 'March 15 2025',
      status: 'In Progress',
      studentsCompleted: 50,
      averageScore: 50,
      studentSubmissions: '45/70',
      backgroundColor: 'light-pink'
    },
    {
      title: 'My Social Media Safety Plan',
      category: 'Curriculum Learning',
      dueDate: 'April 15 2025',
      status: 'In Progress',
      studentsCompleted: 50,
      averageScore: 50,
      studentSubmissions: '45/70',
      backgroundColor: 'bright-pink'
    },
    {
      title: 'Programming Project',
      category: 'SEL Learning',
      dueDate: 'March 15 2025',
      status: 'In Progress',
      studentsCompleted: 80,
      averageScore: 50,
      studentSubmissions: '45/70',
      backgroundColor: 'cyan'
    },
    {
      title: 'Portrait Drawing',
      category: 'SEL Learning',
      dueDate: 'April 15 2025',
      status: 'Completed',
      isCompleted: true,
      backgroundColor: 'green'
    }
  ]

  // Event handlers
  const handleViewDetails = (assignment) => {
    console.log('View details for:', assignment.title)
    // Add your logic here
  }

  const handleDownloadPDF = (assignment) => {
    console.log('Download PDF for:', assignment.title)
    // Add your logic here
  }

  const handleViewClassResults = (assignment) => {
    console.log('View class results for:', assignment.title)
    // Add your logic here
  }

  return (
    <div className="assignment-demo-container">
      <div className="demo-header">
        <h1>Assignment Cards Demo</h1>
        <p>Reusable AssignmentCard component with different states and colors</p>
      </div>
      
      <div className="assignment-grid">
        {assignments.map((assignment, index) => (
          <AssignmentCard
            key={index}
            assignment={assignment}
            index={index}
            onViewDetails={handleViewDetails}
            onDownloadPDF={handleDownloadPDF}
            onViewClassResults={handleViewClassResults}
          />
        ))}
      </div>
    </div>
  )
}

export default AssignmentCardDemo
