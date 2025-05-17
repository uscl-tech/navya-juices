"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

export function SmsMarketingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    message: "",
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
        title: "SMS sent",
        description: "Your SMS campaign has been sent successfully",
      })

      // Reset form
      setFormData({
        message: "",
        sendToAll: true,
        scheduleForLater: false,
        scheduledTime: "",
      })
    } catch (error) {
      console.error("Error sending SMS:", error)
      toast({
        title: "Error",
        description: "Failed to send SMS campaign",
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
          <Label htmlFor="message">SMS Message</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            required
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.message.length}/160 characters</p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="sendToAll" checked={formData.sendToAll} onCheckedChange={handleSwitchChange("sendToAll")} />
          <Label htmlFor="sendToAll">Send to all users with phone numbers</Label>
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
        {isLoading ? "Sending..." : formData.scheduleForLater ? "Schedule SMS" : "Send SMS"}
      </Button>
    </form>
  )
}
