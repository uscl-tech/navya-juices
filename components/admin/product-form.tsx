"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

type ProductFormProps = {
  product?: {
    id: number
    name: string
    description: string
    price: number
    image_url: string
    category: string
    stock: number
    is_featured: boolean
  }
}

export function ProductForm({ product }: ProductFormProps) {
  const isEditing = !!product
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    image_url: product?.image_url || "",
    category: product?.category || "",
    stock: product?.stock || 100,
    is_featured: product?.is_featured || false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_featured: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = getSupabase()

      if (isEditing) {
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: formData.image_url,
            category: formData.category,
            stock: formData.stock,
            is_featured: formData.is_featured,
          })
          .eq("id", product.id)

        if (error) throw error

        toast({
          title: "Product updated",
          description: "The product has been updated successfully",
        })
      } else {
        const { error } = await supabase.from("products").insert({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          image_url: formData.image_url,
          category: formData.category,
          stock: formData.stock,
          is_featured: formData.is_featured,
        })

        if (error) throw error

        toast({
          title: "Product created",
          description: "The product has been created successfully",
        })
      }

      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="is_featured">Featured Product</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
