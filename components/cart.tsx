"use client"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CartItemProps {
  id: number
  name: string
  price: string
  image: string
  quantity: number
}

const CartItem = ({ id, name, price, image, quantity }: CartItemProps) => {
  const { removeItem, updateQuantity } = useCart()

  const increaseQuantity = () => {
    updateQuantity(id, quantity + 1)
  }

  const decreaseQuantity = () => {
    updateQuantity(id, quantity - 1)
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 20vw, (max-width: 1200px) 20vw, 20vw"
          />
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-gray-500 text-sm">{price}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={decreaseQuantity}>
          <Minus className="h-4 w-4" />
        </Button>
        <span>{quantity}</span>
        <Button variant="outline" size="icon" onClick={increaseQuantity}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => removeItem(id)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export const Cart = () => {
  const { items, isOpen, setIsOpen, totalItems, subtotal } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-0 right-0 w-full h-full bg-background z-50 shadow-lg overflow-y-auto"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="container h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">Your Cart ({totalItems})</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow p-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-full"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Your cart is empty.</p>
                  </motion.div>
                ) : (
                  <ul>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                      >
                        <CartItem {...item} />
                      </motion.li>
                    ))}
                  </ul>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold">Subtotal:</p>
                <p className="text-xl font-bold">${subtotal}</p>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const CartDialog = () => {
  const { items, totalItems, subtotal } = useCart()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Cart ({totalItems})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
          <DialogDescription>Review the items in your shopping cart and proceed to checkout.</DialogDescription>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Your cart is empty.</p>
          </div>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <CartItem {...item} />
              </li>
            ))}
          </ul>
        )}

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">Subtotal:</p>
            <p className="text-xl font-bold">${subtotal}</p>
          </div>
          <Button className="w-full" size="lg" asChild>
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
