"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  enableFreeShipping: z.boolean().default(false),
  freeShippingThreshold: z.string().optional(),
  flatRateShipping: z.string().default("50"),
  availableStates: z.string(),
  processingTime: z.string().default("1-2"),
  shippingNotes: z.string().optional(),
  shippingPolicy: z.string().optional(),
})

export function ShippingSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableFreeShipping: false,
      freeShippingThreshold: "500",
      flatRateShipping: "50",
      availableStates: "Maharashtra, Karnataka, Tamil Nadu, Telangana, Andhra Pradesh",
      processingTime: "1-2",
      shippingNotes: "Orders placed before 2 PM will be processed the same day.",
      shippingPolicy:
        "We ship all orders via reputable courier services. Delivery times may vary based on your location.",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Here you would save the settings to your database
      console.log(values)
      toast({
        title: "Settings saved",
        description: "Your shipping settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save shipping settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Settings</CardTitle>
        <CardDescription>Configure your store's shipping options and policies</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="flatRateShipping"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flat Rate Shipping Fee (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>The standard shipping fee for all orders</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableFreeShipping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Free Shipping</FormLabel>
                    <FormDescription>Offer free shipping on orders above a certain amount</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("enableFreeShipping") && (
              <FormField
                control={form.control}
                name="freeShippingThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Free Shipping Threshold (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Orders above this amount will qualify for free shipping</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="availableStates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Shipping States</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter comma-separated list of states" {...field} />
                  </FormControl>
                  <FormDescription>Enter the states where you offer shipping, separated by commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="processingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processing Time (Business Days)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select processing time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="same-day">Same Day</SelectItem>
                      <SelectItem value="1-2">1-2 Days</SelectItem>
                      <SelectItem value="3-5">3-5 Days</SelectItem>
                      <SelectItem value="5-7">5-7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>How long it typically takes to process an order before shipping</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any additional shipping information" {...field} />
                  </FormControl>
                  <FormDescription>Additional information to display to customers about shipping</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Policy</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your shipping policy" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormDescription>Your store's shipping policy that will be displayed to customers</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
