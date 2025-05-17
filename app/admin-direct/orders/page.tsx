"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      setLoading(true)
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (error) throw error

      // Refresh orders list
      fetchOrders()
      setSuccessMessage(`Order #${orderId} status updated to ${status}`)
    } catch (err) {
      console.error("Error updating order status:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Loading Orders...</h1>
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow rounded-lg mb-6 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-600">Manage Orders</h1>
            <p className="text-gray-500">View and update order status</p>
          </div>
          <Button asChild>
            <Link href="/admin-direct">Back to Dashboard</Link>
          </Button>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{successMessage}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setSuccessMessage("")}>
              Dismiss
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Orders List</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">ID</th>
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Total</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-2">{order.id}</td>
                        <td className="py-2">
                          {order.profiles?.full_name || "Unknown"}
                          <br />
                          <span className="text-xs text-gray-500">{order.profiles?.email || "No email"}</span>
                        </td>
                        <td className="py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-2">${order.total?.toFixed(2) || "0.00"}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status || "pending"}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex space-x-2">
                            <Select
                              defaultValue={order.status || "pending"}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin-direct/orders/${order.id}`}>View</Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No orders found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
