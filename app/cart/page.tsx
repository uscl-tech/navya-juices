"use client"

import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { MinusCircle, PlusCircle, Trash2, ShoppingBag, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getSubtotal, getItemCount, isLoading, clearCart } = useCart()

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 animate-pulse text-primary" />
        <p className="mt-4 text-lg font-medium">Loading your cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-semibold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  // Example tax and shipping, replace with actual calculation logic
  const estimatedTax = subtotal * 0.08
  const shippingCost = subtotal > 50 ? 0 : 10
  const total = subtotal + estimatedTax + shippingCost

  return (
    <div className="container mx-auto py-8 md:py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">
        Your Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden glass-card">
              <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="relative w-full md:w-32 h-32 md:h-auto aspect-square rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image_url || "/placeholder.svg?width=128&height=128&query=juice+product"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <Link href={`/products/${item.slug}`} className="hover:text-primary">
                    <h2 className="text-lg md:text-xl font-semibold">{item.name}</h2>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-1">
                    {item.short_description || "Freshly prepared juice."}
                  </p>
                  <p className="text-primary font-bold text-lg">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <MinusCircle className="h-5 w-5" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = Number.parseInt(e.target.value, 10)
                        if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= item.stock) {
                          updateQuantity(item.id, newQuantity)
                        } else if (!isNaN(newQuantity) && newQuantity > item.stock) {
                          updateQuantity(item.id, item.stock) // Set to max stock if over
                        }
                      }}
                      className="w-16 text-center h-10"
                      aria-label="Item quantity"
                      min="1"
                      max={item.stock}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </div>
                  {item.quantity >= item.stock && item.stock > 0 && (
                    <p className="text-xs text-amber-600 mt-1">Max stock reached.</p>
                  )}
                  {item.stock === 0 && <p className="text-xs text-red-600 mt-1">Out of stock.</p>}
                </div>
                <div className="flex flex-col items-start md:items-end justify-between mt-4 md:mt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {cartItems.length > 0 && (
            <div className="text-right mt-6">
              <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 glass-card-opaque">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Order Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle className="text-sm">Shipping & Tax Info</AlertTitle>
                <AlertDescription className="text-xs">
                  Shipping costs and taxes are estimates and will be updated during checkout based on your shipping
                  address. Free shipping on orders over $50.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
