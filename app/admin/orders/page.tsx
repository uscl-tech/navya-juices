import { createServerSupabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const supabase = createServerSupabase()
  const status = searchParams.status || "all"
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 10

  // Build query
  let query = supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      status,
      total,
      user_id
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })

  // Apply status filter
  if (status !== "all") {
    query = query.eq("status", status)
  }

  // Get total count for pagination
  const { count } = await query.select("id", { count: "exact", head: true })

  // Apply pagination
  const { data: orders } = await query.range((page - 1) * pageSize, page * pageSize - 1)

  // Get user emails for orders
  const userIds = orders?.map((order) => order.user_id) || []
  const { data: users } = await supabase.from("profiles").select("id, full_name").in("id", userIds)

  // Create a map of user IDs to names
  const userMap = new Map()
  users?.forEach((user) => {
    userMap.set(user.id, user.full_name || "Unknown User")
  })

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/orders?status=all"
            className={`px-3 py-2 rounded-md ${status === "all" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            All
          </Link>
          <Link
            href="/admin/orders?status=pending"
            className={`px-3 py-2 rounded-md ${status === "pending" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            Pending
          </Link>
          <Link
            href="/admin/orders?status=processing"
            className={`px-3 py-2 rounded-md ${status === "processing" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            Processing
          </Link>
          <Link
            href="/admin/orders?status=shipped"
            className={`px-3 py-2 rounded-md ${status === "shipped" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            Shipped
          </Link>
          <Link
            href="/admin/orders?status=delivered"
            className={`px-3 py-2 rounded-md ${status === "delivered" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            Delivered
          </Link>
          <Link
            href="/admin/orders?status=cancelled"
            className={`px-3 py-2 rounded-md ${status === "cancelled" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            Cancelled
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders?.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id.substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userMap.get(order.user_id) || "Unknown User"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(order.total).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/orders/${order.id}`} className="text-green-600 hover:text-green-900 mr-4">
                    View
                  </Link>
                  <Link href={`/admin/orders/${order.id}/edit`} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, count || 0)} of {count} results
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/orders?status=${status}&page=${page - 1}`} passHref>
              <Button variant="outline" disabled={page <= 1}>
                Previous
              </Button>
            </Link>
            <Link href={`/admin/orders?status=${status}&page=${page + 1}`} passHref>
              <Button variant="outline" disabled={page >= totalPages}>
                Next
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
