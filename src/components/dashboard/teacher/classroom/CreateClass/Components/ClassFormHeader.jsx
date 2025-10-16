import React from 'react'
import PropTypes from 'prop-types'

/**
 * Header component for the create class form
 */
const ClassFormHeader = ({ onCancel }) => {
  return (
    <div className='tcr-class-form-header'>
    </div>
  )
}

ClassFormHeader.propTypes = {
  onCancel: PropTypes.func.isRequired
}

export default ClassFormHeader
