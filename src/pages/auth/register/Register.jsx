import RegisterForm from '@/components/auth/register/RegisterForm'
import './Register.css'
import AuthPageShell from '@/components/auth/AuthPageShell'

const RegisterPage = () => {
  return (
    <AuthPageShell>
      <RegisterForm />
    </AuthPageShell>
  )
}

export default RegisterPage
