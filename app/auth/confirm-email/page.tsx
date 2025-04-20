"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmEmailPage() {
  return (
    <div className="container py-10 md:py-20">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="glass-card text-center">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription>
                We've sent you a confirmation email. Please check your inbox and click the confirmation link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you don't see the email, check your spam folder. The confirmation link will expire in 24 hours.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button asChild className="w-full">
                <Link href="/">
                  Return to Home
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <div className="text-center text-sm">
                Didn't receive the email?{" "}
                <Link href="/auth/sign-up" className="text-primary hover:underline">
                  Try again
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
