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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  // Email Notifications
  enableEmailNotifications: z.boolean().default(true),
  adminEmail: z.string().email().optional(),
  orderConfirmationTemplate: z.string().optional(),
  orderShippedTemplate: z.string().optional(),
  orderDeliveredTemplate: z.string().optional(),

  // SMS Notifications
  enableSmsNotifications: z.boolean().default(false),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioPhoneNumber: z.string().optional(),
  smsOrderConfirmationTemplate: z.string().optional(),
  smsOrderShippedTemplate: z.string().optional(),

  // Push Notifications
  enablePushNotifications: z.boolean().default(false),
  firebaseServerKey: z.string().optional(),
  pushNotificationTitle: z.string().optional(),
  pushNotificationBody: z.string().optional(),
})

export function NotificationSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableEmailNotifications: true,
      adminEmail: "admin@navyasjuices.com",
      orderConfirmationTemplate:
        "Thank you for your order! Your order #{{order_id}} has been confirmed and is being processed.",
      orderShippedTemplate: "Good news! Your order #{{order_id}} has been shipped and is on its way to you.",
      orderDeliveredTemplate: "Your order #{{order_id}} has been delivered. We hope you enjoy your fresh juices!",

      enableSmsNotifications: false,
      twilioAccountSid: "",
      twilioAuthToken: "",
      twilioPhoneNumber: "",
      smsOrderConfirmationTemplate:
        "Navya's Juices: Your order #{{order_id}} is confirmed! Thank you for shopping with us.",
      smsOrderShippedTemplate: "Navya's Juices: Your order #{{order_id}} has shipped and will arrive soon!",

      enablePushNotifications: false,
      firebaseServerKey: "",
      pushNotificationTitle: "Navya's Fresh Juices",
      pushNotificationBody: "Your order status has been updated!",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Here you would save the settings to your database
      console.log(values)
      toast({
        title: "Settings saved",
        description: "Your notification settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure how you communicate with your customers</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="push">Push</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="enableEmailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>Send email notifications to customers about their orders</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("enableEmailNotifications") && (
                  <>
                    <FormField
                      control={form.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormDescription>Email address to receive order notifications</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orderConfirmationTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Confirmation Template</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter email template" {...field} />
                          </FormControl>
                          <FormDescription>
                            Use &#123;&#123;order_id&#125;&#125; as a placeholder for the order ID
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orderShippedTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Shipped Template</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter email template" {...field} />
                          </FormControl>
                          <FormDescription>
                            Use &#123;&#123;order_id&#125;&#125; as a placeholder for the order ID
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orderDeliveredTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Delivered Template</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter email template" {...field} />
                          </FormControl>
                          <FormDescription>
                            Use &#123;&#123;order_id&#125;&#125; as a placeholder for the order ID
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="sms" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="enableSmsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <FormDescription>Send SMS notifications to customers about their orders</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("enableSmsNotifications") && (
                  <>
                    <FormField
                      control={form.control}
                      name="twilioAccountSid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twilio Account SID</FormLabel>
                          <FormControl>
                            <Input placeholder="AC..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twilioAuthToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twilio Auth Token</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twilioPhoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twilio Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smsOrderConfirmationTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Confirmation SMS Template</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter SMS template" {...field} />
                          </FormControl>
                          <FormDescription>Keep it under 160 characters for a single SMS</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smsOrderShippedTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Shipped SMS Template</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter SMS template" {...field} />
                          </FormControl>
                          <FormDescription>Keep it under 160 characters for a single SMS</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="push" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="enablePushNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Push Notifications</FormLabel>
                        <FormDescription>Send push notifications to customers' devices</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("enablePushNotifications") && (
                  <>
                    <FormField
                      control={form.control}
                      name="firebaseServerKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Firebase Server Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pushNotificationTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Notification Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter notification title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pushNotificationBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Notification Body</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter notification body" {...field} />
                          </FormControl>
                          <FormDescription>Keep it concise for better user experience</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>

            <Button type="submit" disabled={isLoading} className="mt-8">
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
