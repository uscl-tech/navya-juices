"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export function PushNotificationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    link: "",
    sendToAll: true,
    scheduleForLater: false,
    scheduledTime: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Notification sent",
        description: "Your push notification has been sent successfully",
      })

      // Reset form
      setFormData({
        title: "",
        message: "",
        link: "",
        sendToAll: true,
        scheduleForLater: false,
        scheduledTime: "",
      })
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send push notification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Notification Title</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={3} required />
        </div>

        <div>
          <Label htmlFor="link">Link (Optional)</Label>
          <Input
            id="link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://example.com/page"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="sendToAll" checked={formData.sendToAll} onCheckedChange={handleSwitchChange("sendToAll")} />
          <Label htmlFor="sendToAll">Send to all users</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="scheduleForLater"
            checked={formData.scheduleForLater}
            onCheckedChange={handleSwitchChange("scheduleForLater")}
          />
          <Label htmlFor="scheduleForLater">Schedule for later</Label>
        </div>

        {formData.scheduleForLater && (
          <div>
            <Label htmlFor="scheduledTime">Schedule Time</Label>
            <Input
              id="scheduledTime"
              name="scheduledTime"
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={handleChange}
              required={formData.scheduleForLater}
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : formData.scheduleForLater ? "Schedule Notification" : "Send Notification"}
      </Button>
    </form>
  )
}
