import './PrimaryContactsForm.css'
import { HiUser } from 'react-icons/hi'
import { HiMail } from 'react-icons/hi'

const PrimaryContactsForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  isEditMode
}) => {
  return (
    <div className='contacts'>
      {!isEditMode && <h1>Primary Contacts</h1>}
      <div className='contacts__form'>
        <div className='contacts__form-group'>
          <label htmlFor='principalName'>Principal Name</label>
          <div className='input-wrapper'>
            <HiUser className='input-icon' size={20} />
            <input
              type='text'
              id='principalName'
              name='principalName'
              value={values.principalName || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='Enter the full name'
              className={
                touched.principalName && errors.principalName ? 'error' : ''
              }
            />
          </div>
          {touched.principalName && errors.principalName && (
            <div className='error-message'>{errors.principalName}</div>
          )}
        </div>
        <div className='contacts__form-group'>
          <label htmlFor='vicePrincipalName'>Vice Principal Name</label>
          <div className='input-wrapper'>
            <HiUser className='input-icon' size={20} />
            <input
              type='text'
              id='vicePrincipalName'
              name='vicePrincipalName'
              value={values.vicePrincipalName || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='Enter the full name'
              className={
                touched.vicePrincipalName && errors.vicePrincipalName
                  ? 'error'
                  : ''
              }
            />
          </div>
          {touched.vicePrincipalName && errors.vicePrincipalName && (
            <div className='error-message'>{errors.vicePrincipalName}</div>
          )}
        </div>
        <div className='contacts__form-group'>
          <label htmlFor='principalEmail'>Principal Email</label>
          <div className='input-wrapper'>
            <HiMail className='input-icon' size={20} />
            <input
              type='email'
              id='principalEmail'
              name='principalEmail'
              value={values.principalEmail || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='Enter an email address'
              className={
                touched.principalEmail && errors.principalEmail ? 'error' : ''
              }
            />
          </div>
          {touched.principalEmail && errors.principalEmail && (
            <div className='error-message'>{errors.principalEmail}</div>
          )}
        </div>
        <div className='contacts__form-group'>
          <label htmlFor='vicePrincipalEmail'>Vice Principal Email</label>
          <div className='input-wrapper'>
            <HiMail className='input-icon' size={20} />
            <input
              type='email'
              id='vicePrincipalEmail'
              name='vicePrincipalEmail'
              value={values.vicePrincipalEmail || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='Enter an email address'
              className={
                touched.vicePrincipalEmail && errors.vicePrincipalEmail
                  ? 'error'
                  : ''
              }
            />
          </div>
          {touched.vicePrincipalEmail && errors.vicePrincipalEmail && (
            <div className='error-message'>{errors.vicePrincipalEmail}</div>
          )}
        </div>
        <div className='contacts__form-group'>
          <label htmlFor='itAdminName'>IT Administration Name</label>
          <div className='input-wrapper'>
            <HiUser className='input-icon' size={20} />
            <input
              type='text'
              id='itAdminName'
              name='itAdminName'
              value={values.itAdminName || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='Enter the full name'
              className={
                touched.itAdminName && errors.itAdminName ? 'error' : ''
              }
            />
          </div>
          {touched.itAdminName && errors.itAdminName && (
            <div className='error-message'>{errors.itAdminName}</div>
          )}
        </div>
        <div className='contacts__form-group'>
          <label htmlFor='educDepartmentName'>
            Education Department Contact Name
          </label>
          <div className='input-wrapper'>
            <HiUser className='input-icon' size={20} />
            <input
              type='text'
              id='educDepartmentName'
              name='educDepartmentName'
              value={values.educDepartmentName || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='Enter the full name'
            />
          </div>
          {touched.educDepartmentName && errors.educDepartmentName && (
            <div className='error-message'>{errors.educDepartmentName}</div>
          )}
        </div>
        <div className='contacts__form-group'>
          <label htmlFor='itAdminEmail'>IT Administration Email</label>
          <div className='input-wrapper'>
            <HiMail className='input-icon' size={20} />
            <input
              type='email'
              id='itAdminEmail'
              name='itAdminEmail'
              value={values.itAdminEmail || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='Enter an email address'
              className={
                touched.itAdminEmail && errors.itAdminEmail ? 'error' : ''
              }
            />
          </div>
          {touched.itAdminEmail && errors.itAdminEmail && (
            <div className='error-message'>{errors.itAdminEmail}</div>
          )}
        </div>
        <div className='contacts__form-group'>
          <label htmlFor='educDepartmentEmail'>
            Education Department Email
          </label>
          <div className='input-wrapper'>
            <HiMail className='input-icon' size={20} />
            <input
              type='email'
              id='educDepartmentEmail'
              name='educDepartmentEmail'
              value={values.educDepartmentEmail || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='Enter an email address'
              className={
                touched.educDepartmentEmail && errors.educDepartmentEmail
                  ? 'error'
                  : ''
              }
            />
          </div>
          {touched.educDepartmentEmail && errors.educDepartmentEmail && (
            <div className='error-message'>{errors.educDepartmentEmail}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrimaryContactsForm
