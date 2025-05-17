import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="container py-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>
        <LoginForm />
      </div>
    </div>
  )
}
