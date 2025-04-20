"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { getOrderDetails } from "@/app/actions/order-actions"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [isLoadingOrder, setIsLoadingOrder] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/auth/sign-in")
      return
    }

    const fetchOrderDetails = async () => {
      if (user) {
        setIsLoadingOrder(true)
        const result = await getOrderDetails(params.id, user.id)

        if (result.success) {
          setOrder(result.order)
          setOrderItems(result.items)
        } else {
          toast({
            title: "Error fetching order",
            description: result.error,
            variant: "destructive",
          })
          router.push("/account?tab=orders")
        }

        setIsLoadingOrder(false)
      }
    }

    if (user) {
      fetchOrderDetails()
    }
  }, [user, isLoading, params.id, router, toast])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-amber-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  if (isLoading || isLoadingOrder) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Order not found</h1>
        <p className="mb-8 text-muted-foreground">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button asChild>
          <Link href="/account?tab=orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" className="p-0" asChild>
            <Link href="/account?tab=orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>

        <div className="grid gap-8">
          {/* Order Summary */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Order Date</h3>
                  <p>{format(new Date(order.created_at), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Total Amount</h3>
                  <p className="font-bold">${Number(order.total).toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Payment Method</h3>
                  <p>Credit Card</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                    <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                      <Image src="/assorted-products-display.png" alt={item.product_name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(item.product_price).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(Number(item.product_price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      $
                      {orderItems.reduce((sum, item) => sum + Number(item.product_price) * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$4.99</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_address ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Shipping Address</h3>
                    <p>{order.shipping_address.fullName}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.postalCode}
                    </p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Information</h3>
                    <p>{order.shipping_address.email}</p>
                    <p>{order.shipping_address.phone || "No phone provided"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No shipping information available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
