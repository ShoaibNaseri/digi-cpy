import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROLES } from '@/config/roles'

const RoleRoutes = ({ allowedRoles, redirectPath = '/login' }) => {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ height: '100vh' }}
      >
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to='/login' replace />
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(userRole)) {
    let path = redirectPath

    // NOTE: Add default path for each role
    switch (userRole) {
      case ROLES.SCHOOL_ADMIN:
        path = '/dashboard/educator'
        break
      case ROLES.ADMIN:
        path = '/dashboard/admin/analytics/user-analytics'
        break
      case ROLES.TEACHER:
        path = '/dashboard/teacher/classroom'
        break
      case ROLES.STUDENT:
        path = '/dashboard/student/missions'
        break
      case ROLES.CHILD:
        path = '/dashboard/child/missions'
        break
      case ROLES.PARENT:
        path = '/dashboard/parent/profiles'
        break
      default:
        path = redirectPath
    }

    return <Navigate to={path} replace />
  }

  return <Outlet />
}

export default RoleRoutes
