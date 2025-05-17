"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createServerSupabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function UpdateOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async () => {
    setIsLoading(true)

    try {
      const supabase = createServerSupabase()

      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (error) {
        throw error
      }

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
        disabled={isLoading}
      >
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <Button onClick={updateStatus} disabled={isLoading || status === currentStatus}>
        {isLoading ? "Updating..." : "Update Status"}
      </Button>
    </div>
  )
}
