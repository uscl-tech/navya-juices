"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingCart, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useMobile } from "@/hooks/use-mobile"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Benefits", href: "/benefits" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const isMobile = useMobile()
  const { getItemCount, setIsOpen: setCartOpen } = useCart()
  const currentItemCount = getItemCount()
  const { user, userRole, signOut } = useAuth()

  const baseNavItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Benefits", href: "/benefits" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const dynamicNavItems = [...baseNavItems]
  if (userRole === "admin") {
    dynamicNavItems.push({ name: "Admin", href: "/admin" })
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen, isMobile])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "glass-nav" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setCartOpen(false)}>
              <span className="text-2xl font-bold text-primary">Navya's</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {dynamicNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-foreground/80"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" aria-label="Shopping cart">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {currentItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {currentItemCount}
                    </span>
                  )}
                </div>
              </Button>
            </Link>

            {user ? (
              <>
                <Link href="/account" passHref>
                  <Button variant="ghost" className="hidden md:inline-flex">
                    My Account
                  </Button>
                </Link>
                <Button variant="ghost" onClick={signOut} className="hidden md:inline-flex">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" passHref>
                  <Button variant="outline" className="hidden md:inline-flex">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button variant="default" className="hidden md:inline-flex">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background md:hidden"
          >
            <div className="container h-full px-4 sm:px-6">
              <div className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <span className="text-2xl font-bold text-primary">Navya's</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="mt-8 grid gap-6 text-lg">
                {dynamicNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center py-3 ${
                      pathname === item.href ? "text-primary font-medium" : "text-foreground/80"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  className={`flex items-center py-3 ${
                    pathname === "/cart" ? "text-primary font-medium" : "text-foreground/80"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Cart ({currentItemCount})
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/account"
                      className={`flex items-center py-3 ${
                        pathname === "/account" ? "text-primary font-medium" : "text-foreground/80"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                      className="flex items-center py-3 text-foreground/80 text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`flex items-center py-3 ${
                        pathname === "/login" ? "text-primary font-medium" : "text-foreground/80"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className={`flex items-center py-3 ${
                        pathname === "/signup" ? "text-primary font-medium" : "text-foreground/80"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
