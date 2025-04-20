"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const products = [
  {
    id: 1,
    name: "Pure Wheatgrass Shot",
    price: "$4.99",
    category: "shots",
    image: "/vibrant-wheatgrass-shot.png",
  },
  {
    id: 2,
    name: "Wheatgrass Cleanse Bundle",
    price: "$24.99",
    category: "bundles",
    image: "/vibrant-wheatgrass-display.png",
  },
  {
    id: 3,
    name: "Wheatgrass & Mint Fusion",
    price: "$5.99",
    category: "shots",
    image: "/vibrant-wheatgrass-mint.png",
  },
  {
    id: 4,
    name: "Wheatgrass Daily Pack",
    price: "$19.99",
    category: "bundles",
    image: "/placeholder.svg?height=300&width=300&query=wheatgrass%20juice%20pack",
  },
  {
    id: 5,
    name: "Wheatgrass & Lemon Elixir",
    price: "$5.99",
    category: "shots",
    image: "/placeholder.svg?height=300&width=300&query=wheatgrass%20lemon%20juice",
  },
  {
    id: 6,
    name: "Wheatgrass Grow Kit",
    price: "$29.99",
    category: "accessories",
    image: "/placeholder.svg?height=300&width=300&query=wheatgrass%20grow%20kit",
  },
  {
    id: 7,
    name: "Premium Juicer",
    price: "$89.99",
    category: "accessories",
    image: "/placeholder.svg?height=300&width=300&query=wheatgrass%20juicer",
  },
  {
    id: 8,
    name: "Wheatgrass & Ginger Boost",
    price: "$5.99",
    category: "shots",
    image: "/placeholder.svg?height=300&width=300&query=wheatgrass%20ginger%20juice",
  },
  {
    id: 9,
    name: "Monthly Subscription Box",
    price: "$49.99/mo",
    category: "bundles",
    image: "/placeholder.svg?height=300&width=300&query=wheatgrass%20subscription%20box",
  },
]

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

  const filteredProducts = products.filter((product) => category === "all" || product.category === category)

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
              <Card className="overflow-hidden h-full glass-card">
                <div className="aspect-square relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">{product.price}</p>
                    <Button size="sm" className="rounded-full">
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
