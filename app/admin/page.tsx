import type React from "react"
import Link from "next/link"
import { ShoppingCart, Users, Package, Award } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Orders"
          icon={<ShoppingCart className="w-6 h-6" />}
          href="/admin/orders"
          color="bg-blue-500"
        />
        <DashboardCard title="Users" icon={<Users className="w-6 h-6" />} href="/admin/users" color="bg-green-500" />
        <DashboardCard
          title="Products"
          icon={<Package className="w-6 h-6" />}
          href="/admin/products"
          color="bg-purple-500"
        />
        <DashboardCard
          title="Challenges"
          icon={<Award className="w-6 h-6" />}
          href="/admin/challenges"
          color="bg-yellow-500"
        />
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  icon,
  href,
  color,
}: {
  title: string
  icon: React.ReactNode
  href: string
  color: string
}) {
  return (
    <Link href={href} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
        <div className="ml-4">
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-sm text-gray-500">Manage {title.toLowerCase()}</p>
        </div>
      </div>
    </Link>
  )
}
