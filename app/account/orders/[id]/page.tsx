"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Package, ArrowLeft, Clock, CheckCircle, Truck, AlertTriangle } from "lucide-react"
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

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabase()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/account/orders/${orderId}`)
    }
  }, [user, authLoading, router, orderId])

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !orderId) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .single()

        if (orderError) {
          throw orderError
        }

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId)

        if (itemsError) {
          throw itemsError
        }

        setOrderDetails({
          ...orderData,
          items: itemsData,
        })
      } catch (err: any) {
        console.error("Error fetching order details:", err)
        setError(err.message || "Failed to load order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, user])

  if (authLoading || isLoading) {
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

  if (error || !orderDetails) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" className="mr-4" onClick={() => router.push("/account/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold">Order Details</h1>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error || "Order not found"}</p>
              <Button onClick={() => router.push("/account/orders")}>View All Orders</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" className="mr-4" onClick={() => router.push("/account/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        <Card className="mb-8">
          <CardHeader className="bg-muted/50">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle>Order #{orderDetails.id.substring(0, 8)}</CardTitle>
                <CardDescription>Placed on {new Date(orderDetails.created_at).toLocaleDateString()}</CardDescription>
              </div>
              <Badge className={getStatusColor(orderDetails.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(orderDetails.status)}
                  {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <p>{orderDetails.payment_method === "cod" ? "Cash on Delivery" : orderDetails.payment_method}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm">
                  <p className="font-medium">{orderDetails.shipping_address.name}</p>
                  <p>{orderDetails.shipping_address.address_line1}</p>
                  {orderDetails.shipping_address.address_line2 && <p>{orderDetails.shipping_address.address_line2}</p>}
                  <p>
                    {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state}{" "}
                    {orderDetails.shipping_address.postal_code}
                  </p>
                  <p>{orderDetails.shipping_address.phone}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {orderDetails.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.product_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>${orderDetails.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Shipping</p>
                  <p>${orderDetails.shipping_fee.toFixed(2)}</p>
                </div>
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>${orderDetails.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30">
            <div className="w-full">
              {orderDetails.status === "pending" && (
                <div className="text-sm text-amber-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Your order is being processed. You'll receive an update when it ships.</span>
                </div>
              )}
              {orderDetails.status === "shipped" && (
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Your order is on the way! Estimated delivery in 2-3 business days.</span>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
