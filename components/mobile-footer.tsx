"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, ShoppingBag, User, Leaf, Menu, Heart, HelpCircle, LogOut, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context" // For cart icon/count if needed here

export function MobileFooter() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userRole, signOut, isLoading: isAuthLoading } = useAuth()
  const { getItemCount, toggleCart: toggleCartPanel } = useCart() // Use toggleCart from CartContext
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)

  const itemCount = getItemCount()

  // Hide footer on specific paths like admin, login, signup, or during auth loading
  if (
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    isAuthLoading // Also hide if auth state is still loading
  ) {
    return null
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname?.startsWith(path)) return true
    return false
  }

  // Primary navigation items for the footer bar
  const mainNavItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      action: () => router.push("/"),
    },
    {
      label: "Shop",
      href: "/products",
      icon: ShoppingBag,
      action: () => router.push("/products"),
    },
    {
      label: "Cart",
      icon: ShoppingBag, // Using ShoppingBag for cart, could be different
      action: () => toggleCartPanel(), // Open the slide-out cart panel
      isCart: true,
    },
    {
      label: "Account",
      href: user ? "/account" : "/login?redirect=/account",
      icon: User,
      action: () => router.push(user ? "/account" : "/login?redirect=/account"),
    },
  ]

  // Items for the "More" sheet
  const moreSheetNavItems = [
    { label: "Challenges", href: "/challenges", icon: Leaf },
    { label: "Benefits", href: "/benefits", icon: Heart }, // Example, adjust as needed
    { label: "About Us", href: "/about", icon: HelpCircle }, // Example
    { label: "Contact", href: "/contact", icon: User }, // Example
    // Conditional Admin Link
    ...(userRole === "admin" ? [{ label: "Admin", href: "/admin", icon: ShieldCheck }] : []),
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
      <div className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-auto p-1 text-xs font-medium transition-colors w-1/4", // Equal width
              item.href && isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
            onClick={item.action}
          >
            <div className="relative">
              <item.icon className="h-5 w-5 mb-0.5" />
              {item.isCart && itemCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="mt-0.5">{item.label}</span>
          </Button>
        ))}

        {/* "More" button that triggers a sheet */}
        <Sheet open={isMoreSheetOpen} onOpenChange={setIsMoreSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center h-auto p-1 text-xs font-medium text-muted-foreground hover:text-primary w-1/4" // Equal width
            >
              <Menu className="h-5 w-5 mb-0.5" />
              <span className="mt-0.5">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-xl p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <nav className="p-4 grid grid-cols-3 gap-4">
              {moreSheetNavItems.map((navItem) => (
                <Link
                  key={navItem.label}
                  href={navItem.href}
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-accent text-center"
                >
                  <navItem.icon className="h-6 w-6 mb-1.5 text-muted-foreground group-hover:text-primary" />
                  <span className="text-xs text-muted-foreground group-hover:text-primary">{navItem.label}</span>
                </Link>
              ))}
              {user && (
                <Button
                  variant="ghost"
                  className="flex flex-col items-center justify-center h-auto p-3 rounded-lg hover:bg-accent text-center col-span-1" // Or adjust span
                  onClick={() => {
                    signOut()
                    setIsMoreSheetOpen(false)
                  }}
                >
                  <LogOut className="h-6 w-6 mb-1.5 text-muted-foreground group-hover:text-primary" />
                  <span className="text-xs text-muted-foreground group-hover:text-primary">Sign Out</span>
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
