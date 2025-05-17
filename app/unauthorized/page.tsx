import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-12 text-center">
      <ShieldAlert className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        You don't have permission to access the admin area. Please contact the system administrator if you believe this
        is an error.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/">Return to Home</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Sign In with Different Account</Link>
        </Button>
      </div>
    </div>
  )
}
