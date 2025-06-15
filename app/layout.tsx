import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileFooter } from "@/components/mobile-footer" // Import MobileFooter
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { Cart } from "@/components/cart" // Import the slide-out Cart panel

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Navya’s Fresh Juices - Revitalize Your Life",
  description:
    "Discover the vibrant taste and health benefits of Navya’s freshly pressed wheatgrass juices and wellness shots.",
  applicationName: "Navya's Fresh Juices",
  authors: [{ name: "Navya's Team" }],
  keywords: ["wheatgrass", "fresh juice", "organic", "health", "wellness", "detox", "Navya's"],
  manifest: "/manifest.json", // Ensure your manifest.json is in the public folder
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#4CAF50", // A green accent color, adjust as needed
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: "device-width",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer /> {/* Desktop Footer */}
                <MobileFooter /> {/* Mobile Footer - renders conditionally inside */}
                <Cart /> {/* Global slide-out cart panel */}
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
