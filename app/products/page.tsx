"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Filter, ChevronDown, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCart } from "@/context/cart-context"
import { getProductsByCategory } from "@/data/products"

const categories = [
  { value: "all", label: "All Products" },
  { value: "shots", label: "Wheatgrass Shots" },
  { value: "bundles", label: "Bundles & Packs" },
  { value: "accessories", label: "Accessories" },
]

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
]

export default function ProductsPage() {
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("featured")
  const { addItem } = useCart()

  // Get products by category
  let filteredProducts = getProductsByCategory(category)

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price-asc") {
      return Number.parseFloat(a.price.replace("$", "")) - Number.parseFloat(b.price.replace("$", ""))
    } else if (sort === "price-desc") {
      return Number.parseFloat(b.price.replace("$", "")) - Number.parseFloat(a.price.replace("$", ""))
    } else if (sort === "newest") {
      return a.new ? -1 : b.new ? 1 : 0
    }
    // Default to featured
    return a.featured ? -1 : b.featured ? 1 : 0
  })

  return (
    <div className="min-h-screen">
      <div className="bg-accent/30 py-12">
        <div className="container px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Our Products</h1>
          <p className="text-muted-foreground mt-2">Explore our range of premium wheatgrass products</p>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={category === cat.value ? "bg-accent" : ""}
                  >
                    {cat.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-auto">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <Link href={`/products/${product.slug}`} className="block">
                <Card className="overflow-hidden h-full glass-card">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                    {product.new && <Badge className="absolute top-2 left-2 bg-primary">New</Badge>}
                    {product.bestSeller && <Badge className="absolute top-2 right-2 bg-amber-500">Best Seller</Badge>}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-primary">{product.price}</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              className="rounded-full"
                              onClick={(e) => {
                                e.preventDefault()
                                addItem({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image,
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
    </div>
  )
}
