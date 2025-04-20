"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orderId, setOrderId] = useState<string | null>(null)

  // Redirect if user navigates directly to this page
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Check if we have order data in session storage
      const hasOrderData = sessionStorage.getItem("orderComplete")
      if (!hasOrderData) {
        router.push("/")
      } else {
        // Get order ID if available
        const storedOrderId = sessionStorage.getItem("orderId")
        if (storedOrderId) {
          setOrderId(storedOrderId)
        }
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [router])

  // Set order complete flag
  useEffect(() => {
    sessionStorage.setItem("orderComplete", "true")

    return () => {
      // Clean up when navigating away
      sessionStorage.removeItem("orderComplete")
      sessionStorage.removeItem("orderId")
    }
  }, [])

  return (
    <div className="container py-20">
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <CheckCircle className="h-24 w-24 text-primary mx-auto" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. We've received your order and will begin processing it right away. You'll
            receive a confirmation email shortly with your order details.
          </p>

          {user && orderId && (
            <Card className="mb-8 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your order has been saved to your account. You can view the details and track your order status in
                  your account dashboard.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/account/orders/${orderId}`}>View Order Details</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" asChild size="lg" className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
