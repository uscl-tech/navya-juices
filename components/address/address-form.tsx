"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea" // Added Textarea
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast" // For notifications
import { saveAddressAction, type AddressActionValues } from "@/app/account/addresses/actions"

// Extended schema for admin view
const addressSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address_line1: z.string().min(5, { message: "Address must be at least 5 characters" }),
  address_line2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  postal_code: z.string().min(5, { message: "Postal code is required" }),
  is_default: z.boolean().default(false),
  internal_notes: z.string().optional(), // New field for admin
})

export type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  initialData?: AddressFormValues & { id?: string }
  onSuccess?: () => void
  isAdminView?: boolean // New prop to control admin-specific fields
  userIdForAdmin?: string // If admin is editing for a specific user
}

export function AddressForm({ initialData, onSuccess, isAdminView = false, userIdForAdmin }: AddressFormProps) {
  const { user, userRole } = useAuth() // userRole can also be used if isAdminView is not explicitly passed
  const { toast } = useToast()
  // Initial state for useFormState if you use it
  const initialState = { success: false, message: "", errors: undefined }
  // const [state, formAction] = useFormState(saveAddressAction, initialState) // Option 1: useFormState

  // Option 2: Simpler direct call (less feedback management without useFormState)
  // For this example, let's use a simpler approach and manage loading/error manually for now,
  // or you can fully integrate useFormState.
  // For brevity, we'll stick to a direct call and manage state locally.
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

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
      internal_notes: "",
    },
  })

  const isDefault = watch("is_default")

  const onSubmit = async (values: AddressFormValues) => {
    setIsSubmitting(true)
    setFormError(null)

    const actionValues: AddressActionValues = {
      ...values,
      id: initialData?.id,
      isAdminView: isAdminView, // Pass the prop
      userIdForAdmin: isAdminView && userIdForAdmin ? userIdForAdmin : undefined,
    }

    try {
      const result = await saveAddressAction(actionValues)
      if (result.success) {
        toast({ title: "Success", description: result.message })
        if (onSuccess) {
          onSuccess()
        }
        // Potentially reset form here or navigate
      } else {
        setFormError(result.message || "An unknown error occurred.")
        // Handle field-specific errors if result.errors is populated
        if (result.errors) {
          // You might want to map these errors to react-hook-form's setError
          console.error("Field errors:", result.errors)
        }
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    } catch (e: any) {
      setFormError("An unexpected error occurred during submission.")
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData?.id ? "Edit Address" : "Add New Address"} {isAdminView && "(Admin View)"}
        </CardTitle>
        <CardDescription>
          {initialData?.id ? "Update shipping address details" : "Enter shipping address details"}
          {isAdminView && userIdForAdmin && (
            <span className="block text-xs text-muted-foreground">For user ID: {userIdForAdmin}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="address-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* ... (other form fields remain the same) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} disabled={isSubmitting} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="(555) 123-4567" {...register("phone")} disabled={isSubmitting} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              placeholder="123 Main St"
              {...register("address_line1")}
              disabled={isSubmitting}
            />
            {errors.address_line1 && <p className="text-sm text-red-500">{errors.address_line1.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
            <Input id="address_line2" placeholder="Apt 4B" {...register("address_line2")} disabled={isSubmitting} />
            {errors.address_line2 && <p className="text-sm text-red-500">{errors.address_line2.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" {...register("city")} disabled={isSubmitting} />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="NY" {...register("state")} disabled={isSubmitting} />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input id="postal_code" placeholder="10001" {...register("postal_code")} disabled={isSubmitting} />
              {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code.message}</p>}
            </div>
          </div>

          {/* Conditional Admin Field */}
          {(isAdminView || userRole === "admin") && ( // Show if isAdminView prop is true or if logged in user is admin
            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Notes (Admin Only)</Label>
              <Textarea
                id="internal_notes"
                placeholder="e.g., Special delivery instructions, customer preference"
                {...register("internal_notes")}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.internal_notes && <p className="text-sm text-red-500">{errors.internal_notes.message}</p>}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={isDefault}
              onCheckedChange={(checked) => setValue("is_default", checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="is_default" className="cursor-pointer">
              Set as default address
            </Label>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="address-form" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Address" : "Save Address"}
        </Button>
      </CardFooter>
    </Card>
  )
}
