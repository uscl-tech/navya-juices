"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-5 w-5 text-amber-500" />
    case "processing":
      return <Package className="h-5 w-5 text-blue-500" />
    case "shipped":
      return <Truck className="h-5 w-5 text-green-500" />
    case "delivered":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "cancelled":
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    default:
      return <Clock className="h-5 w-5 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800"
    case "processing":
      return "bg-blue-100 text-blue-800"
    case "shipped":
      return "bg-green-100 text-green-800"
    case "delivered":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabase()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account/orders")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (ordersError) {
          throw ordersError
        }

        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from("order_items")
              .select("*")
              .eq("order_id", order.id)

            if (itemsError) {
              console.error("Error fetching order items:", itemsError)
              return { ...order, items: [] }
            }

            return { ...order, items: itemsData }
          }),
        )

        setOrders(ordersWithItems)
      } catch (err: any) {
        console.error("Error fetching orders:", err)
        setError(err.message || "Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  if (authLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <Button variant="outline" onClick={() => router.push("/account")}>
            Back to Account
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Loading your orders...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => router.refresh()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                      <CardDescription>Placed on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Items</h3>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item: any) => (
                          <div key={item.id} className="flex justify-between">
                            <div>
                              <p>{item.product_name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">${(item.product_price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-muted-foreground">+{order.items.length - 2} more item(s)</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-medium">
                      <p>Total</p>
                      <p>${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/account/orders/${order.id}`}>
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
