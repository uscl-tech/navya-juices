import { createServerSupabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const supabase = createServerSupabase()
  const category = searchParams.category || "all"
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 10

  // Get all categories
  const { data: categoriesData } = await supabase.from("products").select("category").order("category")

  // Extract unique categories
  const categories = Array.from(new Set(categoriesData?.map((item) => item.category) || []))

  // Build query
  let query = supabase.from("products").select("*", { count: "exact" }).order("name")

  // Apply category filter
  if (category !== "all") {
    query = query.eq("category", category)
  }

  // Get total count for pagination
  const { count } = await query.select("id", { count: "exact", head: true })

  // Apply pagination
  const { data: products } = await query.range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Link
          href="/admin/products?category=all"
          className={`px-3 py-2 rounded-md whitespace-nowrap ${category === "all" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          All Categories
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/admin/products?category=${cat}`}
            className={`px-3 py-2 rounded-md whitespace-nowrap ${category === cat ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg?height=200&width=400&query=product"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <span className="text-green-600 font-bold">${Number(product.price).toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{product.category}</span>
                <div className="flex gap-2">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, count || 0)} of {count} results
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/products?category=${category}&page=${page - 1}`} passHref>
              <Button variant="outline" disabled={page <= 1}>
                Previous
              </Button>
            </Link>
            <Link href={`/admin/products?category=${category}&page=${page + 1}`} passHref>
              <Button variant="outline" disabled={page >= totalPages}>
                Next
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
