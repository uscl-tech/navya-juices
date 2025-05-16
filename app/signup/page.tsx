import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="container py-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Create an Account</h1>
        <SignupForm />
      </div>
    </div>
  )
}
