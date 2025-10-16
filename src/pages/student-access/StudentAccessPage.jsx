import StudentAccess from '@/components/student-access/StudentAccess'
import './StudentAccessPage.css'
import AuthPageShell from '@/components/auth/AuthPageShell'

const StudentAccessPage = () => {
  return (
    <AuthPageShell>
      <StudentAccess />
    </AuthPageShell>
  )
}

export default StudentAccessPage
