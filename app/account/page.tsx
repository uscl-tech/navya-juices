"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { User, CreditCard, ShoppingBag, Heart, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { getOrders } from "@/app/actions/order-actions"
import { OrderHistory } from "@/components/order-history"

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signOut, isLoading } = useAuth()
  const { toast } = useToast()
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  // Get the tab from URL or default to profile
  const tab = searchParams.get("tab") || "profile"

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/sign-in")
    }
  }, [user, isLoading, router])

  // Fetch orders when user is available
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setIsLoadingOrders(true)
        const result = await getOrders(user.id)
        if (result.success) {
          setOrders(result.orders)
        } else {
          toast({
            title: "Error fetching orders",
            description: result.error,
            variant: "destructive",
          })
        }
        setIsLoadingOrders(false)
      }
    }

    fetchOrders()
  }, [user, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Here you would typically save the profile data to Supabase
      // For now, we'll just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
  }

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{user?.email}</CardTitle>
                    <CardDescription>Account Settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <Button
                    variant={tab === "profile" ? "default" : "ghost"}
                    className="justify-start rounded-none h-12"
                    onClick={() => router.push("/account?tab=profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant={tab === "orders" ? "default" : "ghost"}
                    className="justify-start rounded-none h-12"
                    onClick={() => router.push("/account?tab=orders")}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                  <Button
                    variant={tab === "payment" ? "default" : "ghost"}
                    className="justify-start rounded-none h-12"
                    onClick={() => router.push("/account?tab=payment")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </Button>
                  <Button
                    variant={tab === "wishlist" ? "default" : "ghost"}
                    className="justify-start rounded-none h-12"
                    onClick={() => router.push("/account?tab=wishlist")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Button>
                  <Button
                    variant={tab === "settings" ? "default" : "ghost"}
                    className="justify-start rounded-none h-12"
                    onClick={() => router.push("/account?tab=settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
              <CardFooter className="border-t">
                <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue={tab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" onClick={() => router.push("/account?tab=profile")}>
                  Profile
                </TabsTrigger>
                <TabsTrigger value="orders" onClick={() => router.push("/account?tab=orders")}>
                  Orders
                </TabsTrigger>
                <TabsTrigger value="settings" onClick={() => router.push("/account?tab=settings")}>
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSaveProfile}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" name="fullName" value={profileData.fullName} onChange={handleChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user?.email || ""} disabled />
                        <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" value={profileData.phone} onChange={handleChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" value={profileData.address} onChange={handleChange} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" name="city" value={profileData.city} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={profileData.postalCode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" name="country" value={profileData.country} onChange={handleChange} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="mt-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>View your past orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : orders.length > 0 ? (
                      <OrderHistory orders={orders} />
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-4">When you place an order, it will appear here.</p>
                        <Button asChild>
                          <a href="/products">Start Shopping</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="changePassword">Password</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">••••••••</span>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email Notifications</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Receive promotional emails</span>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Delete Account</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
