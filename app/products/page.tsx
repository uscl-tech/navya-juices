"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Filter, ChevronDown, ShoppingCart, PlusCircle, Edit } from "lucide-react" // Added PlusCircle, Edit
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context" // Added useAuth
import { getProductsByCategory } from "@/data/products"
// import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton" // Assuming you have this

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
  // const [isLoading, setIsLoading] = useState(true); // Example for skeleton
  const { addItem } = useCart()
  const { userRole } = useAuth() // Get user role

  // Simulate loading for skeleton
  // useEffect(() => {
  //   const timer = setTimeout(() => setIsLoading(false), 1500);
  //   return () => clearTimeout(timer);
  // }, []);

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

  // if (isLoading) {
  //   return (
  //     <div className="container px-4 py-8">
  //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  //         {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen">
      <div className="bg-accent/30 py-12">
        <div className="container px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Our Products</h1>
              <p className="text-muted-foreground mt-2">Explore our range of premium wheatgrass products</p>
            </div>
            {userRole === "admin" && (
              <Button asChild>
                <Link href="/admin/products/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Product
                </Link>
              </Button>
            )}
          </div>
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
              <Card className="overflow-hidden h-full glass-card group">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {product.new && <Badge className="absolute top-2 left-2 bg-primary">New</Badge>}
                    {product.bestSeller && <Badge className="absolute top-2 right-2 bg-amber-500">Best Seller</Badge>}
                    {userRole === "admin" && (
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()} // Prevent link navigation
                      >
                        <Link href={`/admin/products/${product.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/products/${product.slug}`} className="block">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">{product.price}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={(e) => {
                              e.preventDefault() // Prevent link navigation if any
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
