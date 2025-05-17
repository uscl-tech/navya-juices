"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, User, Leaf, Menu, Search, Heart, Settings, HelpCircle, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"

export function MobileFooter() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  // Don't show footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname?.startsWith(path)) return true
    return false
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Shop",
      href: "/products",
      icon: ShoppingBag,
    },
    {
      label: "Challenges",
      href: "/challenges",
      icon: Leaf,
    },
    {
      label: "Account",
      href: user ? "/account" : "/login",
      icon: User,
    },
  ]

  const moreItems = [
    {
      label: "Search",
      href: "/search",
      icon: Search,
    },
    {
      label: "Favorites",
      href: "/favorites",
      icon: Heart,
    },
    {
      label: "Help",
      href: "/help",
      icon: HelpCircle,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  // Add admin link if user is admin
  if (user) {
    moreItems.push({
      label: "Admin Dashboard",
      href: "/admin",
      icon: Settings,
    })
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t py-2 px-4">
      <div className="flex items-center justify-between">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center text-xs font-medium transition-colors",
              isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center h-auto p-0 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <Menu className="h-6 w-6 mb-1" />
              <span>More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
            <SheetHeader className="mb-4">
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-4">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-accent text-center"
                >
                  <item.icon className="h-6 w-6 mb-2" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}

              {user && (
                <Button
                  variant="ghost"
                  className="flex flex-col items-center justify-center h-auto p-4 rounded-lg hover:bg-accent"
                  onClick={() => {
                    signOut()
                    setOpen(false)
                  }}
                >
                  <LogOut className="h-6 w-6 mb-2" />
                  <span className="text-sm">Sign Out</span>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
