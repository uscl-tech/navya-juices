"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/types/supabase"
import { AddToCartButton } from "@/components/add-to-cart-button" // Import AddToCartButton

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col group glass-card">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="aspect-square relative">
            <Image
              src={product.image_url || "/placeholder.svg?width=400&height=400&query=juice+product"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.is_new && <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">New</Badge>}
            {product.is_best_seller && (
              <Badge className="absolute top-2 right-2 bg-amber-500 text-white">Best Seller</Badge>
            )}
          </div>
        </Link>
        <CardContent className="p-4 flex flex-col flex-grow">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.short_description}</p>
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < (product.average_rating || 0) ? "fill-amber-400 text-amber-400" : "fill-gray-300 text-gray-300"}`}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">({product.review_count || 0} reviews)</span>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
              {product.stock <= 0 && <Badge variant="destructive">Out of Stock</Badge>}
            </div>
            <AddToCartButton product={product} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
