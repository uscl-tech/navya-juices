import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PushNotificationForm } from "@/components/admin/push-notification-form"
import { SmsMarketingForm } from "@/components/admin/sms-marketing-form"
import { EmailCampaignForm } from "@/components/admin/email-campaign-form"

export default function MarketingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Marketing</h1>

      <Tabs defaultValue="push">
        <TabsList className="mb-6">
          <TabsTrigger value="push">Push Notifications</TabsTrigger>
          <TabsTrigger value="sms">SMS Marketing</TabsTrigger>
          <TabsTrigger value="email">Email Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Send push notifications to users who have opted in to receive updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Marketing</CardTitle>
              <CardDescription>Send SMS messages to users who have provided their phone numbers.</CardDescription>
            </CardHeader>
            <CardContent>
              <SmsMarketingForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>Create and send email campaigns to your customers.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailCampaignForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
