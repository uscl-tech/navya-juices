"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export function EmailCampaignForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    preheader: "",
    content: "",
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
        title: "Email campaign sent",
        description: "Your email campaign has been sent successfully",
      })

      // Reset form
      setFormData({
        subject: "",
        preheader: "",
        content: "",
        sendToAll: true,
        scheduleForLater: false,
        scheduledTime: "",
      })
    } catch (error) {
      console.error("Error sending email campaign:", error)
      toast({
        title: "Error",
        description: "Failed to send email campaign",
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
          <Label htmlFor="subject">Email Subject</Label>
          <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="preheader">Preheader Text (Optional)</Label>
          <Input
            id="preheader"
            name="preheader"
            value={formData.preheader}
            onChange={handleChange}
            placeholder="Brief summary shown in email clients"
          />
        </div>

        <div>
          <Label htmlFor="content">Email Content</Label>
          <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={10} required />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="sendToAll" checked={formData.sendToAll} onCheckedChange={handleSwitchChange("sendToAll")} />
          <Label htmlFor="sendToAll">Send to all subscribers</Label>
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
        {isLoading ? "Sending..." : formData.scheduleForLater ? "Schedule Campaign" : "Send Campaign"}
      </Button>
    </form>
  )
}
