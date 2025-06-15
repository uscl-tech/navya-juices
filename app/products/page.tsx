import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/types/supabase" // Assuming Product type is defined here

// This function creates a Supabase client for Server Components
const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

export default async function ProductsPage() {
  const supabase = createSupabaseServerClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        <p className="text-red-500">Could not load products at this time. Please try again later.</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        <p>No products found.</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Juices & Shots</h1>
      <p className="text-center max-w-2xl mx-auto mb-12 text-muted-foreground">
        Explore our range of cold-pressed wheatgrass juices, potent shots, and wellness bundles, all made with the
        freshest organic ingredients.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </div>
    </div>
  )
}
