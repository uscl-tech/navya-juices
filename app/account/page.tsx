"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, MapPin, Package, CreditCard, LogOut, Trophy, Edit3 } from "lucide-react" // Added Edit3
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"

export default function AccountPage() {
  const { user, isLoading, signOut, userRole } = useAuth() // Added userRole
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/account")
    }
  }, [user, isLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading || !user) {
    // Combined loading and no-user check
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
          {/* You could add a ProfileSkeleton here */}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          {/* Example: Edit Profile button, could lead to a separate page or modal */}
          <Button variant="outline" onClick={() => alert("Edit Profile clicked!")}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>

        {userRole === "admin" && (
          <Card className="mb-6 border-blue-500 bg-blue-50/50">
            <CardContent className="p-4">
              <p className="text-sm text-blue-700">
                You are viewing this account page as an <strong>Admin</strong>. Additional admin-specific profile
                management options could be displayed here or on a dedicated admin user management page.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account Information
              </CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Role: <span className="font-semibold capitalize">{userRole || "Customer"}</span>
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Juice Challenges
              </CardTitle>
              <CardDescription>Track your wheatgrass challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Join structured wheatgrass challenges to maximize health benefits and track your progress.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/account/challenges">My Challenges</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Addresses
              </CardTitle>
              <CardDescription>Manage your shipping addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove your shipping addresses for faster checkout.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/account/addresses">Manage Addresses</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Orders
              </CardTitle>
              <CardDescription>View and track your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Check the status of your orders, view order history, and track shipments.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/account/orders">View Orders</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Currently, we only support Cash on Delivery. More payment options coming soon!
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
