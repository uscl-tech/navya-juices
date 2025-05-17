"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Package, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const { user } = useAuth()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabase()

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) {
        router.push("/")
        return
      }

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

    // Set order complete flag in session storage
    sessionStorage.setItem("orderComplete", "true")

    return () => {
      // Clean up when navigating away
      sessionStorage.removeItem("orderComplete")
    }
  }, [orderId, user, router])

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Loading order details...</h1>
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">{error || "Could not find order details"}</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <CheckCircle className="h-24 w-24 text-primary mx-auto" />
          <h1 className="text-3xl font-bold mt-6 mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>
        </motion.div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order #{orderId.substring(0, 8)}</CardTitle>
            <CardDescription>Placed on {new Date(orderDetails.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Order Status</h3>
                <div className="flex items-center gap-2 text-amber-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    {orderDetails.status === "pending" ? "Processing" : orderDetails.status}
                  </span>
                </div>
              </div>

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
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground w-full">
              <Package className="h-4 w-4 text-primary" />
              <span>
                You will receive an email with your order details and tracking information once your order ships.
              </span>
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/account/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
