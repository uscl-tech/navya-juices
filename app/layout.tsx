import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { CartProvider } from "@/context/cart-context" // Ensure this is imported
import { AuthProvider } from "@/context/auth-context" // Ensure this is imported
import { ThemeProvider } from "@/components/theme-provider" // Ensure this is imported
import { Navbar } from "@/components/navbar" // Ensure this is imported
import { Toaster } from "@/components/ui/toaster" // Ensure this is imported
import { Cart } from "@/components/cart" // Added import
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              {children}
              <Cart /> {/* Add the Cart component here */}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
