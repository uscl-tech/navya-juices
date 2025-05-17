import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createServerSupabase } from "@/lib/supabase"

export default async function AnalyticsPage() {
  const supabase = createServerSupabase()

  // Get order statistics using direct SQL queries instead of RPC
  const { data: orderStats } = await supabase
    .from("orders")
    .select("*")
    .then((result) => {
      const orders = result.data || []
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      return {
        data: {
          total_orders: totalOrders,
          total_revenue: totalRevenue.toFixed(2),
          average_order_value: averageOrderValue.toFixed(2),
        },
      }
    })

  // Get top products using proper group_by syntax
  const { data: topProducts } = await supabase
    .from("order_items")
    .select(`
      product_id,
      product_name,
      quantity,
      product_price
    `)
    .then((result) => {
      const items = result.data || []

      // Manually group and aggregate the data
      const productMap = new Map()

      items.forEach((item) => {
        const productId = item.product_id
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            product_name: item.product_name,
            total_quantity: 0,
            total_revenue: 0,
          })
        }

        const product = productMap.get(productId)
        product.total_quantity += item.quantity
        product.total_revenue += Number(item.product_price) * item.quantity
      })

      // Convert map to array and sort by quantity
      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 5)

      return { data: topProducts }
    })

  // Get user statistics
  const { data: userStats } = await supabase
    .from("profiles")
    .select("*")
    .then((result) => {
      const users = result.data || []
      const totalUsers = users.length

      // Get users created in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const newUsers30d = users.filter((user) => {
        const createdAt = new Date(user.created_at)
        return createdAt >= thirtyDaysAgo
      }).length

      // Count active users (this is a placeholder - define "active" as needed)
      const activeUsers = users.length // Placeholder

      return {
        data: {
          total_users: totalUsers,
          new_users_30d: newUsers30d,
          active_users: activeUsers,
        },
      }
    })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <Tabs defaultValue="sales">
        <TabsList className="mb-6">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${orderStats?.total_revenue || 0}</div>
                <p className="text-xs text-gray-500">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderStats?.total_orders || 0}</div>
                <p className="text-xs text-gray-500">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${orderStats?.average_order_value || 0}</div>
                <p className="text-xs text-gray-500">+4.3% from last month</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold mb-4">Sales Over Time</h2>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="h-80 flex items-center justify-center text-gray-500">
                Sales chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
          <Card className="mb-8">
            <CardContent className="p-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts?.map((product) => (
                    <tr key={product.product_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.total_quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Number(product.total_revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold mb-4">Product Performance</h2>
          <Card>
            <CardContent className="p-6">
              <div className="h-80 flex items-center justify-center text-gray-500">
                Product performance chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.total_users || 0}</div>
                <p className="text-xs text-gray-500">+8.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Users (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.new_users_30d || 0}</div>
                <p className="text-xs text-gray-500">+12.5% from previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.active_users || 0}</div>
                <p className="text-xs text-gray-500">+4.3% from last month</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold mb-4">User Growth</h2>
          <Card>
            <CardContent className="p-6">
              <div className="h-80 flex items-center justify-center text-gray-500">
                User growth chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
