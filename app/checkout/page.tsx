"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Truck, ShieldCheck, MapPin, CreditCardIcon, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { AddressList } from "@/components/address/address-list"
import { AddressForm, type AddressFormValues } from "@/components/address/address-form"
import { getSupabase } from "@/lib/supabase"

type Address = AddressFormValues & {
  id: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user, isLoading: authLoading } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [addressMode, setAddressMode] = useState<"select" | "new">("select")
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const supabase = getSupabase()

  // Calculate shipping and total
  const shipping = 4.99
  const total = (Number.parseFloat(subtotal) + shipping).toFixed(2)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout")
    }
  }, [user, authLoading, router])

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckoutError(null)

    if (!user) {
      setCheckoutError("You must be logged in to place an order")
      return
    }

    if (!selectedAddress && addressMode === "select") {
      setCheckoutError("Please select a shipping address")
      return
    }

    setIsProcessing(true)

    try {
      // Create the order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          payment_method: paymentMethod,
          subtotal: Number.parseFloat(subtotal),
          shipping_fee: shipping,
          total: Number.parseFloat(total),
          shipping_address: selectedAddress,
        })
        .select()

      if (orderError) {
        throw orderError
      }

      const orderId = orderData[0].id

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        product_price: Number.parseFloat(item.price.replace("$", "")),
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        throw itemsError
      }

      // Clear the cart
      clearCart()

      // Redirect to success page
      router.push(`/checkout/success?order_id=${orderId}`)
    } catch (error: any) {
      console.error("Checkout error:", error)
      setCheckoutError(error.message || "An error occurred during checkout. Please try again.")
      setIsProcessing(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-8 text-muted-foreground">Add some products to your cart before checking out.</p>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              {checkoutError && <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">{checkoutError}</div>}

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Select or add a shipping address</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="select" onValueChange={(value) => setAddressMode(value as "select" | "new")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="select">Select Address</TabsTrigger>
                      <TabsTrigger value="new">Add New Address</TabsTrigger>
                    </TabsList>
                    <TabsContent value="select" className="pt-4">
                      <AddressList onSelect={handleAddressSelect} selectable />
                    </TabsContent>
                    <TabsContent value="new" className="pt-4">
                      <AddressForm
                        onSuccess={(newAddress) => {
                          setAddressMode("select")
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                        <Banknote className="h-5 w-5" />
                        Cash on Delivery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="card" id="card" disabled />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer opacity-50">
                        <CreditCardIcon className="h-5 w-5" />
                        Credit / Debit Card (Coming Soon)
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "cod" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-amber-50 rounded-md"
                    >
                      <p className="text-amber-800 text-sm">
                        <strong>Cash on Delivery:</strong> Pay with cash when your order is delivered. Our delivery
                        person will collect the payment at the time of delivery.
                      </p>
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Place Order - $${total}`}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      ${(Number.parseFloat(item.price.replace("$", "")) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>${subtotal}</p>
                </div>

                <div className="flex justify-between">
                  <p>Shipping</p>
                  <p>${shipping.toFixed(2)}</p>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>${total}</p>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Secure checkout process</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Fast shipping (2-3 business days)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
