import { createServerSupabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { UpdateOrderStatus } from "@/components/admin/update-order-status"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createServerSupabase()

  // Fetch order details
  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      user_id
    `)
    .eq("id", id)
    .single()

  if (!order) {
    notFound()
  }

  // Fetch order items
  const { data: orderItems } = await supabase
    .from("order_items")
    .select(`
      *,
      products:product_id (name, image_url)
    `)
    .eq("order_id", id)

  // Fetch user details
  const { data: user } = await supabase.from("profiles").select("*").eq("id", order.user_id).single()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order #{id.substring(0, 8)}</h1>
        <div className="flex gap-2">
          <Link href="/admin/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
          <Link href={`/admin/orders/${id}/edit`}>
            <Button>Edit Order</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Order ID:</dt>
                <dd>{id.substring(0, 8)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Date:</dt>
                <dd>{new Date(order.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Status:</dt>
                <dd>
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
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Payment Method:</dt>
                <dd>{order.payment_method}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <UpdateOrderStatus orderId={id} currentStatus={order.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Name:</dt>
                <dd>{user?.full_name || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Email:</dt>
                <dd>{user?.email || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Phone:</dt>
                <dd>{user?.phone || "N/A"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {order.shipping_address && (
                <>
                  <div className="flex justify-between">
                    <dt className="font-medium">Name:</dt>
                    <dd>{order.shipping_address.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Address:</dt>
                    <dd>{order.shipping_address.address_line1}</dd>
                  </div>
                  {order.shipping_address.address_line2 && (
                    <div className="flex justify-between">
                      <dt className="font-medium"></dt>
                      <dd>{order.shipping_address.address_line2}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="font-medium">City:</dt>
                    <dd>{order.shipping_address.city}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">State:</dt>
                    <dd>{order.shipping_address.state}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Postal Code:</dt>
                    <dd>{order.shipping_address.postal_code}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Phone:</dt>
                    <dd>{order.shipping_address.phone}</dd>
                  </div>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderItems?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={item.products?.image_url || "/placeholder.svg?height=40&width=40&query=product"}
                          alt={item.product_name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${Number(item.product_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(Number(item.product_price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Subtotal:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${Number(order.subtotal).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Shipping:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${Number(order.shipping_fee).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  ${Number(order.total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
