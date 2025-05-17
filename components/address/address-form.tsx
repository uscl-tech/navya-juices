"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"

const addressSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address_line1: z.string().min(5, { message: "Address must be at least 5 characters" }),
  address_line2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  postal_code: z.string().min(5, { message: "Postal code is required" }),
  is_default: z.boolean().default(false),
})

export type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  initialData?: AddressFormValues & { id?: string }
  onSuccess?: () => void
}

export function AddressForm({ initialData, onSuccess }: AddressFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = getSupabase()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      is_default: false,
    },
  })

  const isDefault = watch("is_default")

  const onSubmit = async (data: AddressFormValues) => {
    if (!user) {
      setError("You must be logged in to save an address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // If this is set as default, update all other addresses to not be default
      if (data.is_default) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
      }

      // Insert or update the address
      const { error: upsertError } = initialData?.id
        ? await supabase
            .from("addresses")
            .update({
              ...data,
              user_id: user.id,
            })
            .eq("id", initialData.id)
        : await supabase.from("addresses").insert({
            ...data,
            user_id: user.id,
          })

      if (upsertError) {
        throw upsertError
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "Failed to save address. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit Address" : "Add New Address"}</CardTitle>
        <CardDescription>
          {initialData?.id ? "Update your shipping address details" : "Enter your shipping address details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="address-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} disabled={isLoading} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="(555) 123-4567" {...register("phone")} disabled={isLoading} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input id="address_line1" placeholder="123 Main St" {...register("address_line1")} disabled={isLoading} />
            {errors.address_line1 && <p className="text-sm text-red-500">{errors.address_line1.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
            <Input id="address_line2" placeholder="Apt 4B" {...register("address_line2")} disabled={isLoading} />
            {errors.address_line2 && <p className="text-sm text-red-500">{errors.address_line2.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" {...register("city")} disabled={isLoading} />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="NY" {...register("state")} disabled={isLoading} />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input id="postal_code" placeholder="10001" {...register("postal_code")} disabled={isLoading} />
              {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code.message}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={isDefault}
              onCheckedChange={(checked) => setValue("is_default", checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="is_default" className="cursor-pointer">
              Set as default address
            </Label>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="address-form" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData?.id ? "Update Address" : "Save Address"}
        </Button>
      </CardFooter>
    </Card>
  )
}
