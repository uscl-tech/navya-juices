"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    slug: "",
    stock: "100",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setSuccessMessage("")

      // Create slug if not provided
      const productToSubmit = { ...newProduct }
      if (!productToSubmit.slug) {
        productToSubmit.slug = productToSubmit.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-")
      }

      // Convert price and stock to numbers
      productToSubmit.price = Number.parseFloat(productToSubmit.price)
      productToSubmit.stock = Number.parseInt(productToSubmit.stock)

      const { data, error } = await supabase.from("products").insert([productToSubmit]).select()

      if (error) throw error

      setSuccessMessage("Product created successfully!")
      setNewProduct({
        name: "",
        description: "",
        price: "",
        image_url: "",
        slug: "",
        stock: "100",
      })

      // Refresh products list
      fetchProducts()
    } catch (err) {
      console.error("Error creating product:", err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      setLoading(true)
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error

      // Refresh products list
      fetchProducts()
      setSuccessMessage("Product deleted successfully!")
    } catch (err) {
      console.error("Error deleting product:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target
    setNewProduct((prev) => ({ ...prev, [name]: value }))
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Loading Products...</h1>
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow rounded-lg mb-6 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-600">Manage Products</h1>
            <p className="text-gray-500">Add, edit, and delete products</p>
          </div>
          <Button asChild>
            <Link href="/admin-direct">Back to Dashboard</Link>
          </Button>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{successMessage}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setSuccessMessage("")}>
              Dismiss
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Products List</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">ID</th>
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Price</th>
                          <th className="text-left py-2">Stock</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="py-2">{product.id}</td>
                            <td className="py-2">{product.name}</td>
                            <td className="py-2">${product.price?.toFixed(2) || "0.00"}</td>
                            <td className="py-2">{product.stock || "N/A"}</td>
                            <td className="py-2">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin-direct/products/${product.id}`}>Edit</Link>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No products found</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} required />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newProduct.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input id="image_url" name="image_url" value={newProduct.image_url} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug (optional)</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={newProduct.slug}
                      onChange={handleInputChange}
                      placeholder="auto-generated-if-empty"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Product"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
