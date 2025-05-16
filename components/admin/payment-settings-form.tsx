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

const formSchema = z.object({
  enableCashOnDelivery: z.boolean().default(true),
  enableOnlinePayments: z.boolean().default(false),
  razorpayKeyId: z.string().optional(),
  razorpayKeySecret: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
})

export function PaymentSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableCashOnDelivery: true,
      enableOnlinePayments: false,
      razorpayKeyId: "",
      razorpayKeySecret: "",
      stripePublishableKey: "",
      stripeSecretKey: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Here you would save the settings to your database
      console.log(values)
      toast({
        title: "Settings saved",
        description: "Your payment settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payment settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>Configure your store's payment methods and gateways</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="enableCashOnDelivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Cash on Delivery</FormLabel>
                    <FormDescription>Allow customers to pay when their order is delivered</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableOnlinePayments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Online Payments</FormLabel>
                    <FormDescription>Enable online payment gateways like Razorpay and Stripe</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("enableOnlinePayments") && (
              <>
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Razorpay Settings</h3>

                  <FormField
                    control={form.control}
                    name="razorpayKeyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key ID</FormLabel>
                        <FormControl>
                          <Input placeholder="rzp_test_..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="razorpayKeySecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Secret</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Stripe Settings</h3>

                  <FormField
                    control={form.control}
                    name="stripePublishableKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publishable Key</FormLabel>
                        <FormControl>
                          <Input placeholder="pk_test_..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stripeSecretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
