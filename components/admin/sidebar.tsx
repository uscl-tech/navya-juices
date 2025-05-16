"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Users, Package, Award, BarChart, Settings, LogOut } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const handleSignOut = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-green-600">Admin Dashboard</h1>
      </div>
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          <li>
            <Link
              href="/admin"
              className={`flex items-center p-3 rounded-md ${
                isActive("/admin") && pathname === "/admin"
                  ? "bg-green-50 text-green-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/admin/orders"
              className={`flex items-center p-3 rounded-md ${
                isActive("/admin/orders") ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              Orders
            </Link>
          </li>
          <li>
            <Link
              href="/admin/products"
              className={`flex items-center p-3 rounded-md ${
                isActive("/admin/products") ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Package className="w-5 h-5 mr-3" />
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/admin/users"
              className={`flex items-center p-3 rounded-md ${
                isActive("/admin/users") ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              Users
            </Link>
          </li>
          <li>
            <Link
              href="/admin/challenges"
              className={`flex items-center p-3 rounded-md ${
                isActive("/admin/challenges") ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Award className="w-5 h-5 mr-3" />
              Challenges
            </Link>
          </li>
          <li>
            <Link
              href="/admin/analytics"
              className={`flex items-center p-3 rounded-md ${
                isActive("/admin/analytics") ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart className="w-5 h-5 mr-3" />
              Analytics
            </Link>
          </li>
          <li>
            <Link
              href="/admin/settings"
              className={`flex items-center p-3 rounded-md ${
                isActive("/admin/settings") ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center p-3 w-full text-left rounded-md text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
