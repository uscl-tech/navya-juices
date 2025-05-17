"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Users, Package, Award, BarChart, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Challenges",
      href: "/admin/challenges",
      icon: Award,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 bg-white border-r h-screen sticky top-0 overflow-y-auto hidden md:block">
      <div className="p-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">Navya's Admin</span>
        </Link>
      </div>
      <nav className="px-4 pb-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:bg-gray-100",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 mt-auto">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
