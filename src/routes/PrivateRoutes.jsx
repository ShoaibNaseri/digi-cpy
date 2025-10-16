import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const PrivateRoutes = () => {
  const { currentUser, isLoading } = useAuth()

  if (isLoading) {
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

  return <Outlet />
}

export default PrivateRoutes
