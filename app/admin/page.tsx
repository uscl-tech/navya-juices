import Link from "next/link"
import { createServerSupabase } from "@/lib/supabase"

export default async function AdminPage() {
  const supabase = createServerSupabase()

  // Get counts for dashboard
  const [
    { count: ordersCount },
    { count: productsCount },
    { count: usersCount },
    { count: challengesCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Orders" value={ordersCount || 0} link="/admin/orders" />
        <DashboardCard title="Products" value={productsCount || 0} link="/admin/products" />
        <DashboardCard title="Users" value={usersCount || 0} link="/admin/users" />
        <DashboardCard title="Challenges" value={challengesCount || 0} link="/admin/challenges" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
        </div>
        <div className="divide-y">
          {recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="font-medium">${order.total}</div>
                  <div>
                    <Link href={`/admin/orders/${order.id}`} className="text-primary hover:text-primary/80">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">No orders found</div>
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ title, value, link }: { title: string; value: number; link: string }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <Link href={link} className="text-sm text-primary hover:text-primary/80">
            View all
          </Link>
        </div>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      </div>
    </div>
  )
}
