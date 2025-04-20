"use client"

import { useState } from "react"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Info, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getProductBySlug, getRelatedProducts } from "@/data/products"
import { useCart } from "@/context/cart-context"

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const product = getProductBySlug(params.slug)
  const relatedProducts = product ? getRelatedProducts(product.id) : []
  const { addItem } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) {
    notFound()
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="container py-8 md:py-12">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
            <Image
              src={product.gallery?.[selectedImage] || product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.new && <Badge className="absolute top-4 left-4 bg-primary">New</Badge>}
            {product.bestSeller && <Badge className="absolute top-4 right-4 bg-amber-500">Best Seller</Badge>}
          </div>

          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-2 overflow-auto pb-2">
              {product.gallery.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">42 reviews</span>
            </div>
            <p className="text-2xl font-bold text-primary mb-4">{product.price}</p>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-medium mb-2">Benefits:</h3>
              <ul className="space-y-1">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {product.ingredients && (
              <div>
                <h3 className="font-medium mb-2">Ingredients:</h3>
                <p className="text-muted-foreground">{product.ingredients.join(", ")}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              Subscribe & Save 15%
            </Button>
          </div>

          <Tabs defaultValue="nutrition" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="nutrition" className="pt-4">
              {product.nutritionFacts ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Serving Size</p>
                      <p className="font-medium">{product.nutritionFacts.servingSize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="font-medium">{product.nutritionFacts.calories}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="font-medium">{product.nutritionFacts.protein}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Carbohydrates</p>
                      <p className="font-medium">{product.nutritionFacts.carbs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fat</p>
                      <p className="font-medium">{product.nutritionFacts.fat}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Vitamins & Minerals</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {product.nutritionFacts.vitamins.map((vitamin, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{vitamin.name}</span>
                          <span className="font-medium">{vitamin.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Percent Daily Values are based on a 2,000 calorie diet.</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No nutrition information available for this product.</p>
              )}
            </TabsContent>
            <TabsContent value="shipping" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Shipping</h4>
                  <p className="text-muted-foreground">
                    We ship all products in insulated packaging to ensure freshness. Orders are processed within 24
                    hours and typically arrive within 2-3 business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Returns</h4>
                  <p className="text-muted-foreground">
                    Due to the perishable nature of our products, we cannot accept returns. If you receive damaged
                    products, please contact us within 24 hours of delivery.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Subscription Details</h4>
                  <p className="text-muted-foreground">
                    Subscriptions can be modified or canceled at any time through your account. You'll save 15% on every
                    order with a subscription.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <motion.div key={relatedProduct.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Link href={`/products/${relatedProduct.slug}`}>
                  <Card className="overflow-hidden h-full glass-card">
                    <div className="aspect-square relative">
                      <Image
                        src={relatedProduct.image || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                      {relatedProduct.new && <Badge className="absolute top-2 left-2 bg-primary">New</Badge>}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{relatedProduct.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary">{relatedProduct.price}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                className="rounded-full"
                                onClick={(e) => {
                                  e.preventDefault()
                                  addItem({
                                    id: relatedProduct.id,
                                    name: relatedProduct.name,
                                    price: relatedProduct.price,
                                    image: relatedProduct.image,
                                  })
                                }}
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add to Cart</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
