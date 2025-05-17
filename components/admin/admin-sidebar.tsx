"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Bell,
  MessageSquare,
  BarChart,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/challenges", label: "Challenges", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart },
  { href: "/admin/marketing", label: "Marketing", icon: Bell },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                isActive ? "bg-green-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-800",
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
