"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export function GeneralSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    storeName: "Navya's Fresh Juices",
    storeEmail: "contact@navyasjuices.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Green Street, Wellness City, CA 94123",
    storeDescription: "Experience the finest organic wheatgrass juice for optimal health and wellness",
    enableMaintenanceMode: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, enableMaintenanceMode: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
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
          <Label htmlFor="storeName">Store Name</Label>
          <Input id="storeName" name="storeName" value={formData.storeName} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="storeEmail">Store Email</Label>
          <Input
            id="storeEmail"
            name="storeEmail"
            type="email"
            value={formData.storeEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="storePhone">Store Phone</Label>
          <Input id="storePhone" name="storePhone" value={formData.storePhone} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="storeAddress">Store Address</Label>
          <Input id="storeAddress" name="storeAddress" value={formData.storeAddress} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="storeDescription">Store Description</Label>
          <Textarea
            id="storeDescription"
            name="storeDescription"
            value={formData.storeDescription}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enableMaintenanceMode"
            checked={formData.enableMaintenanceMode}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="enableMaintenanceMode">Enable Maintenance Mode</Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
