"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/types/supabase"
import { ShoppingCartIcon } from "lucide-react"

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  className?: string
  showIcon?: boolean
  buttonText?: string
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  showIcon = true,
  buttonText = "Add to Cart",
}: AddToCartButtonProps) {
  const { addToCart, cartItems } = useCart()

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const itemInCart = cartItems.find((item) => item.id === product.id)

  return (
    <Button
      onClick={handleAddToCart}
      className={className}
      disabled={product.stock <= 0 || (itemInCart && itemInCart.quantity >= product.stock)}
    >
      {showIcon && <ShoppingCartIcon className="mr-2 h-4 w-4" />}
      {itemInCart && itemInCart.quantity >= product.stock ? "Out of Stock" : buttonText}
    </Button>
  )
}
