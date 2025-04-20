"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type Order = {
  id: string
  created_at: string
  status: string
  total: number
}

type OrderHistoryProps = {
  orders: Order[]
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-amber-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
            onClick={() => toggleOrderExpansion(order.id)}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
              <span className="text-sm text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">${Number(order.total).toFixed(2)}</span>
              {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {expandedOrder === order.id && (
            <div className="p-4 bg-muted/20 border-t">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Order Details</h4>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${order.id}`}>
                    View Details
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p>{format(new Date(order.created_at), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Status</p>
                  <p>{order.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Total</p>
                  <p>${Number(order.total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
