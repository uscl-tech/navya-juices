"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Package, Users, Award, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/challenges", label: "Challenges", icon: Award },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div className="w-64 bg-green-800 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8 p-2">
        <h1 className="text-xl font-bold">Navya's Admin</h1>
        <p className="text-sm text-green-200">Fresh Juices Management</p>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                isActive ? "bg-green-700 text-white" : "text-green-100 hover:text-white hover:bg-green-700/50",
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => signOut()}
        className="flex items-center px-4 py-3 text-sm rounded-md transition-colors text-green-100 hover:text-white hover:bg-green-700/50 mt-auto"
      >
        <LogOut className="mr-3 h-5 w-5" />
        Sign Out
      </button>
    </div>
  )
}
